import React, { useMemo, useState } from "react";
import {
  HFF_CHOICES, LFF_CHOICES, bandGain, cutoffFromTimeConstant, durationMs, frequencyHz, gainToDb,
  heightFromVoltage, highPassGain, lowPassGain, sensitivity, timeConstantFromCutoff, voltageFromHeight, widthMm,
} from "../../eeg/filters";

const num = (v) => (v === "" || v == null ? null : Number(v));
const fmt = (x, d = 1) => (Number.isFinite(x) ? Number(x.toFixed(d)).toString() : "—");

function Field({ label, unit, value, onChange, hint }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hint || ""}
          className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </label>
  );
}

function Result({ children }) {
  return <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">{children}</div>;
}

function Box({ title, formula, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="font-semibold text-slate-900">{title}</h4>
      <p className="mb-3 text-xs text-slate-500">{formula}</p>
      {children}
    </div>
  );
}

function SensitivityCalc() {
  const [v, setV] = useState("80");
  const [h, setH] = useState("");
  const [s, setS] = useState("10");
  const out = useMemo(() => {
    const V = num(v), H = num(h), S = num(s);
    const given = [V, H, S].filter((x) => x != null && x > 0).length;
    if (given !== 2) return "Fill exactly two boxes and leave one empty.";
    if (V == null || V <= 0) return `Voltage = ${fmt(voltageFromHeight(S, H))} µV   (V = S × H)`;
    if (H == null || H <= 0) return `Pen height = ${fmt(heightFromVoltage(S, V))} mm   (H = V ÷ S)`;
    return `Sensitivity = ${fmt(sensitivity(V, H))} µV/mm   (S = V ÷ H)`;
  }, [v, h, s]);
  return (
    <Box title="Sensitivity, voltage and height" formula="S = V ÷ H · fill any two boxes">
      <div className="flex flex-wrap gap-4">
        <Field label="Voltage V" unit="µV" value={v} onChange={setV} />
        <Field label="Height H" unit="mm" value={h} onChange={setH} />
        <Field label="Sensitivity S" unit="µV/mm" value={s} onChange={setS} />
      </div>
      <Result>{out}</Result>
    </Box>
  );
}

function TimeCalc() {
  const [w, setW] = useState("9");
  const [speed, setSpeed] = useState("30");
  const [hz, setHz] = useState("");
  const out = useMemo(() => {
    const W = num(w), P = num(speed), F = num(hz);
    if (!P || P <= 0) return "Enter a paper speed.";
    if (F && F > 0) return `A ${fmt(F)} Hz wave lasts ${fmt(1000 / F)} ms and is ${fmt(widthMm(1000 / F, P))} mm wide at ${P} mm/s.`;
    if (W && W > 0) {
      const ms = durationMs(W, P);
      return `Duration = ${fmt(ms)} ms → frequency = ${fmt(frequencyHz(ms), 2)} Hz`;
    }
    return "Enter a width in mm (or a frequency to go the other way).";
  }, [w, speed, hz]);
  return (
    <Box title="Width, duration and frequency" formula="ms = mm ÷ (mm/s) × 1000 · Hz = 1000 ÷ ms">
      <div className="flex flex-wrap gap-4">
        <Field label="Wave width" unit="mm" value={w} onChange={(x) => { setW(x); setHz(""); }} />
        <Field label="Paper speed" unit="mm/s" value={speed} onChange={setSpeed} />
        <Field label="…or a frequency" unit="Hz" value={hz} onChange={(x) => { setHz(x); }} hint="optional" />
      </div>
      <Result>{out}</Result>
    </Box>
  );
}

function GainCalc() {
  const [lff, setLff] = useState(1);
  const [hff, setHff] = useState(70);
  const [f, setF] = useState("1");
  const F = num(f);
  const valid = F && F > 0;
  const hp = valid ? highPassGain(F, lff) : null;
  const lp = valid ? lowPassGain(F, hff) : null;
  const both = valid ? bandGain(F, lff, hff) : null;
  return (
    <Box title="How much of a wave survives the filters?" formula="LFF: f ÷ √(f² + fc²) · HFF: 1 ÷ √(1 + (f ÷ fc)²) · single-pole filters">
      <div className="flex flex-wrap items-end gap-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">LFF</span>
          <select value={lff} onChange={(e) => setLff(Number(e.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1.5">
            {LFF_CHOICES.map((x) => <option key={x} value={x}>{x} Hz</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">HFF</span>
          <select value={hff} onChange={(e) => setHff(Number(e.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1.5">
            {HFF_CHOICES.map((x) => <option key={x} value={x}>{x} Hz</option>)}
          </select>
        </label>
        <Field label="Wave frequency" unit="Hz" value={f} onChange={setF} />
      </div>
      {valid ? (
        <Result>
          {fmt(F, 2)} Hz: LFF passes {fmt(hp * 100)}% ({fmt(gainToDb(hp))} dB) · HFF passes {fmt(lp * 100)}% ({fmt(gainToDb(lp))} dB) · together {fmt(both * 100)}%
        </Result>
      ) : (
        <Result>Enter a frequency above 0 Hz.</Result>
      )}
    </Box>
  );
}

function TcCalc() {
  const [hz, setHz] = useState("1.6");
  const [tc, setTc] = useState("");
  const out = useMemo(() => {
    const T = num(tc), F = num(hz);
    if (T && T > 0) return `TC ${fmt(T, 3)} s → cutoff = ${fmt(cutoffFromTimeConstant(T), 2)} Hz   (f = 1 ÷ 2πTC)`;
    if (F && F > 0) {
      const t = timeConstantFromCutoff(F);
      return `Cutoff ${fmt(F, 2)} Hz → TC = ${fmt(t, 2)} s (${fmt(t * 1000, 1)} ms)   (TC = 1 ÷ 2πf)`;
    }
    return "Enter a cutoff or a time constant.";
  }, [hz, tc]);
  return (
    <Box title="Time constant ↔ cutoff frequency" formula="TC = 1 ÷ (2π f) · shorter TC means a higher cutoff">
      <div className="flex flex-wrap gap-4">
        <Field label="Cutoff" unit="Hz" value={hz} onChange={(x) => { setHz(x); setTc(""); }} />
        <Field label="…or time constant" unit="s" value={tc} onChange={setTc} hint="optional" />
      </div>
      <Result>{out}</Result>
    </Box>
  );
}

export default function Calculators() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SensitivityCalc />
      <TimeCalc />
      <GainCalc />
      <TcCalc />
    </div>
  );
}
