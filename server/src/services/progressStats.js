// Per-user progress statistics. Callers must pass only the authenticated
// user's AttemptEvents.

/**
 * Weak topics (rule unchanged from the former client implementation):
 *   - consider each tag's most recent `k` attempts
 *   - require at least `minAttempts` attempts
 *   - weak when accuracy < 70%
 *   - trend = accuracy(last 10) - accuracy(previous 10)
 */
export function computeWeakTopics(events, k = 30, minAttempts = 10) {
    const byTag = {};
    for (const e of events) {
        for (const tag of e.topicTags || []) {
            (byTag[tag] ||= []).push(e);
        }
    }

    const weak = {};
    for (const [tag, tagEvents] of Object.entries(byTag)) {
        const sorted = [...tagEvents].sort((a, b) => b.timestamp - a.timestamp);
        const recent = sorted.slice(0, k);
        if (recent.length < minAttempts) continue;

        const correct = recent.filter((e) => e.isCorrect).length;
        const accuracy = correct / recent.length;
        if (accuracy >= 0.7) continue;

        const acc = (list) => (list.length ? list.filter((e) => e.isCorrect).length / list.length : 0);
        const last10Accuracy = acc(sorted.slice(0, 10));
        const prev10Accuracy = acc(sorted.slice(10, 20));
        const weakScore = 1 - accuracy;

        weak[tag] = {
            accuracy: Math.round(accuracy * 100),
            weakScore: Math.round(weakScore * 100),
            wrong: recent.length - correct,
            total: recent.length,
            pctWrong: Math.round(weakScore * 100),
            attempts: recent.length,
            totalAttempts: tagEvents.length,
            trend: Math.round((last10Accuracy - prev10Accuracy) * 100),
            last10Accuracy: Math.round(last10Accuracy * 100),
            prev10Accuracy: Math.round(prev10Accuracy * 100),
        };
    }
    return weak;
}

export function computeTotals(events) {
    const correct = events.filter((e) => e.isCorrect).length;
    return {
        totalAttempts: events.length,
        correct,
        accuracy: events.length ? Math.round((correct / events.length) * 100) : 0,
        totalTimeMs: events.reduce((s, e) => s + (e.timeMs || 0), 0),
    };
}
