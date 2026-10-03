import React, { useCallback, useEffect, useMemo, useState } from "react";

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsTab({ flashcards, progress, onViewed }) {
  const categories = useMemo(() => [...new Set(flashcards.map((c) => c.category))], [flashcards]);
  const [category, setCategory] = useState("All");
  const [order, setOrder] = useState(null); // shuffled ids, or null for natural order
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const deck = useMemo(() => {
    const base = category === "All" ? flashcards : flashcards.filter((c) => c.category === category);
    if (!order) return base;
    const byId = new Map(base.map((c) => [c.id, c]));
    return order.map((id) => byId.get(id)).filter(Boolean);
  }, [flashcards, category, order]);

  const card = deck[Math.min(index, deck.length - 1)];

  const go = useCallback(
    (delta) => {
      setFlipped(false);
      setIndex((i) => (i + delta + deck.length) % deck.length);
    },
    [deck.length]
  );

  const flip = useCallback(() => {
    setFlipped((f) => {
      if (!f && card) onViewed(card.id);
      return !f;
    });
  }, [card, onViewed]);

  useEffect(() => {
    const onKey = (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest("input, select, textarea")) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      // A focused button already turns Space/Enter into a click.
      else if ((e.key === " " || e.key === "Enter") && !el?.closest("button, a")) {
        e.preventDefault();
        flip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, flip]);

  const pickCategory = (c) => {
    setCategory(c);
    setOrder(null);
    setIndex(0);
    setFlipped(false);
  };
  const shuffle = () => {
    setOrder(shuffled(deck.map((c) => c.id)));
    setIndex(0);
    setFlipped(false);
  };

  const viewedInDeck = deck.filter((c) => progress.viewed.includes(c.id)).length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={category}
          onChange={(e) => pickCategory(e.target.value)}
          className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 sm:w-72"
          aria-label="Flashcard category"
        >
          <option value="All">All categories ({flashcards.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c} ({flashcards.filter((f) => f.category === c).length})
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <button type="button" onClick={shuffle} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Shuffle
          </button>
          <button type="button" onClick={() => pickCategory(category)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Reset order
          </button>
        </div>
      </div>

      {card && (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Card {Math.min(index, deck.length - 1) + 1} of {deck.length}
            </span>
            <span>{viewedInDeck} reviewed in this deck</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${((Math.min(index, deck.length - 1) + 1) / deck.length) * 100}%` }} />
          </div>

          <button type="button" onClick={flip} className="emg-flip block h-72 w-full text-left sm:h-80" aria-label={flipped ? "Show question" : "Show answer"}>
            <div className={`emg-flip-inner h-full ${flipped ? "is-flipped" : ""}`}>
              <div className="emg-flip-face flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{card.category}</span>
                <div className="flex flex-1 items-center justify-center overflow-y-auto text-center text-lg font-semibold text-slate-900 sm:text-xl">{card.front}</div>
                <span className="text-center text-xs text-slate-400">Tap or press space to flip</span>
              </div>
              <div className="emg-flip-face emg-flip-back flex flex-col rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm sm:p-8">
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Answer</span>
                <div className="flex flex-1 items-center justify-center overflow-y-auto text-center text-base font-medium text-slate-800 sm:text-lg">{card.back}</div>
                <span className="text-center text-xs text-slate-400">← → to move between cards</span>
              </div>
            </div>
          </button>

          <div className="flex items-center justify-center gap-3">
            <button type="button" onClick={() => go(-1)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              ‹ Previous
            </button>
            <button type="button" onClick={flip} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Flip
            </button>
            <button type="button" onClick={() => go(1)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Next ›
            </button>
          </div>
        </>
      )}
    </div>
  );
}
