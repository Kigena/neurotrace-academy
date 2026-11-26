import { SKIN as hand } from "./medianArmView.js";
import { SKIN as dorsalHand } from "./radialDorsalView.js";
import { SKIN as lateralLeg } from "./legLateralView.js";
import { SKIN as medialLeg } from "./legMedialView.js";
import { SKIN as suralLeg } from "./suralView.js";
import { SKIN as knee } from "./kneePosteriorView.js";
import { EXTENDED, FLEXED } from "./ulnarElbowView.js";
import { smoothPath } from "../geometry.js";

// Paint in the same millimetres as each skin outline. Views sharing an outline
// share the artwork, even when their nerve routes and placement targets differ.
// Relief entries are [cx, cy, rx, ry, rotation, tone, opacity].
const digits = [
  "M111 512 Q119 514 127 512 M112 537 Q120 539 127 537",
  "M132 516 Q140 518 149 516 M132 544 Q141 546 149 544",
  "M154 512 Q162 515 170 512 M154 538 Q162 541 170 538",
  "M175 506 Q183 508 190 506 M177 522 Q184 524 190 522",
  "M87 472 Q94 471 101 476",
];

const art = new Map([
  [hand, {
    contours: [
      "M130 448 Q151 439 172 448 Q182 451 192 451",
      "M118 466 Q117 477 116 485 M132 472 Q136 476 141 476 M153 474 Q160 478 168 475",
      ...digits,
    ],
    relief: [
      [141, 58, 28, 89, -5, "light", .84],
      [143, 125, 43, 24, 2, "shade", .53],
      [139, 222, 30, 113, 3, "light", .9],
      [170, 278, 16, 108, 2, "shade", .38],
      [149, 380, 38, 15, 1, "shade", .33],
      [116, 426, 19, 47, 24, "light", .95],
      [151, 425, 23, 35, -2, "shade", .47],
      [178, 437, 15, 44, -8, "light", .81],
      [92, 489, 19, 31, 14, "shade", .49],
      [151, 556, 51, 25, 0, "shade", .47],
    ],
  }],
  [dorsalHand, {
    contours: [
      "M158 395 Q169 433 181 470 M153 398 Q157 432 160 471",
      "M145 395 Q142 432 139 471 M137 395 Q129 431 119 468",
      "M177 512 Q183 514 190 512 M153 516 Q161 518 170 516 M132 513 Q140 515 148 513 M112 506 Q119 508 126 506",
    ],
    relief: [
      [142, 196, 33, 145, 3, "light", .92],
      [170, 299, 18, 106, 4, "shade", .42],
      [151, 421, 36, 55, -4, "light", .84],
      [187, 407, 21, 34, 28, "shade", .38],
      [151, 489, 47, 14, -5, "shade", .44],
    ],
    nails: [[216, 497, 10, 14, -22], [183, 554, 11, 12, 0], [162, 565, 11, 13, 0], [140, 556, 10, 12, 0], [119, 534, 9, 11, 0]],
  }],
  [lateralLeg, {
    contours: [
      "M152 105 Q161 93 172 94 Q184 96 188 105",
      "M156 393 Q156 427 152 457",
      "M177 408 Q165 419 174 432 Q183 438 191 427",
      "M246 454 Q273 474 306 487 M254 466 Q283 486 324 495",
      "M349 491 Q345 498 348 503",
    ],
    relief: [
      [178, 68, 76, 42, -3, "shade", .49],
      [151, 171, 40, 101, -9, "light", .93],
      [206, 221, 25, 126, 1, "light", .74],
      [220, 372, 17, 76, -4, "shade", .55],
      [179, 424, 23, 29, 10, "light", .92],
      [161, 494, 31, 36, -8, "shade", .69],
      [253, 492, 93, 22, 10, "light", .92],
      [257, 519, 116, 13, 0, "shade", .74],
    ],
    nails: [[357, 500, 10, 6, 12]],
  }],
  [medialLeg, {
    contours: [
      "M194 417 Q207 421 205 433 Q199 443 188 439",
      "M219 408 Q220 437 209 457",
      "M174 463 Q159 455 144 468 Q129 478 104 480",
      "M37 491 Q45 498 42 507",
    ],
    relief: [
      [184, 69, 58, 41, -4, "shade", .43],
      [224, 173, 47, 112, 7, "light", .96],
      [162, 236, 26, 140, -4, "light", .77],
      [225, 346, 21, 102, 2, "shade", .51],
      [190, 429, 26, 26, 0, "light", .96],
      [220, 490, 30, 34, 4, "shade", .64],
      [126, 499, 83, 17, 0, "shade", .53],
      [89, 494, 60, 23, -7, "light", .69],
    ],
    nails: [[25, 501, 13, 6, -12]],
  }],
  [suralLeg, {
    contours: [
      "M179 105 C172 152 175 194 178 230",
      "M197 390 Q208 385 216 398 Q219 413 207 420",
      "M155 432 Q151 450 162 464",
      "M241 444 Q281 452 320 470 M264 466 Q280 469 295 469",
      "M340 466 Q336 472 340 479",
    ],
    relief: [
      [163, 37, 81, 25, 0, "shade", .39],
      [137, 146, 34, 99, -11, "light", .98],
      [202, 141, 32, 94, 10, "light", .89],
      [177, 161, 15, 107, 0, "shade", .58],
      [174, 333, 17, 96, 2, "light", .85],
      [206, 402, 19, 26, -12, "light", .95],
      [164, 463, 33, 32, -8, "shade", .61],
      [267, 468, 88, 16, 10, "light", .89],
      [274, 487, 86, 11, 0, "shade", .66],
    ],
    nails: [[345, 475, 10, 5, 17]],
  }],
  [knee, {
    cutStarts: [1, 6],
    contours: ["M104 156 Q137 166 169 162 Q187 160 198 155"],
    relief: [
      [121, 93, 30, 58, -11, "light", .85],
      [183, 96, 30, 58, 10, "light", .83],
      [154, 151, 63, 24, -2, "shade", .64],
      [131, 222, 27, 67, 5, "light", .92],
      [178, 225, 24, 67, -6, "light", .86],
    ],
  }],
  [FLEXED.SKIN, {
    cutStarts: [0, 10],
    contours: ["M189 115 Q204 128 202 155 M192 110 Q211 124 209 149"],
    relief: [
      [102, 68, 105, 36, -1, "light", .96],
      [196, 117, 32, 24, 33, "shade", .65],
      [223, 92, 26, 22, -12, "light", .93],
      [266, 52, 22, 26, -28, "shade", .52],
      [230, 227, 45, 99, 4, "light", .98],
      [273, 205, 15, 116, 4, "shade", .6],
    ],
    horizontal: true,
  }],
  [EXTENDED.SKIN, {
    cutStarts: [0, 6],
    contours: ["M213 117 Q230 122 248 117 M223 111 Q233 110 239 104"],
    relief: [
      [101, 72, 117, 33, 0, "light", .94],
      [236, 66, 29, 25, 4, "light", .93],
      [233, 121, 41, 22, 6, "shade", .68],
      [252, 32, 27, 15, 7, "shade", .63],
      [325, 77, 82, 31, 4, "light", .86],
    ],
    horizontal: true,
  }],
]);

export const surfaceArtFor = (outline) => art.get(outline);

// Join the curved edges with straight lines where the illustration cuts
// across a limb. Keep the original points used for placement checks.
export function skinPath(outline, cutStarts = [0]) {
  const edges = cutStarts.map((start, i) => {
    const next = cutStarts[i + 1];
    const points = next === undefined
      ? [...outline.slice(start), ...outline.slice(0, cutStarts[0])]
      : outline.slice(start, next);
    return smoothPath(points, false);
  });
  return edges.map((edge, i) => i === 0 ? edge : `L${edge.slice(1)}`).join(" ") + " Z";
}
