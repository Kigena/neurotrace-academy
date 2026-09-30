import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/env.js';

export const JWT_ISSUER = 'neurolinea-api';
export const JWT_AUDIENCE = 'neurolinea-web';
export const JWT_ALGORITHM = 'HS256';
export const JWT_EXPIRES_IN = '7d';

// Only the user id is authoritative in the token. Role and profile data are
// always re-read from the database on each request.
export function signToken(user) {
    return jwt.sign(
        { userId: user._id.toString() },
        getJwtSecret(),
        {
            algorithm: JWT_ALGORITHM,
            expiresIn: JWT_EXPIRES_IN,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        }
    );
}

export function verifyToken(token) {
    return jwt.verify(token, getJwtSecret(), {
        algorithms: [JWT_ALGORITHM],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    });
}
