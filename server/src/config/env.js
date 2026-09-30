// Centralised environment access. Values are never logged.

export const DEFAULT_CLIENT_ORIGINS = [
    'https://neurolinea.vercel.app',
    'http://localhost:5173',
    'http://localhost:5002',
];

export function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET must be set and at least 32 characters long');
    }
    return secret;
}

export function getAllowedOrigins() {
    const raw = process.env.CLIENT_URL;
    if (!raw) return DEFAULT_CLIENT_ORIGINS;
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Fail fast on missing required configuration. Reports variable NAMES only.
 */
export function assertRequiredEnv({ production = process.env.NODE_ENV === 'production' } = {}) {
    const missing = [];
    if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
    if (production && !process.env.MONGODB_URI) missing.push('MONGODB_URI');
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    getJwtSecret(); // length check
    if (production && !process.env.CLIENT_URL) {
        console.warn('⚠️ CLIENT_URL not set; using default allowed origins');
    }
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️ GEMINI_API_KEY not set; AI features will fail');
    }
}
