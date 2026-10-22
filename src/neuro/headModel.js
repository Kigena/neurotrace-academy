/**
 * The 3D head used by the 10-20 measurement lab (public/models/head), in
 * centimetres: x lateral (+x = patient's LEFT), y up, z anterior. Landmarks
 * were read off the model (side view with a centimetre grid) and snapped to
 * its surface.
 */
export const HEAD_URL = "/models/head/head.gltf";

export const LANDMARKS = {
  center: [0, 166, 3.5],
  nasion: [0, 167.13, 14.33],
  inion: [0, 165.36, -6.03],
  lpa: [7.33, 164.51, 4.16], // left preauricular point
  rpa: [-7.33, 164.51, 4.16], // right preauricular point
  vertex: [0, 178.37, 2.66],
};

export const LANDMARK_INFO = {
  nasion: { label: "Nasion", text: "The depression at the bridge of the nose, where the frontal and nasal bones meet, level with the eyes." },
  inion: { label: "Inion", text: "The external occipital protuberance: the most prominent bony point in the midline at the back of the skull, where the neck muscles attach." },
  lpa: { label: "Left preauricular point", text: "The small depression just in front of the tragus of the left ear, at the root of the zygomatic arch (it deepens when the jaw opens)." },
  rpa: { label: "Right preauricular point", text: "The small depression just in front of the tragus of the right ear, at the root of the zygomatic arch (it deepens when the jaw opens)." },
};
