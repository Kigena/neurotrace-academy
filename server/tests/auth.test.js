import { describe, it, expect } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { setupTestDb, makeApp, registerUser, bearer } from './helpers.js';
import { User } from '../src/models/User.js';

setupTestDb();
const app = makeApp();

describe('signup', () => {
    it('creates an account, stores an Argon2id hash and never returns it', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Alice', email: 'Alice@Example.test', password: 'a-strong-password',
        });
        expect(res.status).toBe(201);
        expect(res.body.token).toBeTruthy();
        expect(res.body.user.email).toBe('alice@example.test');
        expect(res.body.user.passwordHash).toBeUndefined();
        expect(res.body.user.passwordScheme).toBeUndefined();
        expect(JSON.stringify(res.body)).not.toMatch(/argon2/);

        const stored = await User.findOne({ email: 'alice@example.test' }).select('+passwordHash +passwordScheme').lean();
        expect(stored.passwordHash.startsWith('$argon2id$')).toBe(true);
        expect(stored.passwordScheme).toBe('argon2id');
        expect(stored.passwordHash).not.toContain('a-strong-password');
        expect(stored.role).toBe('user');
    });

    it('rejects weak passwords, bad emails and duplicates', async () => {
        const weak = await request(app).post('/api/auth/register').send({ name: 'B', email: 'b@example.test', password: 'short' });
        expect(weak.status).toBe(400);
        const bad = await request(app).post('/api/auth/register').send({ name: 'B', email: 'not-an-email', password: 'long-enough-pw' });
        expect(bad.status).toBe(400);
        await registerUser(app, { email: 'dup@example.test' });
        const dup = await request(app).post('/api/auth/register').send({ name: 'D', email: 'dup@example.test', password: 'long-enough-pw' });
        expect(dup.status).toBe(409);
    });

    it('ignores a client-supplied role at signup', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Mallory', email: 'mallory@example.test', password: 'long-enough-pw', role: 'admin',
        });
        expect(res.status).toBe(201);
        expect(res.body.user.role).toBe('user');
    });
});

