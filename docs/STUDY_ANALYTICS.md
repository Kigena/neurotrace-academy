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

Revised in the Challenge Bank milestone so that high scores on the
foundation (legacy, mostly L1/L2) bank cannot produce a falsely high score.

| Weight | Component | Evidence |
|---|---|---|
| 20% | Foundation mastery: `Σ weight_d·mastery_d` (15/46/19/20) | foundation-bank attempts |
| 15% | Technical reasoning | Challenge Bank (L3–L6) attempts, competency `technical` |
| 15% | Montage / localization | Challenge Bank, competency `montage` |
| 15% | Troubleshooting | Challenge Bank, competency `troubleshooting` |
| 15% | Clinical integration | Challenge Bank, competency `clinical` |
| 20% | Mock performance: mean of the last 3 submitted mocks | mock exams |

Anything not yet assessed (fewer than 5 answers, or no mock) counts as **0**
and is labelled "not assessed"; nothing is re-normalised away. Perfect
foundation-bank scores alone therefore reach at most 20, and foundation plus
mocks at most 40 ("Building Foundation"). The score is null only with no data.
Bands: 0–49 Building Foundation, 50–69 Developing, 70–84 Approaching Ready,
85–100 Strong Preparation.

## Challenge me (10 / 20 / 30 / 50, practice mode)

Challenge Bank only, never L1/L2. Level mix L3 15% · L4 30% · L5 25% · L6 30%
(largest remainder, ties to the higher level; 20 → 3/6/5/6). Shortfalls are
back-filled from L4–L6 first. Within a level, domains are favoured in
proportion to ABRET weight. While the pilot is under review, the Challenge
Bank is served only here, not in standard quizzes or mocks.

## Question QA

`qaStatus`: UNREVIEWED · VERIFIED · NEEDS_REVISION · REJECTED. NEEDS_REVISION
and REJECTED items are never served. `npm run audit:questions` (dry run) /
`-- --apply` adds automatic flags (obvious distractors, Both-A-and-B,
All/None of the above, duplicate stems, longest-answer bias, numeric
contradictions, sensitivity terminology, categorical filter claims, absolute
keyed answers) and applies the reviewed list in
`server/src/data/qa/known-issues.json`. Automatic flags never change status
or content.

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

## Challenge Bank authoring rules (enforced by tests)

Written after feedback that answers were "too obvious":

1. All four options come from the same family (four plausible actions, four
   look-alike patterns, four values from classic calculation errors). No option
   should be rejectable on sight.
2. Procedural wording (document / notify / verify / per policy / physician)
   appears in every option or in none (audit rule `PROCEDURAL_CUE`).
3. The keyed option never carries its own rationale or formula
   (`KEYED_RATIONALE_IN_OPTION`).
4. Stems provide data to work through (referential voltages, page widths,
   timings, settings) rather than keywords echoed in the answer.
5. No answer-position or answer-length cue: each position 15-35% of items;
   keyed option noticeably longest/shortest in under 20% of items.
6. No always/never, Both-A-and-B or All/None templates.

Today's Study and Continue Studying are Challenge-first whenever the
Challenge Bank is available: 10 questions in the weakest (or not yet
assessed) higher-order competency, 10 mixed Challenge questions, then review
of incorrect answers.
