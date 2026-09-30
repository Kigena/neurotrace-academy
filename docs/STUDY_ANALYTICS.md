# Study analytics (Fast Study Usability milestone)

All formulas live in `server/src/services/studyAnalytics.js` and use only the
signed-in user's scored `AttemptEvent`s. None of these numbers is a
probability of passing the exam.

## Mastery (per domain, section and tag)

1. Most recent 30 attempts for the topic, newest first (`i = 0..n-1`).
2. Recency weight `w_i = 1 − 0.5·i/29` (newest 1.0 → 30th-newest 0.5).
3. Weighted accuracy `A = Σ w_i·correct_i / Σ w_i`.
4. Evidence shrinkage toward 50%: `mastery = 100·(n·A + 3·0.5)/(n + 3)`.
5. Fewer than 5 attempts → "Insufficient data" (score not shown as mastery).

Examples: 5/5 correct → 81 (Good), 12/12 → 90, 30/30 → 95 (Strong),
0/5 → 19 (Weak). Bands: 0–49 Weak, 50–69 Developing, 70–84 Good, 85–100 Strong.

## Study readiness

| Weight | Component | Available when |
|---|---|---|
| 50% | ABRET-weighted domain mastery `Σ weight_d·mastery_d` (15/46/19/20); domains with < 5 attempts count as 0 | any domain has ≥ 5 attempts |
| 25% | Accuracy over the last 20 answers | ≥ 10 answers |
| 15% | Coverage: share of the bank's sections with ≥ 3 answers | ≥ 1 answer |
| 10% | Mean of the last 3 submitted mock exams | ≥ 1 mock |

Unavailable components are excluded and the rest re-normalised; the UI shows
every component and the share of the formula actually measured. Bands:
0–49 Building Foundation, 50–69 Developing, 70–84 Approaching Ready,
85–100 Strong Preparation.

## Study my weak areas (10 / 20 / 30, practice mode)

Per-question weight:
`w = 0.1 + 4·weakness² + 2·[latest attempt wrong] + 0.5·(domainWeight/46) + 0.75·[section untouched ≥ 7 days]`
where `weakness = 0.6·(100 − sectionMastery)/100 + 0.4·mean tag weakness`
(unseen topics count as 50). Weighted random sampling without replacement
(Efraimidis–Spirakis), at most 30% of the session from one section, so
sessions stay mixed.

## Today's Study (deterministic, no AI)

- Two 10-question blocks for the weakest sections with ≥ 5 attempts and
  mastery < 85; Domain II sections rank as if 5 points weaker (46% of the exam).
- If none qualify: 10 questions in the weakest assessed domain, or Domain II
  when there is no data.
- Review up to 5 outstanding incorrect questions (if any).
- A 10-question mixed ABRET quiz.

## Review Incorrect

Lists questions whose most recent attempt was wrong. RETRY shows the question
without its answer; the answer is recorded as a new `AttemptEvent`
(`mode: "review"`). Earlier attempts are never modified or deleted; a correct
retry removes the question from the list and feeds mastery.

## Exam countdown

`src/config/examConfig.js`: ABRET R.EEG T., 2026-12-14 12:30,
America/New_York, Asheville, North Carolina. Days are counted in the exam's
time zone.
