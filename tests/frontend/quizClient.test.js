import { describe, it, expect, vi, beforeEach } from 'vitest';

const get = vi.fn();
const post = vi.fn();
vi.mock('../../src/services/apiService', () => ({ default: { get, post, put: vi.fn(), delete: vi.fn() } }));

const { secondsRemaining } = await import('../../src/services/quizApi.js');
const progress = await import('../../src/utils/progressTracking.js');

beforeEach(() => {
  get.mockReset();
  post.mockReset();
});

describe('timer uses the server clock', () => {
  it('computes remaining seconds from expiresAt and the server clock offset', () => {
    const now = Date.now();
    const session = { expiresAt: new Date(now + 90_000).toISOString() };
    expect(secondsRemaining(session, 0)).toBeGreaterThanOrEqual(89);
    // Client clock 30s behind the server: 30s less remaining.
    expect(secondsRemaining(session, 30_000)).toBeLessThanOrEqual(60);
    expect(secondsRemaining({ expiresAt: new Date(now - 1000).toISOString() }, 0)).toBe(0);
    expect(secondsRemaining({ expiresAt: null }, 0)).toBeNull();
  });
});

describe('progress helpers are read-only and user-scoped by the server', () => {
  it('never sends a userId and never writes attempts', async () => {
    get.mockResolvedValueOnce([]);
    await progress.loadAttemptEvents();
    expect(get).toHaveBeenCalledWith('/progress');

    get.mockResolvedValueOnce({ weakTopics: { filters: { pctWrong: 50 } } });
    const weak = await progress.calculateWeakTopics(30, 5);
    expect(get).toHaveBeenLastCalledWith('/progress/weak-topics', { k: 30, minAttempts: 5 });
    expect(weak).toEqual({ filters: { pctWrong: 50 } });

    expect(post).not.toHaveBeenCalled();
    expect(progress).not.toHaveProperty('saveAttemptEvent');
  });

  it('score history prefers the server-computed result', async () => {
    get.mockResolvedValueOnce([
      { endTime: 2, mode: 'mock', result: { correct: 3, total: 10, attempted: 8 } },
      { endTime: 1, mode: 'practice', questionIds: ['a', 'b'], answers: { a: { isCorrect: true } } },
      { endTime: null, mode: 'timed' },
    ]);
    const history = await progress.loadScoreHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({ percent: 30, correct: 3, total: 10, attempted: 8 });
    expect(history[1]).toMatchObject({ percent: 50, correct: 1, total: 2 });
    expect(progress.bestScoreFromHistory(history).percent).toBe(50);
    expect(progress.bestScoreFromHistory([])).toBeNull();
  });
});
