/**
 * Progress Tracking with AttemptEvent structure
 * Stores attempt history events for analytics and weak-topic calculation
 * Persists via API
 */

import apiService from "../services/apiService";
import storageService from "../services/storageService";

const ATTEMPT_EVENTS_KEY = "attempt_events_v1";
const SCORE_HISTORY_KEY = "score_history_v1";
const BEST_SCORE_KEY = "best_score_v1";

/**
 * Save an attempt event
 */
export async function saveAttemptEvent(event) {
  try {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now()
    };

    // Save to API
    await apiService.post('/progress', enrichedEvent);

    // Also save locally for offline/cache if needed, but for now we rely on API
    // We can append to local cache to keep it in sync without full reload
    const events = storageService.getItem(ATTEMPT_EVENTS_KEY, []);
    events.push(enrichedEvent);
    // Limit local storage size
    if (events.length > 100) events.splice(0, events.length - 100);
    storageService.setItem(ATTEMPT_EVENTS_KEY, events);

    return true;
  } catch (e) {
    console.error("Failed to save attempt event:", e);
    // Fallback?
    return false;
  }
}

/**
 * Load all attempt events
 */
export async function loadAttemptEvents() {
  try {
    const events = await apiService.get('/progress');
    // Update local cache
    storageService.setItem(ATTEMPT_EVENTS_KEY, events);
    return events;
  } catch (err) {
    console.warn("Failed to load progress from API, using cache", err);
    return storageService.getItem(ATTEMPT_EVENTS_KEY, []);
  }
}

/**
 * Calculate weak topics using recent-weighted accuracy
 */
export async function calculateWeakTopics(k = 30, minAttempts = 10) {
  const events = await loadAttemptEvents();

  // Group events by tag
  const tagStats = {};

  events.forEach((event) => {
    event.topicTags.forEach((tag) => {
      if (!tagStats[tag]) {
        tagStats[tag] = [];
      }
      tagStats[tag].push(event);
    });
  });

  const weakTopics = {};

  Object.entries(tagStats).forEach(([tag, tagEvents]) => {
    // Sort by timestamp (most recent first)
    const sorted = [...tagEvents].sort((a, b) => b.timestamp - a.timestamp);

    // Take last K attempts
    const recent = sorted.slice(0, k);

    if (recent.length < minAttempts) {
      return;
    }

    // Calculate accuracy
    const correct = recent.filter((e) => e.isCorrect).length;
    const accuracy = correct / recent.length;

    // Weak topic: accuracy < 70% AND attempts ≥ 10
    if (accuracy >= 0.70 || recent.length < 10) {
      return;
    }

    const weakScore = 1 - accuracy;

    // Calculate trend (last 10 vs previous 10)
    const last10 = sorted.slice(0, 10);
    const prev10 = sorted.slice(10, 20);

    const last10Accuracy = last10.length > 0
      ? last10.filter((e) => e.isCorrect).length / last10.length
      : 0;
    const prev10Accuracy = prev10.length > 0
      ? prev10.filter((e) => e.isCorrect).length / prev10.length
      : 0;

    const trend = last10Accuracy - prev10Accuracy;
    const wrong = recent.length - correct;

    weakTopics[tag] = {
      accuracy: Math.round(accuracy * 100),
      weakScore: Math.round(weakScore * 100),
      wrong: wrong,
      total: recent.length,
      pctWrong: Math.round(weakScore * 100),
      attempts: recent.length,
      totalAttempts: tagEvents.length,
      trend: Math.round(trend * 100),
      last10Accuracy: Math.round(last10Accuracy * 100),
      prev10Accuracy: Math.round(prev10Accuracy * 100),
    };
  });

  return weakTopics;
}

/**
 * Get progress by domain
 */
