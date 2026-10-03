import { useCallback, useEffect, useState } from "react";

// Per-browser study progress for the EMG/NCS hub. Storage can be blocked
// (private windows), so every access is guarded and the page still works.
const KEY = "neurolinea_emgncs_progress_v1";
const EMPTY = { answered: {}, viewed: [], checklist: [] };

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (v && typeof v === "object") {
      return {
        answered: v.answered && typeof v.answered === "object" ? v.answered : {},
        viewed: Array.isArray(v.viewed) ? v.viewed : [],
        checklist: Array.isArray(v.checklist) ? v.checklist : [],
      };
    }
  } catch {
    /* storage unavailable */
  }
  return EMPTY;
}

export default function useHubProgress() {
  const [progress, setProgress] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable */
    }
  }, [progress]);

  const answer = useCallback((qid, selected, correct) => {
    setProgress((p) => ({ ...p, answered: { ...p.answered, [qid]: { selected, correct } } }));
  }, []);

  const markViewed = useCallback((cardId) => {
    setProgress((p) => (p.viewed.includes(cardId) ? p : { ...p, viewed: [...p.viewed, cardId] }));
  }, []);

  const toggleChecklist = useCallback((id) => {
    setProgress((p) => ({
      ...p,
      checklist: p.checklist.includes(id) ? p.checklist.filter((x) => x !== id) : [...p.checklist, id],
    }));
  }, []);

  const reset = useCallback(() => setProgress(EMPTY), []);

  return { progress, answer, markViewed, toggleChecklist, reset };
}
