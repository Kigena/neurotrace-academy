// Applies the heuristic audit and the reviewed known-issues list to the
// Question collection. Automatic flags are replaced on each run; manual flags
// and human-set qaStatus values are preserved. Content is never modified.

import { createRequire } from 'module';
import { Question } from '../models/Question.js';
import { auditBank } from './questionAudit.js';

const require = createRequire(import.meta.url);
const knownIssues = require('../data/qa/known-issues.json');

export function getKnownIssues() {
    return knownIssues.issues;
}

export async function runQuestionAudit({ dryRun = true, filter = {} } = {}) {
    const docs = await Question.find(filter)
        .select('questionId stem options bank qaStatus qaFlags +answerIndex +explanation')
        .lean();
    const known = new Map(getKnownIssues().map((k) => [k.questionId, k]));
    // Retired (REJECTED) copies do not count toward duplicate stems, so the
    // single copy kept in service is not flagged because of them.
    const retired = (d) => d.qaStatus === 'REJECTED' || known.get(d.questionId)?.qaStatus === 'REJECTED';
    const audit = auditBank(docs, { stemPool: docs.filter((d) => !retired(d)) });
    const byId = new Map(audit.results.map((r) => [r.id, r.flags]));

    let flagsWritten = 0;
    let statusChanged = 0;
    const missingKnown = [...known.keys()].filter((id) => !docs.some((d) => d.questionId === id));

    for (const doc of docs) {
        const manual = (doc.qaFlags || []).filter((f) => f.source === 'manual');
        const auto = (byId.get(doc.questionId) || []).map((f) => ({ ...f, source: 'auto', createdAt: new Date() }));
        const issue = known.get(doc.questionId);
        if (issue && !manual.some((f) => f.code === issue.code)) {
            manual.push({ code: issue.code, detail: issue.detail, source: 'manual', createdAt: new Date() });
        }
        const update = { qaFlags: [...manual, ...auto] };
        // Known issues set status; never downgrade a status a human already
        // set to REJECTED, and never touch VERIFIED/UNREVIEWED otherwise.
        if (issue && doc.qaStatus !== 'REJECTED' && doc.qaStatus !== issue.qaStatus) {
            update.qaStatus = issue.qaStatus;
            statusChanged += 1;
        }
        flagsWritten += update.qaFlags.length;
        if (!dryRun) await Question.updateOne({ _id: doc._id }, { $set: update });
    }

    return {
        dryRun,
        audited: docs.length,
        flaggedQuestions: audit.flagged,
        byCode: audit.byCode,
        flagsWritten,
        knownIssuesApplied: statusChanged,
        knownIssuesMissing: missingKnown,
    };
}
