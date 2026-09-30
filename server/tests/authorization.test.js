import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { setupTestDb, makeApp, registerUser, makeAdmin, bearer, seedFixtureBank } from './helpers.js';
import Message from '../src/models/Message.js';
import ChatRoom from '../src/models/ChatRoom.js';
import { ChatMessage } from '../src/models/ChatMessage.js';
import CommunityCase from '../src/models/CommunityCase.js';
import { QuizSession } from '../src/models/QuizSession.js';
import { AttemptEvent } from '../src/models/AttemptEvent.js';

setupTestDb();
const app = makeApp();

let alice;
let bob;
let carol;

beforeAll(async () => {
    await seedFixtureBank(20);
    alice = await registerUser(app, { name: 'Alice' });
    bob = await registerUser(app, { name: 'Bob' });
    carol = await registerUser(app, { name: 'Carol' });
});

async function startPractice(user, n = 5) {
    const res = await request(app).post('/api/quiz/sessions').set(bearer(user.token))
        .send({ kind: 'custom', mode: 'practice', questionCount: n });
    expect(res.status).toBe(201);
    return res.body;
}

describe('unauthenticated access is rejected', () => {
    const routes = [
        ['get', '/api/progress'],
        ['get', '/api/progress/weak-topics'],
        ['get', '/api/sessions'],
        ['get', '/api/sessions/anything'],
        ['post', '/api/progress'],
        ['post', '/api/quiz/sessions'],
        ['get', '/api/quiz/sessions/active'],
        ['get', '/api/quiz/sessions/history'],
        ['get', '/api/chat/messages?type=public'],
        ['get', '/api/chat/rooms'],
        ['post', '/api/chat/rooms'],
        ['get', '/api/chat/users/search?query=al'],
        ['get', '/api/chat/history'],
        ['delete', '/api/chat/history'],
        ['post', '/api/chat/message'],
        ['post', '/api/chat/ai-context'],
        ['post', '/api/chat/upload'],
        ['put', '/api/auth/profile'],
        ['put', '/api/auth/password'],
    ];
    for (const [method, path] of routes) {
        it(`${method.toUpperCase()} ${path}`, async () => {
            const res = await request(app)[method](path).send({});
            expect([401, 404]).toContain(res.status);
            if (path !== '/api/progress' || method !== 'post') expect(res.status).toBe(401);
        });
    }
});

describe('the legacy client write endpoints are gone', () => {
    it('POST /api/progress, POST /api/sessions and PUT /api/sessions/:id no longer exist', async () => {
        const a = await request(app).post('/api/progress').set(bearer(alice.token)).send({ questionId: 'x', isCorrect: true });
        const b = await request(app).post('/api/sessions').set(bearer(alice.token)).send({ sessionId: 's', mode: 'practice', startTime: 1 });
        const c = await request(app).put('/api/sessions/s').set(bearer(alice.token)).send({ userId: bob.id });
        const d = await request(app).post('/api/quiz/sessions/complete').set(bearer(alice.token)).send({ score: { percent: 100, total: 10 } });
        for (const r of [a, b, c, d]) expect(r.status).toBe(404);
        expect(await AttemptEvent.countDocuments({ questionId: 'x' })).toBe(0);
    });
});

describe('quiz sessions and attempts are private', () => {
    it("user A cannot read, answer, submit, review or abandon user B's session", async () => {
        const bobSession = await startPractice(bob);
        const sid = bobSession.session.sessionId;
        const qid = bobSession.questions[0].questionId;

        const reads = [
            request(app).get(`/api/sessions/${sid}`).set(bearer(alice.token)),
            request(app).get(`/api/quiz/sessions/${sid}/review`).set(bearer(alice.token)),
            request(app).post(`/api/quiz/sessions/${sid}/answers`).set(bearer(alice.token)).send({ questionId: qid, selectedIndex: 0 }),
            request(app).post(`/api/quiz/sessions/${sid}/submit`).set(bearer(alice.token)),
            request(app).post(`/api/quiz/sessions/${sid}/abandon`).set(bearer(alice.token)),
        ];
        for (const r of await Promise.all(reads)) expect(r.status).toBe(404);

        const stored = await QuizSession.findOne({ sessionId: sid }).lean();
        expect(stored.status).toBe('active');
        expect(Object.keys(stored.answers || {})).toHaveLength(0);
        expect(await AttemptEvent.countDocuments({ userId: alice.id })).toBe(0);
    });

    it('session and progress lists ignore a userId query parameter', async () => {
        const s = await startPractice(carol, 3);
        await request(app).post(`/api/quiz/sessions/${s.session.sessionId}/answers`).set(bearer(carol.token))
            .send({ questionId: s.questions[0].questionId, selectedIndex: 1 });

        const sessions = await request(app).get(`/api/sessions?userId=${carol.id}`).set(bearer(alice.token));
        expect(sessions.status).toBe(200);
        expect(sessions.body.every((x) => x.userId === alice.id)).toBe(true);

        const progress = await request(app).get(`/api/progress?userId=${carol.id}`).set(bearer(alice.token));
        expect(progress.status).toBe(200);
        expect(progress.body.every((e) => e.userId === alice.id)).toBe(true);

        const own = await request(app).get('/api/progress').set(bearer(carol.token));
        expect(own.body.length).toBe(1);
        expect(own.body[0].userId).toBe(carol.id);
    });
});

