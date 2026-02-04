// Simple auth middleware
// Verifies JWT tokens and attaches user info to request

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const auth = async (req, res, next) => {
    try {
        // Check for Authorization header (Bearer <token>)
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach user to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'user'
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

export default auth;
