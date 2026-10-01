#!/usr/bin/env node
// QA audit of the question bank (flags only; never rewrites content).
//
// Usage (from server/):
//   node scripts/auditQuestions.js            # dry run: report only
//   node scripts/auditQuestions.js --apply    # write flags + known-issue statuses
//   node scripts/auditQuestions.js --bank challenge
//
// Requires MONGODB_URI (server/.env is loaded).

import 'dotenv/config';
import mongoose from 'mongoose';
import { runQuestionAudit } from '../src/services/qaRunner.js';

const apply = process.argv.includes('--apply');
const bankIdx = process.argv.indexOf('--bank');
const bank = bankIdx >= 0 ? process.argv[bankIdx + 1] : null;

if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set.');
    process.exit(2);
}

try {
    await mongoose.connect(process.env.MONGODB_URI);
    const filter = bank === 'challenge' ? { bank: 'challenge' } : bank === 'foundation' ? { bank: { $ne: 'challenge' } } : {};
    const report = await runQuestionAudit({ dryRun: !apply, filter });
    console.log(JSON.stringify(report, null, 2));
    if (!apply) console.log('Dry run only. Re-run with --apply to write flags.');
    await mongoose.disconnect();
} catch (error) {
    console.error('Audit failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
}
