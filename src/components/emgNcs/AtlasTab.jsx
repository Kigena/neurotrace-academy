import React, { useEffect, useState } from "react";

const TONES = [
  "border-blue-200 bg-blue-50 text-blue-900",
  "border-orange-200 bg-orange-50 text-orange-900",
  "border-violet-200 bg-violet-50 text-violet-900",
  "border-teal-200 bg-teal-50 text-teal-900",
];

const ACRONYMS = new Set(["NCS", "EMG", "NCV", "EDX"]);

function titleCase(s) {
  // Banners were written in capitals for a dark poster style.
  return s.replace(/\b([A-Z])([A-Z]+)\b/g, (m, a, b) => (ACRONYMS.has(m) ? m : a + b.toLowerCase()));
}

function Lightbox({ figure, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={figure.title}>
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-3">
          <h3 className="font-semibold text-slate-900">{figure.title}</h3>
          <button type="button" onClick={onClose} className="rounded-md px-2 text-2xl leading-none text-slate-500 hover:bg-slate-100" aria-label="Close">
            ×
          </button>
        </div>
        <div className="overflow-auto">
          <img src={figure.src} alt={figure.alt} className="mx-auto max-h-[70vh] w-auto bg-slate-50" />
          <div className="emg-prose px-5 py-4 text-sm" dangerouslySetInnerHTML={{ __html: figure.caption }} />
        </div>
      </div>
    </div>
  );
}

export default function AtlasTab({ atlas }) {
  const [open, setOpen] = useState(null);
  const total = atlas.sections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.figures.length, 0), 0);

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600">
        {total} clinical images across {atlas.sections.length} sections. Select any image to enlarge it with its full notes.
      </p>
      <nav className="flex flex-wrap gap-2" aria-label="Atlas sections">
        {atlas.sections.map((s, i) => (
          <a key={s.title} href={`#atlas-${i}`} className={`rounded-full border px-3 py-1 text-xs font-semibold ${TONES[i % TONES.length]}`}>
            {titleCase(s.title)}
          </a>
        ))}
      </nav>

      {atlas.sections.map((s, i) => (
        <section key={s.title} id={`atlas-${i}`} className="scroll-mt-32 space-y-5">
          <div className={`rounded-xl border px-5 py-4 ${TONES[i % TONES.length]}`}>
            <h2 className="text-lg font-bold">{titleCase(s.title)}</h2>
            {s.subtitle && <p className="text-sm opacity-80">{s.subtitle}</p>}
          </div>
          {s.groups.map((g) => (
            <div key={g.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 font-semibold text-slate-900">{g.title}</h3>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {g.figures.map((f) => (
                  <figure key={f.src} className="flex flex-col overflow-hidden rounded-lg border border-slate-200">
                    <button type="button" onClick={() => setOpen(f)} className="group flex h-56 items-center justify-center bg-slate-50 p-2" aria-label={`Enlarge: ${f.title}`}>
                      <img src={f.src} alt={f.alt} loading="lazy" className="max-h-full max-w-full object-contain transition-transform group-hover:scale-[1.02]" />
                    </button>
                    <figcaption className="flex-1 border-t border-slate-200 p-3.5">
                      <div className="mb-1 text-sm font-semibold text-slate-900">{f.title}</div>
                      <div className="emg-prose line-clamp-4 text-[0.8rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: f.caption }} />
                      <button type="button" onClick={() => setOpen(f)} className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                        Enlarge &amp; read notes →
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
              {g.notes && <div className="emg-prose mt-4" dangerouslySetInnerHTML={{ __html: g.notes }} />}
            </div>
          ))}
        </section>
      ))}

      {open && <Lightbox figure={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
