import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { HEAD_URL, LANDMARKS, LANDMARK_INFO } from "../../neuro/headModel";
import { ELECTRODE_ORDER, buildMesh, dist, idealPositions, nearestOnPath, pointAlong, tapePath } from "../../neuro/headMeasure";
import { STEPS, TOLERANCE, checkCalc, gradeMark } from "../../neuro/headLabSteps";

/**
 * 10-20 measurement skills lab on a life-size 3D head (centimetres).
 * Guided mode walks through the standard procedure: find the landmarks,
 * measure each arc with a flexible tape, work out the percentages and mark
 * every electrode, graded against the ideal positions. Free practice offers a
 * tape (follows the scalp) and a caliper (straight line) on any two points.
 */

const VIEWS = [["Front", [0, 0.25, 1]], ["Left", [1, 0.2, 0]], ["Right", [-1, 0.2, 0]], ["Back", [0, 0.25, -1]], ["Top", [0, 1, 0.05]]];
const GRADE_STYLE = { good: "bg-emerald-100 text-emerald-900", close: "bg-amber-100 text-amber-900", off: "bg-rose-100 text-rose-900" };
const GRADE_TEXT = { good: "On target", close: "Close", off: "Off target" };
const v3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
const arr = (v) => [v.x, v.y, v.z];

/** A point lifted slightly off the scalp so markers and tape sit on top of it. */
function outward(p, k = 0.12) {
  const c = v3(LANDMARKS.center);
  const v = v3(p);
  return v.add(v.clone().sub(c).normalize().multiplyScalar(k));
}

/** Draw a flexible tape along a path, with a tick every centimetre (larger every 5 cm). */
function drawTape(group, path, length, color = 0xf59e0b) {
  group.clear();
  if (!path || path.length < 2) return;
  const pts = path.map((p) => outward(p));
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(16, pts.length * 3), 0.13, 6, false), new THREE.MeshStandardMaterial({ color, roughness: 0.5 })));
  const tick = new THREE.MeshBasicMaterial({ color: 0x1f2937 });
  for (let s = 1; s < length; s += 1) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(s % 5 === 0 ? 0.22 : 0.13, 8, 8), tick);
    m.position.copy(outward(pointAlong(path, s), 0.2));
    group.add(m);
  }
}

function dot(p, color, r = 0.42) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.4 }));
  m.position.copy(outward(p, 0.25));
  return m;
}

