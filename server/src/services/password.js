import argon2 from 'argon2';
import crypto from 'crypto';

// Password hashing.
//
// New hashes: Argon2id with the library's default parameters
// (m=64 MiB, t=3, p=4) and a random per-hash salt.
//
// Legacy hashes: the old browser client stored hex(SHA-256(password)) with no
// salt. Those can still be verified once from the plaintext password the new
// client sends, after which the account is upgraded to Argon2id. The legacy
// hash itself is no longer accepted as a credential (no pass-the-hash).

const LEGACY_HEX = /^[a-f0-9]{64}$/i;
const ARGON2_OPTIONS = { type: argon2.argon2id };

// Used to equalise timing when the account does not exist.
let dummyHashPromise = null;
function dummyHash() {
    if (!dummyHashPromise) {
        dummyHashPromise = argon2.hash(crypto.randomBytes(16).toString('hex'), ARGON2_OPTIONS);
    }
    return dummyHashPromise;
}

export async function hashPassword(plain) {
    return argon2.hash(plain, ARGON2_OPTIONS);
}

export function detectScheme(user) {
    if (user.passwordScheme) return user.passwordScheme;
    if (typeof user.passwordHash === 'string' && user.passwordHash.startsWith('$argon2')) return 'argon2id';
    if (typeof user.passwordHash === 'string' && LEGACY_HEX.test(user.passwordHash)) return 'legacy-sha256';
    return 'unknown';
}

function legacySha256Hex(plain) {
    return crypto.createHash('sha256').update(plain, 'utf8').digest('hex');
}

/**
 * Verify a plaintext password against a user document that was loaded with
 * `+passwordHash +passwordScheme`.
 * Returns { ok, needsUpgrade }.
 */
export async function verifyPassword(user, plain) {
    if (!user || typeof plain !== 'string') {
        await argon2.verify(await dummyHash(), 'x').catch(() => false);
        return { ok: false, needsUpgrade: false };
    }

    const scheme = detectScheme(user);

    if (scheme === 'argon2id') {
        const ok = await argon2.verify(user.passwordHash, plain).catch(() => false);
        const needsUpgrade = ok && argon2.needsRehash(user.passwordHash, ARGON2_OPTIONS);
        return { ok, needsUpgrade };
    }

    if (scheme === 'legacy-sha256') {
        const expected = Buffer.from(user.passwordHash.toLowerCase(), 'hex');
        const actual = Buffer.from(legacySha256Hex(plain), 'hex');
        const ok = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
        return { ok, needsUpgrade: ok };
    }

    await argon2.verify(await dummyHash(), plain).catch(() => false);
    return { ok: false, needsUpgrade: false };
}

/**
 * Set a new Argon2id password on a user document (does not save).
 */
export async function setPassword(user, plain) {
    user.passwordHash = await hashPassword(plain);
    user.passwordScheme = 'argon2id';
    user.passwordUpdatedAt = new Date();
}
