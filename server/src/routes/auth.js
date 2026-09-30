import express from 'express';
import { User } from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import auth from '../middleware/auth.js';
import { signToken } from '../services/token.js';
import { setPassword, verifyPassword } from '../services/password.js';
import {
    isValidEmail,
    normalizeEmail,
    validateName,
    validateNewPassword,
} from '../utils/validation.js';

const GENERIC_LOGIN_FAILURE = 'Invalid email or password';
const CREDENTIAL_FIELDS = '+passwordHash +passwordScheme';

export function createAuthRouter({ limiters }) {
    const router = express.Router();

    // Register
    router.post('/register', limiters.register, async (req, res) => {
        try {
            const { name, email, password } = req.body || {};

            const nameError = validateName(name);
            if (nameError) return res.status(400).json({ error: nameError });

            const normalizedEmail = normalizeEmail(email);
            if (!isValidEmail(normalizedEmail)) {
                return res.status(400).json({ error: 'A valid email address is required' });
            }

            const passwordError = validateNewPassword(password);
            if (passwordError) return res.status(400).json({ error: passwordError });

            const existingUser = await User.findOne({ email: normalizedEmail }).lean();
            if (existingUser) {
                return res.status(409).json({ error: 'An account with this email already exists' });
            }

            const user = new User({ name: name.trim(), email: normalizedEmail });
            await setPassword(user, password);
            await user.save();

            await UserProgress.create({ user: user._id });

            res.status(201).json({ token: signToken(user), user: user.toJSON() });
        } catch (error) {
            console.error('Register error:', error.message);
            res.status(500).json({ error: 'Registration failed' });
        }
    });

    // Login
    router.post('/login', limiters.login, async (req, res) => {
        try {
            const { email, password } = req.body || {};
            const normalizedEmail = normalizeEmail(email);

            if (!normalizedEmail || typeof password !== 'string' || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const user = await User.findOne({ email: normalizedEmail }).select(CREDENTIAL_FIELDS);
            const { ok, needsUpgrade } = await verifyPassword(user, password);

            if (!user || !ok) {
                return res.status(401).json({ error: GENERIC_LOGIN_FAILURE });
            }

            // Bounded legacy migration: a successful legacy login is upgraded
            // to Argon2id immediately.
            if (needsUpgrade) {
                await setPassword(user, password);
            }
            user.lastLogin = Date.now();
            await user.save();

            res.json({ token: signToken(user), user: user.toJSON() });
        } catch (error) {
            console.error('Login error:', error.message);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    // Current user (authoritative role/profile from the database)
    router.get('/me', auth, async (req, res) => {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(401).json({ error: 'Authentication required' });
        res.json({ user: user.toJSON() });
    });

    // Update own profile (identity from the token, never from the body)
    router.put('/profile', auth, async (req, res) => {
        try {
            const { name, email } = req.body || {};
            const user = await User.findById(req.user.id);
            if (!user) return res.status(401).json({ error: 'Authentication required' });

            if (name !== undefined) {
                const nameError = validateName(name);
                if (nameError) return res.status(400).json({ error: nameError });
                user.name = name.trim();
            }

            if (email !== undefined) {
                const normalizedEmail = normalizeEmail(email);
                if (!isValidEmail(normalizedEmail)) {
                    return res.status(400).json({ error: 'A valid email address is required' });
                }
                const taken = await User.findOne({
                    email: normalizedEmail,
                    _id: { $ne: user._id },
                }).lean();
                if (taken) return res.status(409).json({ error: 'Email already in use' });
                user.email = normalizedEmail;
            }

            await user.save();
            res.json(user.toJSON());
        } catch (error) {
            console.error('Profile update error:', error.message);
            res.status(500).json({ error: 'Profile update failed' });
        }
    });

    // Change own password
    router.put('/password', auth, limiters.passwordChange, async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body || {};
            if (typeof currentPassword !== 'string' || !currentPassword) {
                return res.status(400).json({ error: 'Current password is required' });
            }
            const passwordError = validateNewPassword(newPassword);
            if (passwordError) return res.status(400).json({ error: passwordError });

            const user = await User.findById(req.user.id).select(CREDENTIAL_FIELDS);
            if (!user) return res.status(401).json({ error: 'Authentication required' });

            const { ok } = await verifyPassword(user, currentPassword);
            if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

            await setPassword(user, newPassword);
            await user.save();

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Password change error:', error.message);
            res.status(500).json({ error: 'Password change failed' });
        }
    });

    return router;
}
