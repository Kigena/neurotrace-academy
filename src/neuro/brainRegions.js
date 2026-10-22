/**
 * Anatomical regions on the NeuroLinea 3D brain model (public/models/brain).
 *
 * The model is a single textured surface, so regions are not separate parts:
 * each surface point is classified from its position against landmarks read
 * off the model (central sulcus, Sylvian fissure, parieto-occipital boundary,
 * tentorium). Boundaries are teaching approximations, not a segmented atlas.
 *
 * Coordinates are model millimetres: x lateral (+x = patient's LEFT),
 * y up (0 = bottom of the brainstem), z anterior (+z = frontal pole).
 */

// ---------------------------------------------------------------- landmarks

/** Central sulcus: from the vertex (z -2, y 86) down and forward to just above the Sylvian fissure (z +5, y 49). */
export const centralZ = (y) => -2 + ((86 - y) * 7) / 37;

/** Sylvian (lateral) fissure: rises from the temporal pole (z +15, y 38) to its posterior end (z -15, y 44). */
export const sylvianY = (z) => 38 + ((15 - z) * 6) / 30;

/** Parieto-occipital / preoccipital boundary: further back near the top of the hemisphere. */
export const occipitalZ = (y) => -31 - Math.max(0, y - 35) * 0.12;

/** Height of the tentorium over the cerebellum (the cerebellum lies below). */
export const TENTORIUM_Y = 32;

// ------------------------------------------------------------- definitions

export const LOBES = {
  frontal: { label: "Frontal lobe", color: [0.55, 0.72, 1.0], text: "Voluntary movement (precentral gyrus), planning, judgment, personality and, on the dominant side, speech output (Broca area)." },
  parietal: { label: "Parietal lobe", color: [0.62, 0.9, 0.62], text: "Touch and position sense (postcentral gyrus), spatial attention, and reading and calculation on the dominant side." },
  temporal: { label: "Temporal lobe", color: [1.0, 0.8, 0.45], text: "Hearing (Heschl gyrus), language comprehension on the dominant side (Wernicke area), memory and emotion (hippocampus, amygdala). The most common site of focal epilepsy in adults." },
  occipital: { label: "Occipital lobe", color: [0.85, 0.6, 1.0], text: "Vision (calcarine cortex); the posterior dominant (alpha) rhythm is maximal over the occipital regions." },
  cerebellum: { label: "Cerebellum", color: [1.0, 0.62, 0.62], text: "Coordination and balance on the same side of the body; sits below the tentorium in the posterior fossa and does not contribute to the scalp EEG." },
  brainstem: { label: "Brainstem", color: [0.75, 0.75, 0.75], text: "Midbrain, pons and medulla: cranial nerve nuclei, long tracts, the reticular activating system (consciousness) and breathing centres." },
};

export const AREAS = {
  motor: { label: "Primary motor cortex (precentral gyrus)", color: [0.35, 0.55, 1.0], text: "Brodmann 4. Controls voluntary movement of the opposite side; leg near the midline, face and hand laterally. The hand area lies under C3/C4 and the leg area near Cz." },
  sensory: { label: "Primary somatosensory cortex (postcentral gyrus)", color: [0.35, 0.8, 0.45], text: "Brodmann 3, 1, 2. Touch and position sense from the opposite side, mapped like the motor strip." },
  broca: { label: "Broca area (left inferior frontal gyrus)", color: [1.0, 0.45, 0.45], text: "Brodmann 44 and 45 on the dominant side. Damage causes non-fluent (expressive) aphasia. Lies near F7." },
  wernicke: { label: "Wernicke area (left posterior superior temporal gyrus)", color: [1.0, 0.6, 0.2], text: "Posterior Brodmann 22 on the dominant side. Damage causes fluent (receptive) aphasia with poor comprehension. Lies between T3 and T5 (T7-P7)." },
  auditory: { label: "Primary auditory cortex (Heschl gyrus)", color: [0.95, 0.85, 0.3], text: "Brodmann 41 and 42 on the upper surface of the superior temporal gyrus, mostly hidden inside the Sylvian fissure; shown here where it meets the surface." },
  visual: { label: "Primary visual cortex", color: [0.75, 0.45, 1.0], text: "Brodmann 17 around the calcarine sulcus, mostly on the medial surface; the occipital pole is shown. Damage causes a contralateral homonymous field defect." },
};

export const ARTERIES = {
  aca: { label: "Anterior cerebral artery (ACA)", color: [0.45, 0.65, 1.0], text: "Medial frontal and parietal lobes and a strip of the upper convexity, including the leg area of the motor and sensory strips. Occlusion: leg-predominant weakness on the opposite side." },
  mca: { label: "Middle cerebral artery (MCA)", color: [1.0, 0.55, 0.45], text: "Most of the lateral convexity: face and arm areas, Broca and Wernicke areas. The most commonly affected territory in ischemic stroke; occlusion causes face and arm weakness, aphasia (dominant) or neglect (non-dominant)." },
  pca: { label: "Posterior cerebral artery (PCA)", color: [0.6, 0.85, 0.5], text: "Occipital lobe, inferior and medial temporal lobe and thalamus. Occlusion: contralateral homonymous hemianopia, often with macular sparing." },
  vb: { label: "Vertebrobasilar system", color: [0.8, 0.7, 0.9], text: "Brainstem and cerebellum. Occlusion: vertigo, diplopia, dysarthria, ataxia, crossed signs; basilar occlusion can cause locked-in syndrome." },
};

// ------------------------------------------------------------ classifiers

const side = (x) => (Math.abs(x) < 3 ? "midline" : x > 0 ? "left" : "right");

