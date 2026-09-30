import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { io as ioClient } from 'socket.io-client';
import { setupTestDb, makeApp, registerUser } from './helpers.js';
import { initializeSocket } from '../src/socket.js';
import Message from '../src/models/Message.js';

setupTestDb();

let httpServer;
let url;
let alice;
let bob;
let carol;
const clients = [];

beforeAll(async () => {
    const app = makeApp();
    httpServer = createServer(app);
    initializeSocket(httpServer);
    await new Promise((resolve) => httpServer.listen(0, resolve));
    url = `http://localhost:${httpServer.address().port}`;
    alice = await registerUser(app, { name: 'Alice' });
    bob = await registerUser(app, { name: 'Bob' });
    carol = await registerUser(app, { name: 'Carol' });
});

afterAll(async () => {
    clients.forEach((c) => c.close());
    await new Promise((resolve) => httpServer.close(resolve));
});

function connect(token) {
    const socket = ioClient(url, { auth: token ? { token } : undefined, transports: ['websocket'], reconnection: false });
    clients.push(socket);
    return new Promise((resolve, reject) => {
        socket.on('connect', () => resolve(socket));
        socket.on('connect_error', (err) => reject(err));
    });
}

const received = (socket, event, ms = 700) => new Promise((resolve) => {
    const got = [];
    socket.on(event, (m) => got.push(m));
    setTimeout(() => resolve(got), ms);
});

describe('socket authentication', () => {
    it('rejects connections without a valid token', async () => {
        await expect(connect(null)).rejects.toThrow(/unauthorized/);
        await expect(connect('not-a-jwt')).rejects.toThrow(/unauthorized/);
    });

    it('accepts a valid token', async () => {
        const s = await connect(alice.token);
        expect(s.connected).toBe(true);
    });
});

describe('private channels', () => {
    it("cannot join another user's private channel by claiming their userId", async () => {
        const eve = await connect(alice.token);
        // Try to become Bob.
        eve.emit('user:online', { userId: bob.id, userName: 'Bob' });
        const carolSocket = await connect(carol.token);

        const eveInbox = received(eve, 'message:received');
        carolSocket.emit('message:private', { recipientId: bob.id, content: 'for bob only' });
        expect((await eveInbox).map((m) => m.content)).not.toContain('for bob only');
    });

    it('delivers to the real recipient, and sender identity comes from the token', async () => {
        const bobSocket = await connect(bob.token);
        const aliceSocket = await connect(alice.token);
        const bobInbox = received(bobSocket, 'message:received');
        aliceSocket.emit('message:private', { senderId: carol.id, senderName: 'Carol (spoofed)', recipientId: bob.id, content: 'hello bob' });
        const got = await bobInbox;
        const msg = got.find((m) => m.content === 'hello bob');
        expect(msg).toBeTruthy();
        expect(msg.senderId).toBe(alice.id);
        expect(msg.senderName).toBe('Alice');
        const stored = await Message.findOne({ content: 'hello bob' }).lean();
        expect(stored.senderId).toBe(alice.id);
    });

    it('does not broadcast AI conversations to other users', async () => {
        const aliceSocket = await connect(alice.token);
        const bobSocket = await connect(bob.token);
        const bobSees = received(bobSocket, 'message:ai', 1000);
        const aliceSees = received(aliceSocket, 'message:ai', 1000);
        aliceSocket.emit('message:ai', { content: 'private question to the tutor' });
        expect((await bobSees).map((m) => m.content)).not.toContain('private question to the tutor');
        expect((await aliceSees).map((m) => m.content)).toContain('private question to the tutor');
    });
});
