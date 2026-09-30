#!/usr/bin/env node
// Import the legacy question bank into MongoDB (idempotent) and seed the
// canonical ABRET 2026 blueprint nodes.
//
// Usage (from server/):
//   node scripts/importQuestions.js [--source <path>] [--dry-run] [--report <file>]
//
// Requires MONGODB_URI in the environment (server/.env is loaded).
// Prints a reconciliation report; exits non-zero if the counts do not
// reconcile or any record failed validation.

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import {
    defaultSourcePath,
    importQuestions,
    loadSourceFile,
    seedBlueprint,
} from '../src/services/questionImport.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function arg(name) {
    const i = process.argv.indexOf(name);
    return i >= 0 ? process.argv[i + 1] : undefined;
}

const sourcePath = path.resolve(arg('--source') || defaultSourcePath(serverRoot));
const reportPath = arg('--report');
const dryRun = process.argv.includes('--dry-run');

if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set.');
    process.exit(2);
}

try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Promise.all([
        mongoose.model('Question').syncIndexes(),
        mongoose.model('QuestionVersion').syncIndexes(),
        mongoose.model('BlueprintNode').syncIndexes(),
    ]);

    const data = loadSourceFile(sourcePath);
    const sourceLabel = path.relative(path.resolve(serverRoot, '..'), sourcePath).replace(/\\/g, '/');
    const report = await importQuestions({ data, sourceFile: sourceLabel, dryRun });
    const blueprintNodes = dryRun ? 0 : await seedBlueprint();

    const summary = {
        sourceFile: report.sourceFile,
        dryRun: report.dryRun,
        sourceCount: report.sourceCount,
        declaredTotal: report.declaredTotal,
        inserted: report.inserted,
        existingUnchanged: report.unchanged,
        updated: report.updated,
        failed: report.failed,
        versionsCreated: report.versionsCreated,
        reconciled: report.reconciled,
        duplicateStemGroups: report.qa.duplicateStemGroups,
        duplicateStemExtraCopies: report.qa.duplicateStemExtraCopies,
        duplicateSourceIds: report.qa.duplicateSourceIds.length,
        domainCounts: report.domainCounts,
        sectionCount: Object.keys(report.sectionCounts).length,
        blueprintNodesSeeded: blueprintNodes,
    };
    console.log(JSON.stringify(summary, null, 2));
    if (report.failures.length) console.log('Failures:', JSON.stringify(report.failures, null, 2));

    if (reportPath) {
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`Full report written to ${reportPath}`);
    }

    await mongoose.disconnect();
    process.exit(report.reconciled && report.failed === 0 ? 0 : 1);
} catch (error) {
    console.error('Import failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
}
