// "Today's Study" persistence: which plan items are pending, started or done.

import { DailyPlan } from '../models/DailyPlan.js';

export const PLAN_TIME_ZONE = 'America/New_York'; // exam location (Asheville, NC)

const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: PLAN_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

/** YYYY-MM-DD for `ts` in the exam timezone. */
export function planDateFor(ts = Date.now()) {
    return dateFormat.format(new Date(ts));
}

const ITEM_FIELDS = ['kind', 'count', 'due', 'competency', 'code', 'title', 'sectionId', 'domainId', 'mastery', 'reason'];

function toPlanItems(fresh) {
    return fresh.map((item, i) => {
        const out = { id: `p${i + 1}`, status: 'pending' };
        for (const f of ITEM_FIELDS) if (item[f] !== undefined && item[f] !== null) out[f] = item[f];
        return out;
    });
}

/**
 * Today's plan for the user. Until an item has been started the plan follows
 * the latest analytics (`fresh`); once anything is started or done it stays
 * fixed for the rest of the day.
 */
export async function getTodaysPlan(userId, fresh, now = Date.now()) {
    const date = planDateFor(now);
    const existing = await DailyPlan.findOne({ userId, date }).lean();
    if (existing && existing.items.some((i) => i.status !== 'pending')) return existing;
    return DailyPlan.findOneAndUpdate(
        { userId, date },
        { $set: { items: toPlanItems(fresh), updatedAt: new Date(now) }, $setOnInsert: { createdAt: new Date(now) } },
        { upsert: true, new: true, lean: true }
    );
}

/** Link a new session to a plan item (pending -> started; done stays done). */
export async function startPlanItem(userId, date, itemId, sessionId, now = Date.now()) {
    if (!itemId || !date) return false;
    const res = await DailyPlan.updateOne(
        { userId, date, items: { $elemMatch: { id: itemId, status: { $ne: 'done' } } } },
        { $set: { 'items.$.status': 'started', 'items.$.sessionId': sessionId, 'items.$.startedAt': new Date(now), updatedAt: new Date(now) } }
    );
    return res.modifiedCount > 0;
}

/** Mark the plan item a session came from as done (idempotent). */
export async function completePlanItem(userId, date, itemId, sessionId, now = Date.now()) {
    if (!itemId || !date) return false;
    const res = await DailyPlan.updateOne(
        { userId, date, items: { $elemMatch: { id: itemId, status: { $ne: 'done' } } } },
        { $set: { 'items.$.status': 'done', 'items.$.doneAt': new Date(now), 'items.$.sessionId': sessionId, updatedAt: new Date(now) } }
    );
    return res.modifiedCount > 0;
}

/** Is `itemId` an item of the user's plan for today? */
export async function findTodaysItem(userId, itemId, now = Date.now()) {
    if (typeof itemId !== 'string' || !itemId) return null;
    const date = planDateFor(now);
    const plan = await DailyPlan.findOne({ userId, date, 'items.id': itemId }).select('items.$').lean();
    return plan ? { date, item: plan.items[0] } : null;
}