/** Lobe at a surface point (mm). */
export function lobeAt([x, y, z]) {
  const ax = Math.abs(x);
  if (ax < 12 && y < 32 && z > -32 && z < 8) return "brainstem"; // includes the midbrain and base of the brain between the temporal lobes
  if (z < -6 && y < TENTORIUM_Y && !(z > -12 && ax > 22)) return "cerebellum";
  if (z < occipitalZ(y)) return "occipital";
  const ys = sylvianY(z);
  // below the Sylvian fissure, behind the frontal operculum: temporal lobe
  if (y < ys && z < 22 && (ax > 14 || y < 30)) {
    if (z > 15 && ax < 20) return "frontal"; // orbital surface in front of the temporal pole
    return "temporal";
  }
  if (y < ys && z >= 22) return "frontal";
  return z > centralZ(y) ? "frontal" : "parietal";
}

/** Named functional area at a surface point, or null. */
export function areaAt(p) {
  const [x, y, z] = p;
  const lobe = lobeAt(p);
  const ys = sylvianY(z);
  const dc = z - centralZ(y); // + anterior to the central sulcus
  const left = side(x) === "left";
  if (lobe === "frontal" && dc >= 0 && dc < 8 && y > ys + 2) return "motor";
  if (lobe === "parietal" && dc < 0 && dc > -8 && y > ys + 2) return "sensory";
  if (left && lobe === "frontal" && dc >= 8 && dc < 22 && y >= ys && y < ys + 11) return "broca";
  if (lobe === "temporal" && y > ys - 7) {
    if (left && z <= -6 && z > -30) return "wernicke";
    if (z > -6 && z < 4) return "auditory";
  }
  if (lobe === "occipital" && z < -42) return "visual";
  return null;
}

/** Arterial territory at a surface point. */
export function arteryAt(p) {
  const [x, y, z] = p;
  const lobe = lobeAt(p);
  if (lobe === "brainstem" || lobe === "cerebellum") return "vb";
  if (lobe === "occipital") return "pca";
  if (lobe === "temporal" && y < 31 && z < 0) return "pca"; // inferior temporal surface behind the pole (the pole is MCA)
  if (Math.abs(x) < 13 && y > 50) return "aca"; // parasagittal strip of the convexity
  if (Math.abs(x) < 8 && (lobe === "frontal" || lobe === "parietal")) return "aca"; // medial frontal and parietal (precuneus)
  return "mca";
}

/** Everything known about a surface point, for the info panel. */
export function describePoint(p) {
  const lobe = lobeAt(p);
  return { lobe, area: areaAt(p), artery: arteryAt(p), side: lobe === "brainstem" ? "midline" : side(p[0]) };
}

// ---------------------------------------------------------------- 10-20

/**
 * Direction of a 10-20 electrode from the head centre, from the top-view
 * coordinates used by the EEG generator (unit disk, x right-positive for the
 * patient's right, y anterior). r = 0.8 lies on the circumference
 * (Fpz-T3-Oz), i.e. 90 degrees from the vertex.
 */
export function electrodeDirection([gx, gy]) {
  const r = Math.hypot(gx, gy);
  const theta = ((r / 0.8) * Math.PI) / 2; // polar angle from the vertex
  const s = Math.sin(theta);
  const lat = r > 0 ? -gx / r : 0; // model +x is the patient's left; generator -x is left
  const ant = r > 0 ? gy / r : 0;
  return [lat * s, Math.cos(theta), ant * s];
}

/** Head centre (mm) used to project electrodes onto the cortex. */
export const HEAD_CENTER = [0, 38, -2];

/** What lies under each 10-20 electrode (textbook correlations; 10-10 names in brackets). */
export const ELECTRODE_INFO = {
  Fp1: "Left frontopolar: prefrontal cortex. Eye-blink artifact is largest here (with Fp2).",
  Fp2: "Right frontopolar: prefrontal cortex. Eye-blink artifact is largest here (with Fp1).",
  F7: "Left inferior frontal / anterior temporal region, near Broca area. Lateral eye movements and anterior temporal spikes show here.",
  F8: "Right inferior frontal / anterior temporal region. Lateral eye movements and anterior temporal spikes show here.",
  F3: "Left dorsolateral frontal cortex (middle frontal gyrus).",
  F4: "Right dorsolateral frontal cortex (middle frontal gyrus).",
  Fz: "Midline frontal: medial frontal cortex and supplementary motor area; frontal midline theta.",
  T3: "Left mid-temporal (T7): superior and middle temporal gyri, near the auditory cortex. A common site of temporal discharges.",
  T4: "Right mid-temporal (T8): superior and middle temporal gyri, near the auditory cortex.",
  C3: "Left central (Rolandic) region over the motor and sensory hand area: mu rhythm and centrotemporal spikes (with T3/T4).",
  C4: "Right central (Rolandic) region over the motor and sensory hand area: mu rhythm and centrotemporal spikes (with T3/T4).",
  Cz: "Vertex over the leg area of the motor and sensory strips (paracentral lobule): vertex waves and K-complexes are maximal here.",
  T5: "Left posterior temporal (P7), near Wernicke area on the dominant side.",
  T6: "Right posterior temporal (P8): the inferior and middle temporal gyri toward the temporo-occipital junction.",
  P3: "Left parietal cortex (superior and inferior parietal lobules).",
  P4: "Right parietal cortex (superior and inferior parietal lobules).",
  Pz: "Midline parietal, over the precuneus and medial parietal lobe; the back of the midline chain (Fz-Cz-Pz).",
  O1: "Left occipital cortex: the posterior dominant (alpha) rhythm is maximal over O1 and O2.",
  O2: "Right occipital cortex: the posterior dominant (alpha) rhythm is maximal over O1 and O2.",
};