export async function getProgressByDomain() {
  const events = await loadAttemptEvents();
  const domainStats = {};

  events.forEach((event) => {
    if (!domainStats[event.domainId]) {
      domainStats[event.domainId] = { correct: 0, total: 0 };
    }
    domainStats[event.domainId].total++;
    if (event.isCorrect) domainStats[event.domainId].correct++;
  });

  return domainStats;
}

/**
 * Get progress by subsection (sectionId)
 */
export async function getProgressBySubsection() {
  const events = await loadAttemptEvents();
  const subsectionStats = {};

  events.forEach((event) => {
    if (!event.sectionId) return;

    if (!subsectionStats[event.sectionId]) {
      subsectionStats[event.sectionId] = { correct: 0, total: 0 };
    }
    subsectionStats[event.sectionId].total++;
    if (event.isCorrect) subsectionStats[event.sectionId].correct++;
  });

  const result = Object.entries(subsectionStats).map(([sectionId, stats]) => {
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return {
      sectionId,
      accuracy,
      attempts: stats.total,
      isWeak: accuracy < 70,
    };
  });

  result.sort((a, b) => a.accuracy - b.accuracy);

  return result;
}

/**
 * Get progress by section
 */
export async function getProgressBySection() {
  const events = await loadAttemptEvents();
  const sectionStats = {};

  events.forEach((event) => {
    if (!sectionStats[event.sectionId]) {
      sectionStats[event.sectionId] = { correct: 0, total: 0 };
    }
    sectionStats[event.sectionId].total++;
    if (event.isCorrect) sectionStats[event.sectionId].correct++;
  });

  return sectionStats;
}

/**
 * Get progress by difficulty
 */
export async function getProgressByDifficulty() {
  const events = await loadAttemptEvents();
  const difficultyStats = {};

  events.forEach((event) => {
    if (!difficultyStats[event.difficulty]) {
      difficultyStats[event.difficulty] = { correct: 0, total: 0 };
    }
    difficultyStats[event.difficulty].total++;
    if (event.isCorrect) difficultyStats[event.difficulty].correct++;
  });

  return difficultyStats;
}

/**
 * Clear all attempt events
 */
export function clearAttemptEvents() {
  // TODO: Add API endpoint for clearing if needed
  return storageService.removeItem(ATTEMPT_EVENTS_KEY);
}

// --- Score History ---

/**
 * Add a score to history
 */
export async function addScoreToHistory(scoreRecord) {
  // For now we just use local storage for score history list as attempts are the source of truth
  // But ideally we'd have a /scores endpoint.
  // To match the task, we'll keep this local or just rely on attempts aggregation?
  // The prompt asked for "database management", so let's stick to storing what we can.
  // Since we don't have a specific Score model yet (only AttemptEvent and QuizSession),
  // we can rely on QuizSession for history.

  // Fallback to local storage for now to avoid breaking UI that expects this list
  try {
    const history = storageService.getItem(SCORE_HISTORY_KEY, []);
    history.unshift({ ...scoreRecord, timestamp: Date.now() });
    if (history.length > 100) history.splice(100);
    storageService.setItem(SCORE_HISTORY_KEY, history);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Load score history
 */
export async function loadScoreHistory() {
  // Fallback to local
  return storageService.getItem(SCORE_HISTORY_KEY, []);
}

/**
 * Get best score
 */
export function getBestScore() {
  return storageService.getItem(BEST_SCORE_KEY, null);
}

/**
 * Save best score
 */
export async function saveBestScore(scoreRecord) {
  // Local only for now as it's a derived stat
  try {
    const currentBest = getBestScore();
    const newPercent = scoreRecord.percent || 0;

    if (!currentBest || newPercent > (currentBest.percent || 0)) {
      const bestRecord = {
        ...scoreRecord,
        timestamp: scoreRecord.timestamp || Date.now(),
      };
      storageService.setItem(BEST_SCORE_KEY, bestRecord);
      return bestRecord;
    }
    return currentBest;
  } catch (e) {
    return null;
  }
}
