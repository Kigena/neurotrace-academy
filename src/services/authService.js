import storageService from "./storageService";

/**
 * Auth Service
 * Manages user profiles and active session
 * Now supports secure email/password authentication
 */

const USERS_KEY = "neurotrace_users_v1";
const SESSION_KEY = "neurotrace_active_session_v1";

class AuthService {
    constructor() {
        this.currentUser = null;
        this.tryRestoreSession();
    }

    /**
     * Restore session from storage
     * This remains synchronous for initial load, but validation happens async if needed later
     */
    tryRestoreSession() {
        const session = storageService.constructor.getGlobalItem(SESSION_KEY);
        if (session && session.userId) {
            const users = this.getUsers();
            const user = users.find((u) => u.id === session.userId);
            if (user) {
                this.currentUser = user;
                storageService.setUserId(user.id);
                return user;
            }
        }
        return null;
    }

    /**
     * Get all registered users
     */
    getUsers() {
        return storageService.constructor.getGlobalItem(USERS_KEY, []);
    }

    /**
     * Helper: Hash password using Web Crypto API
     */
    async _hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Create a new user profile with email and password
     */
    async createUser(name, email, password) {
        const users = this.getUsers();
        const normalizedEmail = email.toLowerCase().trim();

        // Check for duplicate email
        if (users.some((u) => u.email === normalizedEmail)) {
            throw new Error("User with this email already exists");
        }

        const passwordHash = await this._hashPassword(password);

        const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: name.trim(),
            email: normalizedEmail,
            passwordHash: passwordHash,
            createdAt: Date.now(),
            lastLogin: null
        };

        users.push(newUser);
        storageService.constructor.setGlobalItem(USERS_KEY, users);

        // Auto-login
        return this._setSession(newUser);
    }

    /**
     * Login with email and password
     */
    async login(email, password) {
        const users = this.getUsers();
        const normalizedEmail = email.toLowerCase().trim();
        const user = users.find((u) => u.email === normalizedEmail);

        if (!user) {
            throw new Error("Invalid email or password");
        }

        // Verify password
        const inputHash = await this._hashPassword(password);

        // For legacy users without passwordHash (if any), this will fail securely
        if (user.passwordHash !== inputHash) {
            throw new Error("Invalid email or password");
        }

        return this._setSession(user);
    }

    /**
     * Internal: Set active session
     */
    _setSession(user) {
        // Update last login
        const users = this.getUsers();
        user.lastLogin = Date.now();
        const updatedUsers = users.map(u => u.id === user.id ? user : u);
        storageService.constructor.setGlobalItem(USERS_KEY, updatedUsers);

        // Set session
        this.currentUser = user;
        storageService.setUserId(user.id);
        storageService.constructor.setGlobalItem(SESSION_KEY, { userId: user.id });

        return user;
    }

    /**
     * Logout
     */
    logout() {
        this.currentUser = null;
        storageService.setUserId(null);
        storageService.constructor.setGlobalItem(SESSION_KEY, null);
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

export default new AuthService();
