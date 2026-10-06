/**
 * Phase-reversal logic for a chain of four electrodes. Each channel is input 1 minus input 2; a negative result
 * deflects UP, a positive result deflects DOWN. Channels that point toward each other mark a negative phase reversal
 * at their shared electrode; channels that point away mark a positive one.
 */

const FLAT = 1; // µV: below this a channel is treated as flat
const round2 = (x) => Number(x.toFixed(2));

export function analysePhase(v) {
  const ch = [0, 1, 2].map((i) => round2(v[i] - v[i + 1]));
  const dir = ch.map((x) => (Math.abs(x) < FLAT ? "flat" : x < 0 ? "up" : "down"));
  const notes = [];
  let reversals = 0;
  for (let i = 0; i < 2; i++) {
    const a = dir[i];
    const b = dir[i + 1];
    if (a === "down" && b === "up") {
      notes.push(`Channels ${i + 1} and ${i + 2} point toward each other: negative phase reversal at electrode ${i + 2}.`);
      reversals += 1;
    } else if (a === "up" && b === "down") {
      notes.push(`Channels ${i + 1} and ${i + 2} point away from each other: positive phase reversal at electrode ${i + 2}.`);
      reversals += 1;
    } else if (a === "flat" || b === "flat") {
      notes.push(`Channel ${a === "flat" ? i + 1 : i + 2} is flat: its two electrodes have the same potential, so the two cancel in that channel.`);
    }
  }
  if (dir.every((d) => d === "flat")) {
    notes.length = 0;
    notes.push("All channels are flat: every electrode has the same potential.");
  } else if (dir[1] === "flat" && dir[0] === "down" && dir[2] === "up") {
    notes.push("Channels 1 and 3 point toward each other with a flat channel between them: the most negative potential is shared by electrodes 2 and 3, so the focus lies between them.");
  } else if (dir[1] === "flat" && dir[0] === "up" && dir[2] === "down") {
    notes.push("Channels 1 and 3 point away from each other with a flat channel between them: the most positive potential is shared by electrodes 2 and 3, so the focus lies between them.");
  }
  const flatGap = dir[1] === "flat" && dir[0] !== "flat" && dir[2] !== "flat" && dir[0] !== dir[2];
  if (reversals === 0 && !dir.every((d) => d === "flat") && !flatGap) {
    notes.push("No phase reversal: the deflections do not turn around. The maximum lies at the end of the chain or beyond it. Add electrodes or change the montage.");
  }
  if (reversals === 2) notes.push("Two reversals next to each other: a double phase reversal. In a bipolar chain suspect artifact first; genuine activity can do this only rarely.");
  return { ch, dir, notes: [...new Set(notes)] };
}

