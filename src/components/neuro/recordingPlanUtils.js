export const ACTIVATION_LABELS = {
  hyperventilation: "Hyperventilation",
  photic: "Photic stimulation",
  sleep: "Sleep",
  sleepDeprivation: "Sleep deprivation",
  awake: "Wakefulness",
  eyeClosure: "Eye closure and eye opening",
};

export function hasRecordingPlan(s) {
  return Boolean(s.yieldPlan || s.activation || s.recording);
}
