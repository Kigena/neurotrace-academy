// Simple auth middleware
// Extracts user info from Authorization header (Bearer token with userId)
// or from x-user-id header as fallback

import { User } from '../models/User.js';

const auth = async (req, res, next) => {
    try {
        // Check for Authorization header (Bearer <userId>)
        const authHeader = req.headers.authorization;
        let userId = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            userId = authHeader.substring(7); // Remove 'Bearer ' prefix
        } else if (req.headers['x-user-id']) {
            // Fallback to x-user-id header
            userId = req.headers['x-user-id'];
        }

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ error: 'Invalid authentication token' });
        }

        // Attach user to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

export default auth;
