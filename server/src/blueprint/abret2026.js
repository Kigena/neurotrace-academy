// Canonical ABRET R. EEG T. 2026 blueprint.
// This module is the single authority for domain weights. Exam generation,
// preset allocation and BlueprintNode seeding all read from here.

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const blueprint = require('../data/blueprints/abret-reegt-2026.json');

export const BLUEPRINT_KEY = blueprint.blueprintKey;
export const BLUEPRINT_SOURCE = Object.freeze({ ...blueprint.source });

export const DOMAINS = Object.freeze(
    [...blueprint.domains]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((d) => Object.freeze({ ...d }))
);

export function getBlueprint() {
    return {
        blueprintKey: BLUEPRINT_KEY,
        title: blueprint.title,
        source: BLUEPRINT_SOURCE,
        domains: DOMAINS.map((d) => ({ ...d })),
    };
}

export function getDomainByLegacyId(legacyDomainId) {
    return DOMAINS.find((d) => d.legacyDomainId === legacyDomainId) || null;
}

/**
 * Allocate `total` questions across the blueprint domains.
 *
 * Rounding rule (largest-remainder / Hamilton method):
 *   1. quota_d = total * weight_d / 100
 *   2. every domain first receives floor(quota_d)
 *   3. the remaining seats go, one each, to the domains with the largest
 *      fractional remainders
 *   4. ties are broken by the larger exact quota, then by blueprint order
 *      (Domain I before II before III before IV)
 *
 * The result is deterministic and always sums exactly to `total`.
 * The official percentages themselves are never altered.
 */
export function allocateByBlueprint(total, domains = DOMAINS) {
    if (!Number.isInteger(total) || total < 0) {
        throw new Error('total must be a non-negative integer');
    }
    const weightSum = domains.reduce((s, d) => s + d.weightPercent, 0);
    if (weightSum !== 100) {
        throw new Error(`Blueprint weights must sum to 100 (got ${weightSum})`);
    }

    const rows = domains.map((d, order) => {
        const quota = (total * d.weightPercent) / 100;
        const base = Math.floor(quota);
        return { domain: d, order, quota, base, remainder: quota - base };
    });

    let remaining = total - rows.reduce((s, r) => s + r.base, 0);
    const ranked = [...rows].sort(
        (a, b) =>
            b.remainder - a.remainder ||
            b.quota - a.quota ||
            a.order - b.order
    );
    for (const row of ranked) {
        if (remaining <= 0) break;
        row.base += 1;
        remaining -= 1;
    }

    return rows.map((r) => ({
        domainId: r.domain.legacyDomainId,
        code: r.domain.code,
        title: r.domain.title,
        weightPercent: r.domain.weightPercent,
        exactQuota: r.quota,
        count: r.base,
    }));
}
