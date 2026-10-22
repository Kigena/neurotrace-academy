import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ELECTRODES } from "../../eeg/generator";
import {
  AREAS, ARTERIES, ELECTRODE_INFO, HEAD_CENTER, LOBES,
  areaAt, arteryAt, describePoint, electrodeDirection, lobeAt,
} from "../../neuro/brainRegions";

/**
 * Interactive 3D brain for neuroanatomy: rotate and zoom, switch overlays
 * (lobes, functional areas, arterial territories), show the 10-20 electrodes
 * projected onto the cortex, click anything to learn what it is, and test
 * yourself in quiz mode. Regions are approximations painted on a single
 * surface model (see src/neuro/brainRegions.js).
 */

const MODEL_URL = "/models/brain/brain.gltf";
const LAYERS = [
  ["none", "Plain"],
  ["lobes", "Lobes"],
  ["areas", "Key areas"],
  ["arteries", "Arteries"],
];
const VIEWS = [
  ["left", "Left", [1, 0.05, 0]],
  ["right", "Right", [-1, 0.05, 0]],
  ["top", "Top", [0, 1, -0.02]],
  ["bottom", "Bottom", [0, -1, 0.02]],
  ["front", "Front", [0, 0.1, 1]],
  ["back", "Back", [0, 0.1, -1]],
];
const SIDE_TEXT = { left: "Left hemisphere", right: "Right hemisphere", midline: "Midline" };

const QUIZ = [
  { q: "Click the area whose damage causes expressive (non-fluent) aphasia.", ok: (h) => h.area === "broca", show: ["areas", "broca"], a: "Broca area, in the left (dominant) inferior frontal gyrus." },
  { q: "Click the area whose damage causes fluent aphasia with poor comprehension.", ok: (h) => h.area === "wernicke", show: ["areas", "wernicke"], a: "Wernicke area, in the left posterior superior temporal gyrus." },
  { q: "Click the primary motor cortex, which sends voluntary movement commands to the opposite side of the body.", ok: (h) => h.area === "motor", show: ["areas", "motor"], a: "The precentral gyrus, just in front of the central sulcus." },
  { q: "Click the lobe that contains the primary visual cortex.", ok: (h) => h.lobe === "occipital", show: ["lobes", "occipital"], a: "The occipital lobe; primary visual cortex surrounds the calcarine sulcus." },
  { q: "Click the lobe where focal epilepsy most often begins in adults.", ok: (h) => h.lobe === "temporal", show: ["lobes", "temporal"], a: "The temporal lobe, especially its mesial structures." },
  { q: "Click the structure below the tentorium that coordinates movement on the same side.", ok: (h) => h.lobe === "cerebellum", show: ["lobes", "cerebellum"], a: "The cerebellum, in the posterior fossa below the tentorium." },
  { q: "Click cortex supplied by the anterior cerebral artery.", ok: (h) => h.artery === "aca", show: ["arteries", "aca"], a: "The ACA supplies the medial surface and a strip along the top of the frontal and parietal lobes." },
  { q: "Click the territory most often affected in ischemic stroke.", ok: (h) => h.artery === "mca", show: ["arteries", "mca"], a: "The MCA supplies most of the lateral convexity." },
  { q: "Click cortex supplied by the posterior cerebral artery.", ok: (h) => h.artery === "pca", show: ["arteries", "pca"], a: "The PCA supplies the occipital lobe and the inferior and medial temporal lobe." },
  { q: "Click the electrode over the left central (hand) region.", ok: (h) => h.electrode === "C3", electrodes: true, a: "C3 lies over the left central (Rolandic) hand area." },
  { q: "Click the electrode where vertex waves are maximal.", ok: (h) => h.electrode === "Cz", electrodes: true, a: "Cz, the vertex, over the leg area of the motor and sensory strips." },
  { q: "Click the left posterior temporal electrode, the one closest to Wernicke area.", ok: (h) => h.electrode === "T5", electrodes: true, a: "T5 (P7), the left posterior temporal electrode." },
  { q: "Click an electrode where the posterior dominant rhythm is maximal.", ok: (h) => h.electrode === "O1" || h.electrode === "O2", electrodes: true, a: "O1 or O2, over the occipital lobes." },
  { q: "Click the right frontopolar electrode, where eye blinks are largest.", ok: (h) => h.electrode === "Fp2", electrodes: true, a: "Fp2, the right frontopolar electrode (Fp1 is on the left)." },
];

