import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import workflow from '../../src/data/workflow-domains.json';
import canonical from '../../server/src/data/blueprints/abret-reegt-2026.json';
import presets from '../../server/src/data/mockExamPresets.json';

const root = path.resolve(__dirname, '../..');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

describe('single canonical ABRET R. EEG T. 2026 blueprint', () => {
  it('canonical weights are 15/46/19/20 and cite the 2026 handbook', () => {
    expect(canonical.domains.map((d) => d.weightPercent)).toEqual([15, 46, 19, 20]);
    expect(canonical.source.document).toBe('2026 ABRET R. EEG T. Candidate Handbook');
    expect(canonical.source.year).toBe(2026);
  });

  it('workflow-domains.json (study UI) matches the canonical weights', () => {
    const byId = Object.fromEntries(workflow.domains.map((d) => [d.id, d.examWeightPercent]));
    for (const d of canonical.domains) expect(byId[d.legacyDomainId]).toBe(d.weightPercent);
  });

  it('no mock preset carries its own conflicting weights', () => {
    for (const p of presets.presets) {
      expect(['blueprint', 'single-domain']).toContain(p.allocation);
      expect(p).not.toHaveProperty('domainDistribution');
    }
  });

  it('the old conflicting exam engines/weight tables are gone', () => {
    expect(fs.existsSync(path.join(root, 'src/pages/CertificationExam.jsx'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/data/mockExamPresets.json'))).toBe(false);
  });
});

describe('answer key is not shipped to the browser', () => {
  it('no frontend module imports the full question bank', () => {
    const offenders = walk(path.join(root, 'src'))
      .filter((f) => /\.(jsx?|tsx?)$/.test(f))
      .filter((f) => /abret-questions\.json/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('question-catalog.json is metadata-only and in sync with the source bank', async () => {
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/data/question-catalog.json'), 'utf8'));
    const source = JSON.parse(fs.readFileSync(path.join(root, 'src/data/abret-questions.json'), 'utf8'));
    expect(catalog.questions).toHaveLength(source.questions.length);
    for (const entry of catalog.questions) {
      expect(Object.keys(entry).sort()).toEqual(['difficulty', 'domainId', 'id', 'sectionId', 'topicTags']);
    }
    const { buildCatalog } = await import('../../scripts/build-question-catalog.mjs');
    expect(catalog).toEqual(buildCatalog(source));
  });
});
