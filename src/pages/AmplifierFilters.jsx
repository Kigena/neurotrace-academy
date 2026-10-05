import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import EegTracing from "../components/EegTracing.jsx";
import Calculators from "../components/amplifier/Calculators.jsx";
import ResponseCurve from "../components/amplifier/ResponseCurve.jsx";
import labScene from "../data/amplifierLab.json";
import casesData from "../data/cases.json";
import {
  HFF_CHOICES, LFF_CHOICES, durationMs, frequencyHz, heightFromVoltage, highPassGain, lowPassGain, timeConstantFromCutoff,
} from "../eeg/filters";

/**
 * Amplifier Controls & Filters: sensitivity, time base, filters, notch. All tables are computed from
 * src/eeg/filters.js so they always agree with the calculators and the Filter Lab.
 */

const TABS = [
  ["overview", "Overview"],
  ["sensitivity", "Sensitivity"],
  ["timebase", "Time base"],
  ["filters", "Filters"],
  ["lab", "Filter Lab"],
  ["mistakes", "Common mistakes"],
  ["practice", "Practice"],
];
const TAB_IDS = new Set(TABS.map(([id]) => id));

const pct = (g) => `${(g * 100).toFixed(g < 0.1 ? 1 : 0)}%`;

function Card({ title, children, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-white",
    indigo: "border-indigo-200 bg-indigo-50/60",
    amber: "border-amber-200 bg-amber-50/70",
    emerald: "border-emerald-200 bg-emerald-50/60",
  };
  return (
    <section className={`rounded-xl border p-5 ${tones[tone]}`}>
      {title && <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>}
      <div className="space-y-2 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

function Formula({ children }) {
  return <div className="rounded-lg border border-indigo-200 bg-white px-4 py-3 text-center text-lg font-semibold tracking-wide text-indigo-900">{children}</div>;
}

function Table({ head, rows, note }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              {r.map((c, j) => <td key={j} className={`px-3 py-2 ${j === 0 ? "font-semibold text-slate-900" : "text-slate-700"}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

function Overview({ go }) {
  const items = [
    ["Sensitivity", "S = V ÷ H", "µV per mm of pen height. A smaller number is more sensitive and draws taller waves.", "sensitivity"],
    ["Time base", "30 mm/s ≈ 10 s per page", "Duration (ms) = width (mm) ÷ speed (mm/s) × 1000. Frequency (Hz) = 1000 ÷ ms.", "timebase"],
    ["Low-frequency filter (LFF)", "high-pass", "Cuts slow activity and drift. Raising it means a shorter time constant and more loss of delta.", "filters"],
    ["High-frequency filter (HFF)", "low-pass", "Cuts fast activity. Lowering it reduces muscle and 60 Hz but rounds spikes.", "filters"],
    ["Notch filter", "60 Hz (50 Hz elsewhere)", "Removes only the mains frequency. A last resort: fix the cause first.", "filters"],
    ["The cutoff", "70.7% = −3 dB", "At its cutoff a filter passes about 70.7% of the amplitude, not 50%, and never removes it outright.", "filters"],
  ];
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-slate-600">
        Three groups of controls decide what you see: how tall waves are drawn (sensitivity), how stretched they are in time (time base)
        and which part of the signal is kept (filters). Nearly every exam question here is one of a few formulas or a cause-and-effect rule.
        Learn those, then use the Filter Lab to see them happen.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(([title, tag, body, tab]) => (
          <button key={title} type="button" onClick={() => go(tab)} className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:shadow-sm">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="mt-1 inline-block rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">{tag}</div>
            <p className="mt-2 text-sm text-slate-600">{body}</p>
          </button>
        ))}
      </div>
      <Card title="Four memory hooks" tone="indigo">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Smaller sensitivity number, bigger waves.</strong> 5 µV/mm draws a wave taller than 10 µV/mm.</li>
          <li><strong>Shorter time constant, higher LFF.</strong> TC 0.1 s is about 1.6 Hz; TC 0.03 s is about 5.3 Hz.</li>
          <li><strong>The LFF is a high-pass filter</strong> (it lets high frequencies through and attenuates the slow ones). The HFF is the opposite.</li>
          <li><strong>Filters change amplitude and shape, not frequency.</strong> An 8 Hz rhythm is still 8 Hz after filtering.</li>
        </ul>
      </Card>
      <button type="button" onClick={() => go("lab")} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
        Open the Filter Lab →
      </button>
    </div>
  );
}

function Sensitivity() {
  const sens = [3, 5, 7, 10, 15, 20];
  return (
    <div className="space-y-5">
      <Card title="The idea">
        <p>Sensitivity tells you how many microvolts one millimetre of pen deflection stands for. It changes only how the wave is drawn. The signal itself is unchanged.</p>
        <Formula>S = V ÷ H</Formula>
        <p className="text-center text-slate-500">V = S × H &nbsp;·&nbsp; H = V ÷ S</p>
        <p>
          7 µV/mm is the usual starting point. A <strong>larger number is less sensitive</strong> (waves look smaller); a <strong>smaller number is more sensitive</strong> (waves look taller).
          Use a less sensitive setting such as 15 or 20 µV/mm for very large activity so traces do not overlap, and a more sensitive one such as 3 to 5 µV/mm for low-voltage activity.
        </p>
      </Card>
      <Table
        head={["Sensitivity", "Height of a 50 µV wave", "Compared with 7 µV/mm"]}
        rows={sens.map((s) => [`${s} µV/mm`, `${heightFromVoltage(s, 50).toFixed(1)} mm`, s === 7 ? "standard" : s < 7 ? "more sensitive, taller" : "less sensitive, shorter"])}
        note="A 50 µV calibration pulse is 5 mm tall at 10 µV/mm and about 7.1 mm tall at 7 µV/mm."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Worked example 1: find the voltage" tone="emerald">
          <p>A wave is 9 mm tall at S = 7 µV/mm.</p>
          <p>V = S × H = 7 × 9 = <strong>63 µV</strong>.</p>
        </Card>
        <Card title="Worked example 2: find the height" tone="emerald">
          <p>An 80 µV wave is displayed at S = 20 µV/mm.</p>
          <p>H = V ÷ S = 80 ÷ 20 = <strong>4 mm</strong>. At S = 10 it would be 8 mm; at S = 5, 16 mm.</p>
        </Card>
        <Card title="Worked example 3: pick a setting" tone="emerald">
          <p>A 12 µV rhythm is only 1.7 mm tall at 7 µV/mm. Changing to S = 3 makes it 12 ÷ 3 = <strong>4 mm</strong>, easier to judge.</p>
        </Card>
        <Card title="Worked example 4: use the calibration pulse" tone="emerald">
          <p>On your screen the 50 µV calibration pulse is 6 mm tall and a wave is 15 mm tall.</p>
          <p>Amplitude = 50 × 15 ÷ 6 = <strong>125 µV</strong>. This screen is effectively 50 ÷ 6 ≈ 8.3 µV/mm.</p>
        </Card>
      </div>
      <Card title="Why use the calibration pulse?" tone="amber">
        <p>On a digital screen or a printout the physical size can differ from the nominal setting. The calibration pulse on the same page is drawn at the same scale as the waves, so the ratio is always safe:</p>
        <Formula>amplitude = calibration µV × wave height ÷ calibration height</Formula>
        <p>Say whether you measured peak to peak or from the baseline. Rhythms are usually reported peak to peak.</p>
      </Card>
    </div>
  );
}

function TimeBase() {
  const widths = [1, 2, 3, 5, 10, 15];
  const note = (mm) => (mm <= 2 ? "spike range (20 to under 70 ms)" : mm <= 6 ? "sharp-wave range (70 to 200 ms)" : "slow wave (single transient)");
  return (
    <div className="space-y-5">
      <Card title="The idea">
        <p>The time base is the horizontal scale. A traditional paper speed is 30 mm/s. On a screen this is usually quoted as seconds per page; 10 s per page corresponds to 300 mm at 30 mm/s.</p>
        <Formula>duration (ms) = width (mm) ÷ speed (mm/s) × 1000</Formula>
        <Formula>frequency (Hz) = 1000 ÷ duration (ms)</Formula>
        <p>At 30 mm/s one millimetre is 33.3 ms, so a 1-second interval is 30 mm wide.</p>
      </Card>
      <Table
        head={["Wave width at 30 mm/s", "Duration", "Frequency if repeated", "Category for a single transient"]}
        rows={widths.map((w) => {
          const ms = durationMs(w, 30);
          return [`${w} mm`, `${ms.toFixed(0)} ms`, `${frequencyHz(ms).toFixed(1)} Hz`, note(w)];
        })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Worked example: width to frequency" tone="emerald">
          <p>A slow wave is 12 mm wide at 30 mm/s.</p>
          <p>Duration = 12 ÷ 30 × 1000 = 400 ms, so the frequency is 1000 ÷ 400 = <strong>2.5 Hz</strong>.</p>
        </Card>
        <Card title="Worked example: frequency to width" tone="emerald">
          <p>How wide is one cycle of a 10 Hz alpha rhythm at 30 mm/s?</p>
          <p>Period = 100 ms, so width = 0.1 × 30 = <strong>3 mm</strong> per cycle.</p>
        </Card>
      </div>
      <Card title="Fast and slow time bases" tone="amber">
        <p>A <strong>faster</strong> time base (fewer seconds per page) spreads waves apart, so rhythms look <strong>slower</strong> and timing, morphology and phase lags are easier to judge.</p>
        <p>A <strong>slower</strong> time base (more seconds per page) squeezes waves together, so rhythms look <strong>faster</strong> and denser. It helps with slow periodic patterns and with sleep review.</p>
        <p>The time base never changes the real frequency; it only changes how it looks. On a printout the physical scale depends on the page size, so use the 1-second marks or the calibration signal.</p>
      </Card>
    </div>
  );
}

function Filters() {
  return (
    <div className="space-y-5">
      <Card title="What each filter does">
        <p><strong>Low-frequency filter (LFF)</strong> is a high-pass filter: it attenuates slow activity and passes fast activity. Use it against slow drift from sweat or movement.</p>
        <p><strong>High-frequency filter (HFF)</strong> is a low-pass filter: it attenuates fast activity and passes slow activity. Use it to reduce muscle activity.</p>
        <p><strong>Notch filter</strong> removes a narrow band at the mains frequency, 60 Hz in the Americas and 50 Hz in much of the world. It leaves other frequencies largely alone.</p>
        <p>Routine recordings are typically made with the LFF at 1 Hz or lower and the HFF at 70 Hz or higher (technical guidelines generally advise against setting the HFF below about 70 Hz). Filters change the amplitude and shape of activity; they do not change its frequency.</p>
      </Card>

      <Card title="The cutoff frequency" tone="indigo">
        <p>The setting you choose is the <strong>cutoff</strong>: the frequency at which the filter passes about <strong>70.7%</strong> of the amplitude, a 30% loss, written −3 dB. It is not 50%, and nothing is removed at that frequency.</p>
        <p>Beyond the cutoff the loss grows gradually. A single-pole filter (the basic textbook model; many real machines use steeper filters) loses about 6 dB per octave once you are well past the cutoff. For the LFF, each halving of the frequency below the cutoff roughly halves the amplitude; for the HFF, each doubling above the cutoff does the same.</p>
        <Formula>LFF gain = f ÷ √(f² + fc²) &nbsp;&nbsp; HFF gain = 1 ÷ √(1 + (f ÷ fc)²)</Formula>
        <p>Example: a 100 µV, 1 Hz delta wave with the LFF at 1 Hz keeps 1 ÷ √2 = 0.71, so <strong>71 µV</strong>. With the LFF at 0.5 Hz it keeps 1 ÷ √1.25 = 0.89, so <strong>89 µV</strong>. The lower the LFF, the less the delta wave is reduced.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-900">LFF: how much slow activity survives?</h4>
          <Table
            head={["LFF", "Time constant", "1 Hz wave", "3 Hz wave"]}
            rows={LFF_CHOICES.map((f) => [
              `${f} Hz`,
              `${timeConstantFromCutoff(f).toFixed(2)} s`,
              pct(highPassGain(1, f)),
              pct(highPassGain(3, f)),
            ])}
            note="Higher LFF: shorter time constant and more loss of slow waves."
          />
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-900">HFF: how much fast activity survives?</h4>
          <Table
            head={["HFF", "Rise time constant", "35 Hz", "60 Hz"]}
            rows={HFF_CHOICES.map((f) => [
              `${f} Hz`,
              `${(timeConstantFromCutoff(f) * 1000).toFixed(1)} ms`,
              pct(lowPassGain(35, f)),
              pct(lowPassGain(60, f)),
            ])}
            note="Even HFF 70 Hz passes well over half of a 60 Hz artifact (about three quarters for an ideal single-pole filter, somewhat less in the lab)."
          />
        </div>
      </div>

      <Card title="Time constant and the calibration pulse" tone="indigo">
        <p>Instead of a frequency, some machines label the LFF with a <strong>time constant (TC)</strong>.</p>
        <Formula>TC = 1 ÷ (2π f) &nbsp;&nbsp;·&nbsp;&nbsp; f = 1 ÷ (2π TC)</Formula>
        <p>
          For the LFF, TC is how long the flat top of a calibration pulse takes to fall to about 37% of its starting height (a fall of about 63%).
          <strong> The shorter the TC, the higher the LFF</strong>: TC 0.03 s is about 5.3 Hz, 0.1 s is 1.6 Hz, 0.3 s is 0.53 Hz and 1 s is 0.16 Hz.
        </p>
        <p>For the HFF the same idea applies to the rise: TC is the time the front edge takes to reach about 63% of its final height. A lower HFF rounds the corner of the pulse; a higher HFF keeps it sharp.</p>
        <p>A quick estimate from a pulse: LFF ≈ 0.16 ÷ TC in seconds. Measure the TC with the caliper in the Filter Lab and check it.</p>
      </Card>

      <ResponseCurve />

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="What goes wrong with filter choices" tone="amber">
          <ul className="list-disc space-y-1 pl-5">
            <li>LFF too high: delta and slow potentials shrink and the baseline recovers too quickly after large deflections.</li>
            <li>LFF very low: slow artifact (sweat, movement, electrode drift) and baseline wander return and can be mistaken for delta activity.</li>
            <li>HFF too low: spikes look rounder and smaller, and may be mistaken for sharp waves or missed.</li>
            <li>HFF high: muscle artifact and 60 Hz are more obvious.</li>
          </ul>
        </Card>
        <Card title="The notch is a last resort" tone="amber">
          <p>Before using a notch filter, remove the cause of the 60 Hz: check electrode impedances and attachment, the ground electrode, cables and connectors, and nearby equipment.</p>
          <p>A notch hides a technical fault and also removes any real activity at that frequency, so use it only when the cause cannot be fixed, and say so in your notes.</p>
        </Card>
      </div>
    </div>
  );
}

function Lab() {
  const steps = [
    ["Read the calibration pulse", "A 50 µV pulse starts near 0.5 s. Switch the LFF between 0.1 and 5.3 Hz: the flat top sags faster as the LFF rises. Use the Caliper to time how long the top takes to fall to about 37% of its height and compare it with the TC in the page header (this works best at LFF 0.3 Hz and above; at 0.1 Hz the TC of 1.6 s is nearly as long as the pulse)."],
    ["Measure amplitude", "Turn on the Amplitude ruler and measure the pulse from the baseline to the top of its leading edge. It reads about 50 µV at LFF 0.1 Hz, a little less at 1 Hz and only about 36 µV at 5.3 Hz, because the top of the pulse sags before the filter lets it settle. Change the sensitivity from 7 to 10 and measure again: the pulse gets shorter in millimetres (7.1 mm to 5 mm) but the µV value is the same."],
    ["Watch the slow wave", "A slow burst sits near 4 to 6 s. Raise the LFF from 0.5 to 5.3 Hz and watch it shrink while the faster rhythms barely change."],
    ["Chase the 60 Hz", "One electrode near T5 picks up 60 Hz, seen in T3-T5 and T5-O1. Try HFF 35 and then 15: the 60 Hz fades but does not disappear, and the spikes near 7 s and 8.3 s lose a little height at 35 and clearly more at 15. Then tick the notch: the 60 Hz goes. In a real recording, fix the electrode first."],
    ["Muscle and spikes", "A muscle burst appears in the right frontotemporal channels (F8, T4) near the end of the page. Compare HFF 70 and 15: the burst shrinks, but the spikes also become blunter. Filters help, and they cost something."],
  ];
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">
        This is a synthetic recording made by NeuroLinea. Change the filters, the sensitivity and the tools, and watch the waves and the calibration pulse respond.
        Use Enlarge for a bigger view.
      </p>
      <EegTracing scene={labScene} caption="NeuroLinea synthetic tracing: calibration pulse, slow burst, spikes, muscle and a 60 Hz electrode artifact." />
      <Card title="Guided exercises" tone="indigo">
        <ol className="list-decimal space-y-2 pl-5">
          {steps.map(([t, body]) => (
            <li key={t}><strong>{t}.</strong> {body}</li>
          ))}
        </ol>
      </Card>
      <Calculators />
    </div>
  );
}

const MISTAKES = [
  ["At the cutoff the filter passes half of the signal.", "About 70.7% passes (−3 dB). Half is a larger loss, −6 dB."],
  ["A bigger sensitivity number makes waves bigger.", "A bigger number is less sensitive: 10 µV/mm draws a wave smaller than 7 µV/mm."],
  ["Raising the LFF lets more slow activity through.", "The LFF is a high-pass filter. Raising it blocks more of the slow activity."],
  ["A longer time constant means a higher LFF.", "A longer TC means a lower LFF: 0.3 s is 0.53 Hz and 0.1 s is 1.6 Hz."],
  ["Lowering the HFF to 15 Hz removes muscle artifact completely.", "It reduces it, rounds spikes and trims fast activity. Relaxing the patient or fixing the electrode comes first."],
  ["A notch filter fixes a 60 Hz problem.", "It hides it. Fix grounding, impedances and cables first; the notch also removes real activity at 60 Hz."],
  ["Filters change the frequency of a rhythm.", "They change amplitude and shape. An 8 Hz rhythm is still 8 Hz."],
  ["A faster time base makes rhythms look faster.", "A faster paper speed spreads waves out, so rhythms look slower. A slower speed squeezes them, so they look faster."],
  ["A 50 µV pulse is always 5 mm tall.", "That is true at 10 µV/mm. At 7 µV/mm it is about 7.1 mm, and screens and printouts can rescale. Use the pulse on the page."],
  ["I can read microvolts straight from the millimetre marks on any printout.", "Printouts rescale. Use calibration µV × wave height ÷ calibration height."],
];

function Mistakes() {
  return (
    <div className="space-y-3">
      <p className="max-w-3xl text-slate-600">Each of these is a trap that exam questions use. Read the wrong idea, then the correct one.</p>
      {MISTAKES.map(([wrong, right]) => (
        <div key={wrong} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900"><span className="mr-1 font-semibold">Wrong idea:</span>{wrong}</div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900"><span className="mr-1 font-semibold">Correct:</span>{right}</div>
        </div>
      ))}
    </div>
  );
}

function Practice() {
  const cases = (casesData.starterCases || []).filter((c) => (c.tags || []).includes("amplifier-controls"));
  return (
    <div className="space-y-5">
      <Card title="Practice with tracings" tone="indigo">
        <p>These cases put the rules to work on tracings you can measure and filter.</p>
        {cases.length === 0 ? (
          <p className="text-slate-500">Cases on this topic are coming soon.</p>
        ) : (
          <ul className="mt-2 grid gap-2 md:grid-cols-2">
            {cases.map((c) => (
              <li key={c.id}>
                <Link to={`/cases/${c.id}`} className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:border-indigo-300 hover:bg-indigo-50/40">
                  {c.title}
                  <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold capitalize text-slate-600">{c.difficulty}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Practice questions">
        <p>Questions on sensitivity, time constants, filters and calibration are included in this app's practice questions. Start a quiz and choose the instrumentation and filters topics, or use Review Incorrect to revisit misses.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link to="/quiz" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Open quizzes</Link>
          <Link to="/study" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">ABRET Study</Link>
        </div>
      </Card>
    </div>
  );
}

export default function AmplifierFilters() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab = TAB_IDS.has(raw) ? raw : "overview";
  const go = (id) => {
    setParams(id === "overview" ? {} : { tab: id }, { replace: false });
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          <span className="font-medium text-slate-900">Amplifier &amp; Filters</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Amplifier Controls &amp; Filters</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Sensitivity, time base, low- and high-frequency filters, time constants and the notch filter, with an interactive lab.
        </p>
      </header>

      <div className="sticky top-[57px] z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur-sm">
        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="Amplifier and filters sections">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => go(id)}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div role="tabpanel">
        {tab === "overview" && <Overview go={go} />}
        {tab === "sensitivity" && <Sensitivity />}
        {tab === "timebase" && <TimeBase />}
        {tab === "filters" && <Filters />}
        {tab === "lab" && <Lab />}
        {tab === "mistakes" && <Mistakes />}
        {tab === "practice" && <Practice />}
      </div>
    </div>
  );
}
