// Authentication / authorization middleware.
//
// Identity comes only from a verified JWT; the user's role is always read
// from the database, never from the token or the client.

import { User } from '../models/User.js';
import { verifyToken } from '../services/token.js';
import { isObjectIdLike } from '../utils/validation.js';

function extractBearer(req) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return null;
    return header.substring(7).trim() || null;
}

/**
 * Resolve a token to the request user shape, or null if invalid.
 */
export async function resolveUserFromToken(token) {
    if (!token) return null;
    let decoded;
    try {
        decoded = verifyToken(token);
    } catch {
        return null;
    }
    if (!isObjectIdLike(decoded?.userId)) return null;
    const user = await User.findById(decoded.userId).lean();
    if (!user) return null;
    return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role || 'user',
    };
}

const auth = async (req, res, next) => {
    try {
        const token = extractBearer(req);
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const user = await resolveUserFromToken(token);
        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

/**
 * Attach req.user when a valid token is present; never rejects.
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const token = extractBearer(req);
        req.user = token ? await resolveUserFromToken(token) : null;
    } catch {
        req.user = null;
    }
    next();
};

/**
 * Must run after `auth`. Role is the database value set by `auth`.
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

export const requireAuth = auth;
export default auth;
