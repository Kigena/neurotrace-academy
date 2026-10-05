import { describe, it, expect, vi } from 'vitest';
import { createResilientModel, isRetryable, DEFAULT_MODEL, DEFAULT_FALLBACK_MODEL } from '../src/services/geminiModel.js';

const fakeClient = (behaviors, calls = []) => ({
    getGenerativeModel: ({ model }) => ({
        startChat: () => ({
            sendMessage: async (message) => {
                calls.push(model);
                return behaviors[model](message);
            },
        }),
    }),
});
const httpError = (status, message = 'boom') => Object.assign(new Error(message), { status });

describe('Gemini model fallback', () => {
    it('uses the primary model when it works', async () => {
        const calls = [];
        const model = createResilientModel(fakeClient({ a: () => 'A', b: () => 'B' }, calls), { primary: 'a', fallback: 'b' });
        expect(await model.startChat({}).sendMessage('hi')).toBe('A');
        expect(calls).toEqual(['a']);
    });

    it('falls back on an overloaded (503) primary', async () => {
        const calls = [];
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const model = createResilientModel(fakeClient({ a: () => { throw httpError(503); }, b: () => 'B' }, calls), { primary: 'a', fallback: 'b' });
        expect(await model.startChat({}).sendMessage('hi')).toBe('B');
        expect(calls).toEqual(['a', 'b']);
    });

    it('falls back when the primary model has been retired (message only, no status)', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const retired = () => { throw new Error('This model models/x is no longer available'); };
        const model = createResilientModel(fakeClient({ a: retired, b: () => 'B' }), { primary: 'a', fallback: 'b' });
        expect(await model.startChat({}).sendMessage('hi')).toBe('B');
    });

    it('does not fall back on a non-retryable error such as a bad request', async () => {
        const calls = [];
        const model = createResilientModel(fakeClient({ a: () => { throw httpError(400, 'bad request'); }, b: () => 'B' }, calls), { primary: 'a', fallback: 'b' });
        await expect(model.startChat({}).sendMessage('hi')).rejects.toThrow('bad request');
        expect(calls).toEqual(['a']);
    });

    it('throws the last error when both models fail', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const model = createResilientModel(fakeClient({ a: () => { throw httpError(503, 'first'); }, b: () => { throw httpError(429, 'second'); } }), { primary: 'a', fallback: 'b' });
        await expect(model.startChat({}).sendMessage('hi')).rejects.toThrow('second');
    });

    it('does not retry the same model twice and has sensible defaults', () => {
        expect(createResilientModel({}, { primary: 'a', fallback: 'a' }).models).toEqual(['a']);
        expect(createResilientModel({}).models).toEqual([DEFAULT_MODEL, DEFAULT_FALLBACK_MODEL]);
        expect(isRetryable(httpError(429))).toBe(true);
        expect(isRetryable(httpError(401))).toBe(false);
    });
});