describe('login', () => {
    it('logs in with the correct password', async () => {
        const u = await registerUser(app, { email: 'login-ok@example.test', password: 'my-password-123' });
        const res = await request(app).post('/api/auth/login').send({ email: 'LOGIN-OK@example.test', password: 'my-password-123' });
        expect(res.status).toBe(200);
        expect(res.body.user._id).toBe(u.id);
        expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('returns the same generic 401 for wrong password and unknown email', async () => {
        await registerUser(app, { email: 'login-bad@example.test', password: 'my-password-123' });
        const wrong = await request(app).post('/api/auth/login').send({ email: 'login-bad@example.test', password: 'nope-nope-nope' });
        const unknown = await request(app).post('/api/auth/login').send({ email: 'nobody@example.test', password: 'nope-nope-nope' });
        expect(wrong.status).toBe(401);
        expect(unknown.status).toBe(401);
        expect(wrong.body).toEqual(unknown.body);
    });

    it('no longer accepts the stored hash itself as a credential (old client protocol)', async () => {
        const u = await registerUser(app, { email: 'pth@example.test', password: 'my-password-123' });
        const stored = await User.findById(u.id).select('+passwordHash').lean();
        const res = await request(app).post('/api/auth/login').send({ email: 'pth@example.test', passwordHash: stored.passwordHash });
        expect(res.status).toBe(400);
    });
});

describe('legacy SHA-256 accounts', () => {
    const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

    async function insertLegacyUser(email, password) {
        // Mirrors records written by the old client: hex(SHA-256(password)), no scheme field.
        const doc = await User.collection.insertOne({
            name: 'Legacy', email, passwordHash: sha(password), role: 'user', createdAt: new Date(),
        });
        return doc.insertedId.toString();
    }

    it('logs in once with the plaintext password and upgrades to Argon2id', async () => {
        const id = await insertLegacyUser('legacy@example.test', 'old-password-1');
        const res = await request(app).post('/api/auth/login').send({ email: 'legacy@example.test', password: 'old-password-1' });
        expect(res.status).toBe(200);
        expect(res.body.user._id).toBe(id); // user ID preserved

        const after = await User.findById(id).select('+passwordHash +passwordScheme').lean();
        expect(after.passwordScheme).toBe('argon2id');
        expect(after.passwordHash.startsWith('$argon2id$')).toBe(true);

        const again = await request(app).post('/api/auth/login').send({ email: 'legacy@example.test', password: 'old-password-1' });
        expect(again.status).toBe(200);
    });

    it('rejects a wrong password for a legacy account and leaves it unmigrated', async () => {
        const id = await insertLegacyUser('legacy2@example.test', 'old-password-2');
        const res = await request(app).post('/api/auth/login').send({ email: 'legacy2@example.test', password: 'wrong-password' });
        expect(res.status).toBe(401);
        const after = await User.findById(id).select('+passwordHash +passwordScheme').lean();
        expect(after.passwordScheme).toBeUndefined();
    });

    it('rejects presenting the legacy hash as the password (no pass-the-hash)', async () => {
        await insertLegacyUser('legacy3@example.test', 'old-password-3');
        const res = await request(app).post('/api/auth/login').send({ email: 'legacy3@example.test', password: sha('old-password-3') });
        expect(res.status).toBe(401);
    });
});

describe('rate limiting', () => {
    it('returns 429 after too many login attempts', async () => {
        const limited = makeApp({ rateLimits: { login: { limit: 3, windowMs: 60000 } } });
        await registerUser(limited, { email: 'rl@example.test' });
        const codes = [];
        for (let i = 0; i < 5; i++) {
            const r = await request(limited).post('/api/auth/login').send({ email: 'rl@example.test', password: 'wrong-password' });
            codes.push(r.status);
        }
        expect(codes.slice(0, 3)).toEqual([401, 401, 401]);
        expect(codes[3]).toBe(429);
    });
});

describe('JWT verification', () => {
    it('rejects missing, malformed, wrongly-signed and alg:none tokens', async () => {
        const u = await registerUser(app);
        const none = jwt.sign({ userId: u.id }, null, { algorithm: 'none' });
        const wrongKey = jwt.sign({ userId: u.id }, 'x'.repeat(40), { issuer: 'neurolinea-api', audience: 'neurolinea-web' });
        for (const headers of [{}, bearer('garbage'), bearer(none), bearer(wrongKey)]) {
            const res = await request(app).get('/api/auth/me').set(headers);
            expect(res.status).toBe(401);
        }
        const ok = await request(app).get('/api/auth/me').set(bearer(u.token));
        expect(ok.status).toBe(200);
        expect(ok.body.user._id).toBe(u.id);
    });
});

describe('profile and password updates', () => {
    it('rejects unauthenticated profile and password updates', async () => {
        const victim = await registerUser(app);
        const p = await request(app).put('/api/auth/profile').send({ userId: victim.id, name: 'Hacked' });
        expect(p.status).toBe(401);
        const pw = await request(app).put('/api/auth/password').send({ userId: victim.id, currentPassword: 'x', newPassword: 'y-long-enough' });
        expect(pw.status).toBe(401);
        const fresh = await User.findById(victim.id).lean();
        expect(fresh.name).not.toBe('Hacked');
    });

    it('ignores a body userId and only updates the caller', async () => {
        const attacker = await registerUser(app);
        const victim = await registerUser(app, { name: 'Victim Name' });
        const res = await request(app).put('/api/auth/profile').set(bearer(attacker.token)).send({ userId: victim.id, name: 'Renamed' });
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(attacker.id);
        expect((await User.findById(victim.id).lean()).name).toBe('Victim Name');
        expect((await User.findById(attacker.id).lean()).name).toBe('Renamed');
    });

    it('changes the password only with the correct current password', async () => {
        const u = await registerUser(app, { password: 'first-password' });
        const bad = await request(app).put('/api/auth/password').set(bearer(u.token)).send({ currentPassword: 'wrong-one', newPassword: 'second-password' });
        expect(bad.status).toBe(401);
        const good = await request(app).put('/api/auth/password').set(bearer(u.token)).send({ currentPassword: 'first-password', newPassword: 'second-password' });
        expect(good.status).toBe(200);
        const oldLogin = await request(app).post('/api/auth/login').send({ email: u.email, password: 'first-password' });
        expect(oldLogin.status).toBe(401);
        const newLogin = await request(app).post('/api/auth/login').send({ email: u.email, password: 'second-password' });
        expect(newLogin.status).toBe(200);
    });
});
