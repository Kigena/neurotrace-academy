/**
 * Quiz Session Management
 * Handles quiz session state, selection, shuffling, and persistence (via API)
 */

import apiService from "../services/apiService";
import storageService from "../services/storageService";

const SESSION_STORAGE_KEY = "quiz_session_v1";

/**
 * Create a new quiz session
 */
export async function createQuizSession(config) {
  const {
    mode = "practice", // "practice" | "timed" | "mock"
    domains = [],
    sections = [],
    tags = [],
    difficulty = [],
    shuffle = true,
    questionCount = 10,
    timeLimitSec = null,
    questions = [],
    weakTopics = {}, // Optional: boost weak topics
  } = config;

  // Filter questions by config
  let filtered = questions.filter((q) => {
    if (domains.length > 0 && !domains.includes(q.domainId)) return false;
    if (sections.length > 0 && !sections.includes(q.sectionId)) return false;
    if (difficulty.length > 0 && !difficulty.includes(q.difficulty)) return false;
    if (tags.length > 0 && !tags.some((tag) => q.topicTags.includes(tag))) return false;
    return true;
  });

  // Optionally weight weak topics higher
  if (Object.keys(weakTopics).length > 0) {
    filtered = weightWeakTopics(filtered, weakTopics);
  }

  // Take N questions
  const count = Math.min(questionCount, filtered.length);
  let selected = filtered.slice(0, count);

  // Shuffle if requested
  if (shuffle) {
    selected = shuffleArray([...selected]);
  }

  const questionIds = selected.map((q) => q.id);

  const sessionData = {
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    mode,
    questionIds,
    currentIndex: 0,
    answers: {},
    startTime: Date.now(),
    endTime: null,
    timeLimitSec,
    config: {
      domains,
      sections,
      tags,
      difficulty,
      shuffle,
      questionCount: count,
    },
  };

  try {
    // Save to API
    const savedSession = await apiService.post('/sessions', sessionData);

    // Cache sessionId locally for restoration
    storageService.setItem(SESSION_STORAGE_KEY, savedSession);

    return savedSession;
  } catch (err) {
    console.error("Failed to create session on API", err);
    // Fallback? For now just return local object but it won't be in DB
    return sessionData;
  }
}

/**
 * Load existing session from storage/API
 */
export async function loadQuizSession() {
  const cached = storageService.getItem(SESSION_STORAGE_KEY, null);
  if (!cached || !cached.sessionId) return null;

  try {
    // Refresh from API
    const session = await apiService.get(`/sessions/${cached.sessionId}`);
    return session;
  } catch (err) {
    console.warn("Failed to load session from API, using cache if available", err);
    return cached;
  }
}

/**
 * Update session state
 */
export async function updateQuizSession(updates) {
  const session = await loadQuizSession();
  if (!session) return null;

  const updated = { ...session, ...updates };

  try {
    const saved = await apiService.put(`/sessions/${session.sessionId}`, updated);
    storageService.setItem(SESSION_STORAGE_KEY, saved);
    return saved;
  } catch (err) {
    console.error("Failed to update session", err);
    // Update local cache at least
    storageService.setItem(SESSION_STORAGE_KEY, updated);
    return updated;
  }
}

/**
 * Save answer for a question
 */
export async function saveAnswer(questionId, chosenIndex, isCorrect, timeMs) {
  const session = await loadQuizSession();
  if (!session) return null;

  const answers = {
    ...session.answers,
    [questionId]: {
      chosenIndex,
      isCorrect,
      timeMs,
    }
  };

  // Convert map to object if it isn't already (Mongoose returns Map as object usually in JSON)

  return updateQuizSession({ answers });
}

/**
 * Finish session
 */
export async function finishQuizSession() {
  const session = await loadQuizSession();
  if (!session) return null;

  const updates = {
    endTime: Date.now(),
  };

  return updateQuizSession(updates);
}

/**
 * Clear session
 */
export function clearQuizSession() {
  storageService.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Calculate session score (Pure function, synchronous)
 */
export function calculateSessionScore(session, questions) {
  if (!session || !questions) return null;

  const questionMap = new Map(questions.map((q) => [q.id, q]));
  let correct = 0;
  let attempted = 0;

  const breakdown = {
    byDomain: {},
    bySection: {},
    byTag: {},
    byDifficulty: {},
  };

  for (const questionId of session.questionIds) {
    const answer = session.answers[questionId];
    if (!answer) continue;

    attempted++;
    if (answer.isCorrect) correct++;

    const question = questionMap.get(questionId);
    if (!question) continue;

    // Domain breakdown
    if (!breakdown.byDomain[question.domainId]) {
      breakdown.byDomain[question.domainId] = { correct: 0, total: 0 };
    }
    breakdown.byDomain[question.domainId].total++;
    if (answer.isCorrect) breakdown.byDomain[question.domainId].correct++;

    // Section breakdown
    if (!breakdown.bySection[question.sectionId]) {
      breakdown.bySection[question.sectionId] = { correct: 0, total: 0 };
    }
    breakdown.bySection[question.sectionId].total++;
    if (answer.isCorrect) breakdown.bySection[question.sectionId].correct++;

    // Tag breakdown
    question.topicTags.forEach((tag) => {
      if (!breakdown.byTag[tag]) {
        breakdown.byTag[tag] = { correct: 0, total: 0 };
      }
      breakdown.byTag[tag].total++;
      if (answer.isCorrect) breakdown.byTag[tag].correct++;
    });

    // Difficulty breakdown
    if (!breakdown.byDifficulty[question.difficulty]) {
      breakdown.byDifficulty[question.difficulty] = { correct: 0, total: 0 };
    }
    breakdown.byDifficulty[question.difficulty].total++;
    if (answer.isCorrect) breakdown.byDifficulty[question.difficulty].correct++;
  }

  const percent = attempted === 0 ? 0 : Math.round((correct / attempted) * 100);

  return {
    correct,
    attempted,
    total: session.questionIds.length,
    percent,
    breakdown,
  };
}

/**
 * Weight questions by weak topics
 */
function weightWeakTopics(questions, weakTopics) {
  const weighted = questions.map((q) => {
    let weight = 1;
    q.topicTags.forEach((tag) => {
      if (weakTopics[tag]) {
        const weakScore = weakTopics[tag].pctWrong || 0;
        weight += weakScore / 100; // Boost by weakness percentage
      }
    });
    return { question: q, weight };
  });

  // Sort by weight (highest first)
  weighted.sort((a, b) => b.weight - a.weight);

  return weighted.map((w) => w.question);
}

/**
 * Shuffle array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