const DEFS = { lobes: LOBES, areas: AREAS, arteries: ARTERIES };
const FIELD = { lobes: "lobe", areas: "area", arteries: "artery" };

/** Creator of the 3D model, for the CC BY 4.0 credit (set from the model's listing). */
const MODEL_AUTHOR = "danes_dysfunction";
const keyFor = (layer, p) => (layer === "lobes" ? lobeAt(p) : layer === "areas" ? areaAt(p) : layer === "arteries" ? arteryAt(p) : null);
const mix = (c, k) => c.map((v) => 1 - k + v * k);

export default function Brain3D() {
  const mountRef = useRef(null);
  const labelsRef = useRef(null);
  const three = useRef({});
  const [status, setStatus] = useState("loading");
  const [layer, setLayer] = useState("lobes");
  const [focus, setFocus] = useState(null); // highlighted region key in the current layer
  const [showElectrodes, setShowElectrodes] = useState(false);
  const [info, setInfo] = useState(null);
  const [mode, setMode] = useState("explore");
  const [quiz, setQuiz] = useState({ i: 0, score: 0, answered: null });

  const quizItem = QUIZ[quiz.i % QUIZ.length];
  const effLayer = mode === "quiz" ? (quiz.answered ? quizItem.show?.[0] || "none" : "none") : layer;
  const effFocus = mode === "quiz" ? (quiz.answered ? quizItem.show?.[1] || null : null) : focus;
  const effElectrodes = mode === "quiz" ? !!quizItem.electrodes : showElectrodes;

  // ---------------------------------------------------------------- setup
  useEffect(() => {
    const mount = mountRef.current;
    const t = three.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.005, 2);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6b7280, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    scene.add(key);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 0.12;
    controls.maxDistance = 0.45;
    controls.target.set(0, 0.044, 0);
    Object.assign(t, { renderer, scene, camera, controls, key, dots: new THREE.Group(), electrodes: [] });
    scene.add(t.dots);

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false); // CSS keeps the canvas at 100% of its box
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();
    t.setView = (dir) => {
      t.anim = { from: camera.position.clone(), to: new THREE.Vector3(...dir).normalize().multiplyScalar(0.21).add(controls.target), t: 0 };
    };
    camera.position.set(0.19, 0.06, 0.09);

    let raf;
    const tick = () => {
      if (t.anim) {
        t.anim.t = Math.min(1, t.anim.t + 0.06);
        const e = 1 - (1 - t.anim.t) ** 3;
        camera.position.lerpVectors(t.anim.from, t.anim.to, e);
        if (t.anim.t >= 1) t.anim = null;
      }
      controls.update();
      key.position.copy(camera.position).add(new THREE.Vector3(0, 0.15, 0));
      renderer.render(scene, camera);
      t.placeLabels?.();
      raf = requestAnimationFrame(tick);
    };
    tick();

    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        scene.add(gltf.scene);
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((o) => { if (o.isMesh) t.mesh = o; });
        const pos = t.mesh.geometry.attributes.position;
        const mm = new Float32Array(pos.count * 3);
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(t.mesh.matrixWorld).multiplyScalar(1000);
          mm.set([v.x, v.y, v.z], i * 3);
        }
        t.mm = mm;
        // region key per vertex for each layer, computed once
        t.keys = {};
        for (const L of ["lobes", "areas", "arteries"]) {
          const arr = new Array(pos.count);
          for (let i = 0; i < pos.count; i++) arr[i] = keyFor(L, [mm[i * 3], mm[i * 3 + 1], mm[i * 3 + 2]]);
          t.keys[L] = arr;
        }
        t.colors = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);
        t.mesh.geometry.setAttribute("color", t.colors);
        t.mesh.material.vertexColors = true;
        t.mesh.material.needsUpdate = true;
        // electrodes projected onto the cortex
        const rc = new THREE.Raycaster();
        const c = new THREE.Vector3(...HEAD_CENTER).multiplyScalar(0.001);
        for (const [name, xy] of Object.entries(ELECTRODES)) {
          if (!ELECTRODE_INFO[name]) continue;
          const d = new THREE.Vector3(...electrodeDirection(xy)).normalize();
          rc.set(c.clone().add(d.clone().multiplyScalar(0.2)), d.clone().negate());
          const hit = rc.intersectObject(t.mesh, false)[0];
          if (!hit) continue;
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0021, 16, 16), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }));
          dot.position.copy(hit.point).add(d.clone().multiplyScalar(0.0008));
          dot.userData.electrode = name;
          t.dots.add(dot);
          t.electrodes.push({ name, dot, normal: d });
        }
        t.paint?.();
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
      t.mesh?.geometry.dispose();
    };
  }, []);

  // ------------------------------------------------------------ painting
  const paint = useCallback(() => {
    const t = three.current;
    if (!t.colors) return;
    const arr = t.colors.array;
    const keys = t.keys[effLayer];
    const defs = DEFS[effLayer];
    for (let i = 0; i < t.colors.count; i++) {
      let c = [1, 1, 1];
      const k = keys ? keys[i] : null;
      if (k && defs[k]) c = effFocus ? (k === effFocus ? defs[k].color : mix(defs[k].color, 0.18)) : mix(defs[k].color, 0.75);
      arr[i * 3] = c[0]; arr[i * 3 + 1] = c[1]; arr[i * 3 + 2] = c[2];
    }
    t.colors.needsUpdate = true;
  }, [effLayer, effFocus]);
  useEffect(() => {
    three.current.paint = paint;
    paint();
  }, [paint]);

  useEffect(() => {
    const t = three.current;
    t.dots.visible = effElectrodes;
    const host = labelsRef.current;
    host.innerHTML = "";
    if (!effElectrodes) { t.placeLabels = null; return; }
    const els = t.electrodes.map((e) => {
      const el = document.createElement("span");
      el.textContent = e.name;
      el.className = "pointer-events-none absolute -translate-x-1/2 -translate-y-[140%] rounded bg-slate-900/85 px-1 text-[10px] font-semibold text-white";
      host.appendChild(el);
      return [e, el];
    });
    t.placeLabels = () => {
      const { camera, renderer } = t;
      const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight;
      const toCam = new THREE.Vector3();
      for (const [e, el] of els) {
        toCam.copy(camera.position).sub(e.dot.position).normalize();
        const facing = toCam.dot(e.normal) > -0.05;
        const p = e.dot.position.clone().project(camera);
        el.style.display = facing ? "block" : "none";
        el.style.left = `${((p.x + 1) / 2) * w}px`;
        el.style.top = `${((1 - p.y) / 2) * h}px`;
      }
    };
  }, [effElectrodes, status]);

  // ------------------------------------------------------------ picking
  const down = useRef(null);
  const onPointerDown = (e) => { down.current = [e.clientX, e.clientY]; };
  const onPointerUp = (e) => {
    const t = three.current;
    if (!down.current || !t.mesh) return;
    const moved = Math.hypot(e.clientX - down.current[0], e.clientY - down.current[1]);
    down.current = null;
    if (moved > 5) return; // a drag rotates; only a click picks
    const rect = t.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const rc = new THREE.Raycaster();
    rc.setFromCamera(ndc, t.camera);
    let hit = null;
    if (effElectrodes) {
      const d = rc.intersectObjects(t.dots.children, false)[0];
      if (d) hit = { electrode: d.object.userData.electrode };
    }
    if (!hit) {
      const m = rc.intersectObject(t.mesh, false)[0];
      if (!m) return;
      const p = m.point.clone().multiplyScalar(1000);
      hit = describePoint([p.x, p.y, p.z]);
    }
    if (mode === "quiz") {
      if (quiz.answered) return;
      const ok = quizItem.ok(hit);
      setQuiz((s) => ({ ...s, score: s.score + (ok ? 1 : 0), answered: ok ? "right" : "wrong" }));
      setInfo(hit);
    } else {
      setInfo(hit);
      if (!hit.electrode && layer !== "none") {
        const k = hit[FIELD[layer]] || null;
        setFocus((f) => (f === k ? null : k));
      }
    }
  };

  const legend = useMemo(() => (effLayer === "none" ? [] : Object.entries(DEFS[effLayer])), [effLayer]);
  const startQuiz = () => { setMode("quiz"); setQuiz({ i: Math.floor(Math.random() * QUIZ.length), score: 0, answered: null, n: 0 }); setInfo(null); };
  const nextQuestion = () => { setQuiz((s) => ({ i: s.i + 1, score: s.score, answered: null, n: (s.n || 0) + 1 })); setInfo(null); };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div className="flex rounded-lg border border-slate-300 bg-white p-0.5" role="group" aria-label="Mode">
          {[["explore", "Explore"], ["quiz", "Quiz me"]].map(([k, l]) => (
            <button key={k} type="button" onClick={() => (k === "quiz" ? startQuiz() : (setMode("explore"), setInfo(null)))}
              className={`rounded-md px-3 py-1.5 font-semibold ${mode === k ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{l}</button>
          ))}
        </div>
        {mode === "explore" && (
          <>
            <div className="flex flex-wrap rounded-lg border border-slate-300 bg-white p-0.5" role="group" aria-label="Overlay">
              {LAYERS.map(([k, l]) => (
                <button key={k} type="button" onClick={() => { setLayer(k); setFocus(null); }}
                  className={`rounded-md px-2.5 py-1.5 font-semibold ${layer === k ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{l}</button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 font-semibold text-slate-700">
              <input type="checkbox" checked={showElectrodes} onChange={(e) => setShowElectrodes(e.target.checked)} /> 10-20 electrodes
            </label>
          </>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
        <div className="relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-200">
          <div ref={mountRef} className="h-[420px] w-full cursor-grab touch-none sm:h-[520px]" onPointerDown={onPointerDown} onPointerUp={onPointerUp} />
          <div ref={labelsRef} className="pointer-events-none absolute inset-0" />
          {status !== "ready" && (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-600">
              {status === "error" ? "The 3D model could not be loaded." : "Loading the 3D brain..."}
            </div>
          )}
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
            {VIEWS.map(([k, l, dir]) => (
              <button key={k} type="button" onClick={() => three.current.setView?.(dir)} className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white">{l}</button>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          {mode === "quiz" ? (
            <section className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 text-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">Question {(quiz.n || 0) + 1} · score {quiz.score}</div>
              <p className="font-semibold text-slate-900">{quizItem.q}</p>
              {!quiz.answered && <p className="mt-2 text-slate-600">Rotate the brain, then click your answer.</p>}
              {quiz.answered && (
                <div className={`mt-3 rounded-lg px-3 py-2 ${quiz.answered === "right" ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>
                  <strong>{quiz.answered === "right" ? "Correct. " : "Not quite. "}</strong>{quizItem.a}
                </div>
              )}
              {quiz.answered && <button type="button" onClick={nextQuestion} className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white">Next question</button>}
            </section>
          ) : (
            <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">How to use</div>
              <p className="text-slate-600">Drag to rotate, scroll or pinch to zoom, and click the brain to identify a region. Click a coloured region again to clear the highlight.</p>
            </section>
          )}

          {info && <InfoCard info={info} />}

          {mode === "explore" && legend.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Legend</div>
              <ul className="space-y-1">
                {legend.map(([k, d]) => (
                  <li key={k}>
                    <button type="button" onClick={() => setFocus((f) => (f === k ? null : k))} className={`flex w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-slate-50 ${focus === k ? "font-semibold" : ""}`}>
                      <span className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ background: `rgb(${d.color.map((v) => Math.round(v * 255)).join(",")})` }} />
                      {d.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Region outlines are teaching approximations drawn on a stylized surface model, not a segmented atlas; language areas are shown on the left hemisphere, which is dominant for language in most people.
        3D model: &ldquo;Stylized Human Brain Anatomy&rdquo; by {MODEL_AUTHOR} (Fab), licensed{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY 4.0</a>.
        Changes by NeuroLinea: textures resized for the web, region overlays and electrodes added.
      </p>
    </div>
  );
}

function InfoCard({ info }) {
  if (info.electrode) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Electrode</div>
        <h4 className="text-base font-semibold text-slate-900">{info.electrode}</h4>
        <p className="mt-1 text-slate-700">{ELECTRODE_INFO[info.electrode]}</p>
      </section>
    );
  }
  const lobe = LOBES[info.lobe];
  const area = info.area ? AREAS[info.area] : null;
  const artery = ARTERIES[info.artery];
  return (
    <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{SIDE_TEXT[info.side]}</div>
      <div>
        <h4 className="text-base font-semibold text-slate-900">{lobe.label}</h4>
        <p className="text-slate-700">{lobe.text}</p>
      </div>
      {area && (
        <div>
          <h5 className="font-semibold text-slate-900">{area.label}</h5>
          <p className="text-slate-700">{area.text}</p>
        </div>
      )}
      <div>
        <h5 className="font-semibold text-slate-900">Blood supply: {artery.label}</h5>
        <p className="text-slate-700">{artery.text}</p>
      </div>
    </section>
  );
}