describe('chat', () => {
    it("cannot read another pair's private messages", async () => {
        await Message.create({ type: 'private', senderId: bob.id, recipientId: carol.id, senderName: 'Bob', content: 'secret bob->carol' });
        // Alice asks for "private messages with carol": only alice<->carol is returned.
        const res = await request(app).get(`/api/chat/messages?type=private&userId=${bob.id}&otherUserId=${carol.id}`).set(bearer(alice.token));
        expect(res.status).toBe(200);
        expect(res.body.map((m) => m.content)).not.toContain('secret bob->carol');

        const carolView = await request(app).get(`/api/chat/messages?type=private&otherUserId=${bob.id}`).set(bearer(carol.token));
        expect(carolView.body.map((m) => m.content)).toContain('secret bob->carol');
    });

    it("cannot read another user's AI conversation", async () => {
        await Message.create({ type: 'ai', senderId: 'ai-bot', recipientId: bob.id, senderName: 'AI', content: 'ai reply for bob' });
        const res = await request(app).get(`/api/chat/messages?type=ai&userId=${bob.id}`).set(bearer(alice.token));
        expect(res.body.map((m) => m.content)).not.toContain('ai reply for bob');
    });

    it('cannot read a room the user is not a member of', async () => {
        const room = await ChatRoom.create({ name: 'Bob and Carol', createdBy: bob.id, participants: [{ userId: bob.id, role: 'admin' }, { userId: carol.id }] });
        await Message.create({ type: 'group', roomId: room._id, senderId: bob.id, content: 'room secret' });
        const denied = await request(app).get(`/api/chat/messages?roomId=${room._id}`).set(bearer(alice.token));
        expect(denied.status).toBe(403);
        const allowed = await request(app).get(`/api/chat/messages?roomId=${room._id}`).set(bearer(carol.token));
        expect(allowed.status).toBe(200);
        expect(allowed.body.map((m) => m.content)).toContain('room secret');
    });

    it('room creation uses the caller as creator, ignoring createdBy', async () => {
        const res = await request(app).post('/api/chat/rooms').set(bearer(alice.token)).send({ name: 'R', createdBy: bob.id, participants: [carol.id] });
        expect(res.status).toBe(201);
        expect(res.body.createdBy).toBe(alice.id);
        expect(res.body.participants.find((p) => p.role === 'admin').userId).toBe(alice.id);
    });

    it("cannot list or delete another user's chatbot history", async () => {
        await ChatMessage.create({ userId: bob.id, role: 'user', content: 'bob legacy' });
        const list = await request(app).get(`/api/chat/history?userId=${bob.id}`).set(bearer(alice.token));
        expect(list.body.map((m) => m.content)).not.toContain('bob legacy');
        await request(app).delete(`/api/chat/history?userId=${bob.id}`).set(bearer(alice.token));
        expect(await ChatMessage.countDocuments({ userId: bob.id })).toBe(1);
    });

    it('user search does not expose email addresses', async () => {
        const res = await request(app).get('/api/chat/users/search?query=Bob').set(bearer(alice.token));
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(JSON.stringify(res.body)).not.toMatch(/@example\.test/);
    });

    it('rejects disallowed upload types', async () => {
        const res = await request(app).post('/api/chat/upload').set(bearer(alice.token))
            .attach('file', Buffer.from('<script>alert(1)</script>'), { filename: 'x.html', contentType: 'text/html' });
        expect(res.status).toBe(400);
        const svg = await request(app).post('/api/chat/upload').set(bearer(alice.token))
            .attach('file', Buffer.from('<svg onload="alert(1)"/>'), { filename: 'x.png', contentType: 'image/svg+xml' });
        expect(svg.status).toBe(400);
    });
});

describe('admin authorization', () => {
    it('admin routes require a database admin role (token claims and client state are irrelevant)', async () => {
        const denied = await request(app).get('/api/admin/users').set(bearer(alice.token));
        expect(denied.status).toBe(403);

        for (const path of ['/api/gamification/initialize-achievements', '/api/gamification/migrate-existing-activities']) {
            const r = await request(app).post(path).set(bearer(alice.token));
            expect(r.status).toBe(403);
        }
        const dbg = await request(app).get('/api/gamification/debug-migration').set(bearer(alice.token));
        expect(dbg.status).toBe(403);

        const admin = await registerUser(app, { name: 'Admin' });
        await makeAdmin(admin.id);
        // Same token as before promotion: the role is read from the DB per request.
        const allowed = await request(app).get('/api/admin/users').set(bearer(admin.token));
        expect(allowed.status).toBe(200);
        expect(JSON.stringify(allowed.body)).not.toMatch(/passwordHash|\$argon2/);
    });
});

describe('community cases', () => {
    it('pending cases are visible only to their author and admins', async () => {
        const c = await CommunityCase.create({ title: 'Pending case', author: bob.id, status: 'pending', history: 'h' });
        const anon = await request(app).get(`/api/cases/${c._id}`);
        expect(anon.status).toBe(404);
        const other = await request(app).get(`/api/cases/${c._id}`).set(bearer(alice.token));
        expect(other.status).toBe(404);
        const author = await request(app).get(`/api/cases/${c._id}`).set(bearer(bob.token));
        expect(author.status).toBe(200);
    });
});