export default function HeadMeasureLab() {
  const mountRef = useRef(null);
  const labelsRef = useRef(null);
  const T = useRef({}); // three.js objects and geometry, outside React state
  const [status, setStatus] = useState("loading");
  const [mode, setMode] = useState("guided");
  const [stepIdx, setStepIdx] = useState(0);
  const [taskIdx, setTaskIdx] = useState(0);
  const [feedback, setFeedback] = useState(null); // { kind, text }
  const [tapes, setTapes] = useState({}); // id -> { path, length, from, to }
  const [placed, setPlaced] = useState({}); // electrode or landmark -> { p, d, grade }
  const [calcInput, setCalcInput] = useState("");
  const [live, setLive] = useState(null); // live tape length while dragging
  const [tool, setTool] = useState("tape"); // free practice: tape | caliper
  const [showIdeal, setShowIdeal] = useState(false);
  const [freeResult, setFreeResult] = useState(null);

  const step = STEPS[stepIdx];
  const task = step?.tasks[taskIdx];
  const done = mode === "guided" && !step;

  // ---------------------------------------------------------------- scene
  useEffect(() => {
    const mount = mountRef.current;
    const t = T.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 400);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a70, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    scene.add(key);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 30;
    controls.maxDistance = 110;
    controls.target.set(0, 168, 3);
    camera.position.set(28, 176, 52);
    const groups = { tape: new THREE.Group(), marks: new THREE.Group(), ideal: new THREE.Group(), live: new THREE.Group() };
    Object.values(groups).forEach((g) => scene.add(g));
    Object.assign(t, { renderer, scene, camera, controls, key, groups, labels: [] });
    if (import.meta.env.DEV) window.__headLab = t; // lets browser tests project points to the screen

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();
    t.setView = (dir) => { t.anim = { from: camera.position.clone(), to: v3(dir).normalize().multiplyScalar(62).add(controls.target), k: 0 }; };

    let raf;
    const tick = () => {
      if (t.anim) {
        t.anim.k = Math.min(1, t.anim.k + 0.06);
        camera.position.lerpVectors(t.anim.from, t.anim.to, 1 - (1 - t.anim.k) ** 3);
        if (t.anim.k >= 1) t.anim = null;
      }
      controls.update();
      key.position.copy(camera.position).add(new THREE.Vector3(0, 30, 0));
      renderer.render(scene, camera);
      placeLabels(t);
      raf = requestAnimationFrame(tick);
    };
    tick();

    new GLTFLoader().load(
      HEAD_URL,
      (gltf) => {
        gltf.scene.traverse((o) => {
          if (o.isMesh) {
            o.material = new THREE.MeshStandardMaterial({ color: 0xe9c6ab, roughness: 0.72, metalness: 0 });
            t.headMesh = o;
          }
        });
        scene.add(gltf.scene);
        const g = t.headMesh.geometry;
        t.mesh = buildMesh(g.attributes.position.array, g.index.array, LANDMARKS);
        t.ideal = idealPositions(t.mesh).positions;
        setStatus("ready");
      },
      undefined,
      () => setStatus("error"),
    );
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  const resolve = (name) => (LANDMARKS[name] || T.current.ideal?.[name]);

  // redraw marks whenever placements change
  useEffect(() => {
    const t = T.current;
    if (!t.groups) return;
    t.groups.marks.clear();
    t.labels = [];
    for (const [name, m] of Object.entries(placed)) {
      const color = m.grade === "good" ? 0x059669 : m.grade === "close" ? 0xd97706 : 0xdc2626;
      t.groups.marks.add(dot(m.p, color));
      t.labels.push({ name: LANDMARK_INFO[name]?.label || name, p: m.p });
      if (m.grade !== "good" && resolve(name)) {
        t.groups.marks.add(dot(resolve(name), 0x2563eb, 0.3)); // where it should have been
      }
    }
    rebuildLabels(t, labelsRef.current);
  }, [placed, status]);

  useEffect(() => {
    const t = T.current;
    if (!t.groups || status !== "ready") return;
    t.groups.ideal.clear();
    if (showIdeal || done) {
      for (const name of ELECTRODE_ORDER) t.groups.ideal.add(dot(t.ideal[name], 0x2563eb, 0.32));
      for (const k of ["nasion", "inion", "lpa", "rpa"]) t.groups.ideal.add(dot(LANDMARKS[k], 0x7c3aed, 0.32));
    }
  }, [showIdeal, done, status]);

  // ---------------------------------------------------------------- input
  const hitAt = (e) => {
    const t = T.current;
    if (!t.headMesh) return null;
    const rect = t.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const rc = new THREE.Raycaster();
    rc.setFromCamera(ndc, t.camera);
    const h = rc.intersectObject(t.headMesh, false)[0];
    return h ? arr(h.point) : null;
  };
  const tapeActive = () => (mode === "free" ? tool : task?.type === "tape" ? "tape" : null);

  // A tape (or caliper) can be pulled in one press-drag-release, or anchored:
  // click the start point, rotate the head freely (the live tape follows the
  // pointer with its length), then click the end point. Esc cancels.
  const down = useRef(null);
  const draft = useRef(null); // { kind, start, samples, end, res, pressed }
  const snap = (p, names) => {
    // guided mode: the tape hooks onto the required start or end point when close
    if (mode !== "guided") return p;
    for (const n of names) { const q = resolve(n); if (q && dist(p, q) <= TOLERANCE.endpoint * 1.35) return q; }
    return p;
  };
  const updateDraft = (p, e) => {
    const d = draft.current, t = T.current;
    d.end = mode === "guided" && task ? snap(p, [task.to, task.from].filter((n) => resolve(n) && dist(resolve(n), d.start) > 0.5)) : p;
    if (dist(p, d.samples[d.samples.length - 1]) > 0.4) d.samples.push(p);
    d.res = d.kind === "caliper" ? { path: [d.start, d.end], length: dist(d.start, d.end) } : tapePath(t.mesh, d.start, d.end, viaFromSamples(d));
    if (d.kind === "caliper") drawCaliper(t.groups.live, d.start, d.end);
    else drawTape(t.groups.live, d.res.path, d.res.length);
    setLive({ length: d.res.length, x: e.clientX, y: e.clientY });
  };
  const cancelDraft = () => { draft.current = null; T.current.groups?.live.clear(); setLive(null); };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") cancelDraft(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPointerDown = (e) => {
    const t = T.current;
    down.current = { x: e.clientX, y: e.clientY };
    const kind = tapeActive();
    if (!kind || draft.current) return; // with a tape anchored, dragging rotates the head
    const p = hitAt(e);
    if (!p) return; // background drag rotates
    t.controls.enabled = false;
    const start = mode === "guided" && task ? snap(p, [task.from, task.to]) : p;
    draft.current = { kind, start, samples: [start], end: start, res: null, pressed: true };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!draft.current) return;
    const p = hitAt(e);
    if (p) updateDraft(p, e);
  };
  const onPointerUp = (e) => {
    const t = T.current;
    t.controls.enabled = true;
    const moved = down.current ? Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) : 99;
    down.current = null;
    const d = draft.current;
    if (d?.pressed) {
      d.pressed = false;
      // press-drag-release over the head finishes the tape; a click leaves it anchored
      if (moved >= 6 && d.res && dist(d.start, d.end) > 1) { draft.current = null; setLive(null); finishTape(d); }
      return;
    }
    if (moved >= 6) return; // that was a rotation
    const p = hitAt(e);
    if (!p) return;
    if (d) {
      updateDraft(p, e);
      draft.current = null;
      setLive(null);
      if (dist(d.start, d.end) > 1) finishTape(d);
      else cancelDraft();
      return;
    }
    onClickHead(p);
  };

  const viaFromSamples = (d) => {
    // the drag sample farthest from the straight line start-end fixes the plane of the tape
    const a = v3(d.start), b = v3(d.end), ab = b.clone().sub(a);
    let best = null, bestD = 0;
    for (const s of d.samples) {
      const p = v3(s);
      const tt = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / (ab.lengthSq() || 1)));
      const dd = p.distanceTo(a.clone().add(ab.clone().multiplyScalar(tt)));
      if (dd > bestD) { bestD = dd; best = s; }
    }
    if (best && bestD > 1) return best;
    const mid = a.clone().add(b).multiplyScalar(0.5);
    return arr(mid.add(mid.clone().sub(v3(LANDMARKS.center)).normalize().multiplyScalar(10)));
  };

  const drawCaliper = (group, a, b) => {
    group.clear();
    const curve = new THREE.LineCurve3(outward(a, 0.3), outward(b, 0.3));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 2, 0.1, 6, false), new THREE.MeshStandardMaterial({ color: 0x0ea5e9 })));
    group.add(dot(a, 0x0ea5e9, 0.3), dot(b, 0x0ea5e9, 0.3));
  };

  // --------------------------------------------------------------- tasks
  const advance = () => {
    setFeedback(null);
    setCalcInput("");
    if (taskIdx + 1 < step.tasks.length) setTaskIdx(taskIdx + 1);
    else { setStepIdx(stepIdx + 1); setTaskIdx(0); }
  };

  const finishTape = (d) => {
    const t = T.current;
    if (mode === "free") {
      if (d.kind === "tape") drawTape(t.groups.tape, d.res.path, d.res.length);
      else drawCaliper(t.groups.tape, d.start, d.end);
      t.groups.live.clear();
      setFreeResult({ kind: d.kind, length: d.res.length });
      return;
    }
    t.groups.live.clear();
    const A = resolve(task.from), B = resolve(task.to), V = resolve(task.via);
    const fwd = dist(d.start, A) <= TOLERANCE.endpoint && dist(d.end, B) <= TOLERANCE.endpoint;
    const rev = dist(d.start, B) <= TOLERANCE.endpoint && dist(d.end, A) <= TOLERANCE.endpoint;
    if (!fwd && !rev) {
      const name = (n) => LANDMARK_INFO[n]?.label || n;
      setFeedback({ kind: "off", text: `The tape must run from ${name(task.from)} to ${name(task.to)}. Hook it within ${TOLERANCE.endpoint} cm of each point and try again.` });
      return;
    }
    const exact = fwd ? tapePath(t.mesh, A, B, V) : tapePath(t.mesh, B, A, V);
    if (!fwd) exact.path.reverse();
    // the user's trail must not clearly follow another route (for example the wrong side of the head)
    const trail = d.samples.filter((q) => dist(q, A) > 3 && dist(q, B) > 3);
    const strays = trail.filter((q) => nearestOnPath(exact.path, q).d > 4).length;
    if (trail.length >= 4 && strays > trail.length * 0.6) {
      setFeedback({ kind: "off", text: "That tape took a different route. Follow the route described in the step and try again." });
      return;
    }
    drawTape(t.groups.tape, exact.path, exact.length);
    setTapes((s) => ({ ...s, [task.id]: { ...exact, from: task.from } }));
    // cross-check: the 50% point of this tape should agree with a point you already marked
    const check = { coronal: "Cz", left: "T3", right: "T4" }[task.id];
    let extra = "";
    if (check && placed[check]) {
      const gap = dist(pointAlong(exact.path, exact.length / 2), placed[check].p);
      // Cz should match closely; the circumference and coronal arcs meet near T3/T4 only to within about a centimetre
      const limit = check === "Cz" ? 0.5 : 1.0;
      extra = ` Its 50% point is ${gap.toFixed(1)} cm from your ${check}; ${gap <= limit ? "they agree." : `they should agree within about ${limit} cm, so re-check both measurements.`}`;
    }
    setFeedback({ kind: "good", text: `Measured ${exact.length.toFixed(1)} cm.${extra}`, next: true });
  };

  const onClickHead = (p) => {
    if (mode === "free" || !task) return;
    if (task.type === "pick") {
      const d = dist(p, LANDMARKS[task.target]);
      const grade = d <= TOLERANCE.landmark ? "good" : d <= 2 * TOLERANCE.landmark ? "close" : "off";
      setPlaced((s) => ({ ...s, [task.target]: { p, d, grade } }));
      setFeedback({ kind: grade, text: `${GRADE_TEXT[grade]}: ${d.toFixed(1)} cm from the ${LANDMARK_INFO[task.target].label.toLowerCase()}. ${LANDMARK_INFO[task.target].text}`, next: true });
    } else if (task.type === "mark") {
      const candidates = (task.tapes || [task.tape]).map((id) => tapes[id]).filter(Boolean);
      let q = p, along = null, tp = candidates[0], bestD = 1.5;
      for (const c of candidates) {
        const n = nearestOnPath(c.path, p);
        if (n.d < bestD) { bestD = n.d; q = n.p; along = n.s; tp = c; } // marks are made along a tape
      }
      const d = dist(q, T.current.ideal[task.electrode]);
      const grade = gradeMark(d);
      setPlaced((s) => ({ ...s, [task.electrode]: { p: q, d, grade } }));
      const target = tp ? nearestOnPath(tp.path, T.current.ideal[task.electrode]).s : null;
      setFeedback({
        kind: grade,
        text: `${GRADE_TEXT[grade]}: ${d.toFixed(1)} cm from the ideal ${task.electrode}.${along != null && target != null ? ` You marked ${along.toFixed(1)} cm along the tape; the target is ${target.toFixed(1)} cm.` : ""}`,
        next: true,
      });
    }
  };

  const submitCalc = () => {
    const tp = tapes[task.tape];
    const ok = checkCalc(calcInput, tp.length, task.fraction);
    const right = (tp.length * task.fraction).toFixed(1);
    setFeedback({ kind: ok ? "good" : "off", text: ok ? `Correct: ${right} cm.` : `${task.fraction * 100}% of ${tp.length.toFixed(1)} cm is ${right} cm.`, next: true });
  };

  const restart = () => {
    const t = T.current;
    Object.values(t.groups).forEach((g) => g.clear());
    setPlaced({}); setTapes({}); setStepIdx(0); setTaskIdx(0); setFeedback(null); setCalcInput(""); setFreeResult(null);
  };
  const switchMode = (m) => { restart(); setMode(m); };

  // ------------------------------------------------------------- summary
  const electrodeResults = ELECTRODE_ORDER.filter((n) => placed[n]).map((n) => ({ n, ...placed[n] }));
  const score = electrodeResults.length ? Math.round((100 * electrodeResults.filter((r) => r.grade === "good").length) / electrodeResults.length) : 0;
  const symmetry = (() => {
    if (!done || !tapes.left || !tapes.right) return null;
    const d = Math.abs(tapes.left.length - tapes.right.length);
    let text = `Symmetry: the left and right half-circumferences differ by ${d.toFixed(1)} cm${d > 1 ? " (re-measure if more than about 1 cm)" : ""}.`;
    if (tapes.coronal && placed.Cz) {
      const s = nearestOnPath(tapes.coronal.path, placed.Cz.p).s;
      text += ` Your Cz splits the preauricular tape ${s.toFixed(1)} / ${(tapes.coronal.length - s).toFixed(1)} cm.`;
    }
    return `${text} Check that Fp1/Fp2, F7/F8, T5/T6 and O1/O2 look symmetric.`;
  })();
  const hoverHint = task?.type === "mark" && tapes[task.tape] ? "Click on the tape to place the electrode; marks snap to the tape." : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div className="flex rounded-lg border border-slate-300 bg-white p-0.5" role="group" aria-label="Mode">
          {[["guided", "Guided procedure"], ["free", "Free practice"]].map(([k, l]) => (
            <button key={k} type="button" onClick={() => switchMode(k)} className={`rounded-md px-3 py-1.5 font-semibold ${mode === k ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{l}</button>
          ))}
        </div>
        {mode === "free" && (
          <>
            <div className="flex rounded-lg border border-slate-300 bg-white p-0.5" role="group" aria-label="Tool">
              {[["tape", "Tape (follows the scalp)"], ["caliper", "Caliper (straight line)"]].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setTool(k)} className={`rounded-md px-2.5 py-1.5 font-semibold ${tool === k ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{l}</button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 font-semibold text-slate-700">
              <input type="checkbox" checked={showIdeal} onChange={(e) => setShowIdeal(e.target.checked)} /> Show 10-20 positions
            </label>
          </>
        )}
        <button type="button" onClick={restart} className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100">Start over</button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-200">
          <div ref={mountRef} className="h-[440px] w-full touch-none sm:h-[560px]" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />
          <div ref={labelsRef} className="pointer-events-none absolute inset-0" />
          {live && (
            <div className="pointer-events-none fixed z-50 -translate-y-8 rounded bg-slate-900 px-2 py-0.5 text-xs font-bold text-white" style={{ left: live.x + 12, top: live.y }}>
              {live.length.toFixed(1)} cm
            </div>
          )}
          {status !== "ready" && (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-600">
              {status === "error" ? "The 3D head could not be loaded." : "Loading the 3D head..."}
            </div>
          )}
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
            {VIEWS.map(([l, dir]) => (
              <button key={l} type="button" onClick={() => T.current.setView?.(dir)} className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white">{l}</button>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-3 text-sm">
          {mode === "free" ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="font-semibold text-slate-900">Free practice</h4>
              <p className="mt-1 text-slate-600">Click a start point on the head, move along the route you want (rotate by dragging), then click the end point; or press and drag for short distances. The tape follows the scalp; the caliper measures the straight-line distance. Esc cancels.</p>
              {freeResult && <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-900">{freeResult.kind === "tape" ? "Tape" : "Caliper"}: {freeResult.length.toFixed(1)} cm</p>}
            </section>
          ) : done ? (
            <section className="space-y-2 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
              <h4 className="text-base font-semibold text-slate-900">Measurement complete</h4>
              <p className="text-slate-700"><strong>{score}%</strong> of electrodes within {TOLERANCE.good} cm of the ideal position. Blue dots show the ideal 10-20 positions. &ldquo;Close&rdquo; (up to {TOLERANCE.close} cm) is about half an electrode spacing, so it is not acceptable on a patient.</p>
              {symmetry && <p className="rounded-lg bg-white px-3 py-2 text-slate-700">{symmetry}</p>}
              <ul className="max-h-64 space-y-0.5 overflow-auto">
                {electrodeResults.map((r) => (
                  <li key={r.n} className={`flex justify-between rounded px-2 py-0.5 ${GRADE_STYLE[r.grade]}`}><span className="font-semibold">{r.n}</span><span>{r.d.toFixed(1)} cm</span></li>
                ))}
              </ul>
              <button type="button" onClick={restart} className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white">Measure again</button>
            </section>
          ) : (
            <section className="space-y-2 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Step {stepIdx + 1} of {STEPS.length} · {step.title}</div>
              {taskIdx === 0 && <p className="text-slate-700">{step.intro}</p>}
              <p className="font-semibold text-slate-900">{task.prompt}</p>
              {task.type === "tape" && !feedback && <p className="text-slate-600">Click the start point to hook the tape, rotate the head by dragging, then click the end point. The tape follows the pointer with its length. Esc cancels.</p>}
              {hoverHint && !feedback && <p className="text-slate-600">{hoverHint}</p>}
              {task.type === "calc" && !feedback && (
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); submitCalc(); }}>
                  <input value={calcInput} onChange={(e) => setCalcInput(e.target.value)} inputMode="decimal" placeholder="cm" className="w-24 rounded-md border border-slate-300 px-2 py-1" />
                  <button type="submit" className="rounded-md bg-indigo-600 px-3 py-1 font-semibold text-white">Check</button>
                </form>
              )}
              {feedback && (
                <div className={`rounded-lg px-3 py-2 ${GRADE_STYLE[feedback.kind] || "bg-slate-100"}`}>{feedback.text}</div>
              )}
              {feedback?.next && <button type="button" onClick={advance} className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white">Next</button>}
              {feedback && !feedback.next && <button type="button" onClick={() => setFeedback(null)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700">Try again</button>}
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="font-semibold text-slate-900">Measurements so far</h4>
            {Object.keys(tapes).length === 0 ? <p className="mt-1 text-slate-500">None yet.</p> : (
              <ul className="mt-1 space-y-0.5">
                {Object.entries(tapes).map(([id, tp]) => <li key={id} className="flex justify-between"><span>{TAPE_NAMES[id] || id}</span><span className="font-semibold">{tp.length.toFixed(1)} cm</span></li>)}
              </ul>
            )}
          </section>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        The head is life-size (nasion to inion about 37 cm). Ideal positions follow the standard 10-20 measurements from the nasion, inion and preauricular points; a placement within {TOLERANCE.good} cm counts as on target.
        3D head model: &ldquo;Soldier head&rdquo; by {HEAD_CREDIT} (Fab), used under the Fab Standard License as part of this lab; converted to glTF by NeuroLinea.
      </p>
    </div>
  );
}

/** Creator credit for the head model (set from the model's licence). */
const HEAD_CREDIT = "Davlet";

const TAPE_NAMES = { midline: "Nasion to inion", coronal: "Preauricular to preauricular", left: "Left half-circumference", right: "Right half-circumference", f3: "Fp1 to C3", f3b: "F7 to Fz", f4: "Fp2 to C4", f4b: "F8 to Fz", p3: "C3 to O1", p3b: "T5 to Pz", p4: "C4 to O2", p4b: "T6 to Pz" };

function rebuildLabels(t, host) {
  if (!host) return;
  host.innerHTML = "";
  t.labelEls = t.labels.map((l) => {
    const el = document.createElement("span");
    el.textContent = l.name;
    el.className = "absolute -translate-x-1/2 -translate-y-[150%] rounded bg-slate-900/80 px-1 text-[10px] font-semibold text-white";
    host.appendChild(el);
    return [l, el];
  });
}

function placeLabels(t) {
  if (!t.labelEls?.length) return;
  const w = t.renderer.domElement.clientWidth, h = t.renderer.domElement.clientHeight;
  const c = new THREE.Vector3(...LANDMARKS.center);
  for (const [l, el] of t.labelEls) {
    const p = new THREE.Vector3(...l.p);
    const facing = t.camera.position.clone().sub(p).normalize().dot(p.clone().sub(c).normalize()) > 0;
    const s = p.clone().project(t.camera);
    el.style.display = facing ? "block" : "none";
    el.style.left = `${((s.x + 1) / 2) * w}px`;
    el.style.top = `${((1 - s.y) / 2) * h}px`;
  }
}
