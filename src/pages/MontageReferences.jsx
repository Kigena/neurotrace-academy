import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import EegTracing from "../components/EegTracing.jsx";
import PhaseCalc from "../components/montage/PhaseCalc.jsx";
import { Card, Formula, Table } from "../components/study/ui.jsx";
import lab from "../data/montageLab.json";
import casesData from "../data/cases.json";

/**
 * Montages & References: how the choice of reference changes what a recording shows.
 * Every tracing is a NeuroLinea synthetic recording (src/eeg/generator.js) that can be switched between montages.
 */

const TABS = [
  ["overview", "Overview"],
  ["referential", "Referential"],
  ["contamination", "Ear contamination"],
  ["choosing", "Choosing a reference"],
  ["bipolar", "Bipolar rules"],
  ["lab", "Lab"],
  ["mistakes", "Common mistakes"],
  ["practice", "Practice"],
];
const TAB_IDS = new Set(TABS.map(([id]) => id));

function Overview({ go }) {
  const items = [
    ["Referential", "one electrode − a reference", "Every channel shows one scalp electrode against a shared reference. It is only as good as the reference is quiet.", "referential"],
    ["Ear contamination", "A1 is not silent", "A discharge at T3 spreads into A1, so every A1-referenced channel shows an opposite deflection and T3 itself looks smaller.", "contamination"],
    ["Choosing a reference", "ear · Cz · average · linked ears", "Each reference removes one problem and adds another. Know which to switch to and why.", "choosing"],
    ["Bipolar phase reversal", "toward = negative · away = positive", "In a chain of pairs, the electrode where the deflections meet or part carries the maximum.", "bipolar"],
    ["Cancellation and end of chain", "equal = flat · end = no reversal", "Equal potentials give a flat channel, and a maximum at the end of a chain gives no reversal at all.", "bipolar"],
    ["Laplacian", "electrode − its 4 neighbours", "A sharpening derivation between bipolar and average reference.", "choosing"],
  ];
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-slate-600">
        The same brain activity looks different in every montage. Bipolar chains find where a potential peaks; referential montages show its size and spread, but only if the reference stays quiet.
        This page gives you the rules, then lets you switch montages on the same recording and watch them happen.
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
          <li><strong>Input 1 more negative than input 2 deflects up.</strong> More positive deflects down.</li>
          <li><strong>The reference is never perfectly quiet.</strong> The ears pick up temporal activity; Cz picks up vertex waves and spindles in sleep.</li>
          <li><strong>Toward each other = negative reversal; away from each other = positive reversal.</strong> The shared electrode is the most negative point for a negative reversal and the most positive for a positive one.</li>
          <li><strong>No reversal does not mean no focus.</strong> The maximum may sit at the end of the chain or beyond it.</li>
        </ul>
      </Card>
      <button type="button" onClick={() => go("lab")} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
        Open the lab →
      </button>
    </div>
  );
}

function Referential() {
  return (
    <div className="space-y-5">
      <Card title="The idea">
        <p>In a referential montage every channel compares one scalp electrode (input 1) with one common reference (input 2), so each channel shows that electrode&apos;s activity relative to the reference.</p>
        <Formula>channel = electrode − reference</Formula>
        <p>
          The assumption is that the reference is electrically inactive. If so, every channel shows the true amplitude, frequency and timing of the activity under its electrode.
          That is the ideal, and it is never fully true: ear electrodes sit close to the temporal lobes, and Cz sits on the vertex where sleep potentials are largest.
        </p>
      </Card>
      <Card title="The deflection rule (it explains everything on this page)" tone="indigo">
        <ul className="list-disc space-y-1 pl-5">
          <li>If input 1 is <strong>more negative</strong> than input 2, the result is negative and the pen goes <strong>up</strong>.</li>
          <li>If input 1 is <strong>more positive</strong> than input 2 (or input 2 is more negative), the result is positive and the pen goes <strong>down</strong>.</li>
          <li>If both are the same, the channel is flat.</li>
        </ul>
        <p>So a quiet electrode referenced to a reference that has gone negative deflects <strong>down</strong>, even though nothing happened under it.</p>
      </Card>
      <Table
        head={["Reference", "Best for", "Watch out for"]}
        rows={[
          ["Ipsilateral ear (A1 for the left, A2 for the right)", "Routine recording; the ears are far from most of the scalp.", "Ear contamination when a discharge is near the temporal lobe: the ear becomes active."],
          ["Opposite ear (all channels to one ear)", "A discharge that is contaminating its own ear: switch to the other ear.", "Homologous channels are no longer comparable in amplitude because the distances to the reference are unequal."],
          ["Cz", "Comparing amplitude between left and right; avoids ear contamination.", "Not suitable in drowsiness or sleep: vertex waves, spindles and other sleep potentials contaminate every channel. Also unsuitable when the discharge is at or near the vertex."],
          ["Average of the electrodes", "Delineating a focus: negative at the focus, with small, mostly positive (downward) deflections at distant electrodes; also used for mapping.", "A large focal or artifact electrode in the average pollutes all channels. Leave out Fp1 and Fp2 (blinks) and any very active electrode."],
          ["Linked ears (A1 and A2 combined)", "Reducing EKG pickup at the ears.", "It still carries any activity that reaches either ear."],
          ["Laplacian (source) derivation", "Making a focus stand out: each electrode minus the mean of the four around it.", "Accuracy improves with more electrodes; it can look different from what bipolar chains show."],
        ]}
      />
      <Card title="Chin, nose and cheek references" tone="amber">
        <p>These can be used, but nothing guarantees they are inactive. Volume-conducted spikes from the temporal lobe can be picked up on the face or jaw, and they pick up eye-movement, tongue-movement and muscle artifact.</p>
        <p>A reference far from the head (non-cephalic) picks up a lot of EKG. A balanced reference, which electronically cancels the EKG with a cervical and a chest electrode, helps.</p>
      </Card>
    </div>
  );
}

function Contamination() {
  return (
    <div className="space-y-5">
      <Card title="What happens when a discharge is near an ear">
        <p>A sharp discharge with its maximum at T3 spreads into the nearby left ear electrode, A1, and makes it negative too. Every channel referenced to A1 now subtracts a negative reference:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>T3-A1</strong> is smaller than the true amplitude at T3, because A1 shares part of the field and the two partly cancel.</li>
          <li><strong>Every other A1 channel</strong> (F3, C3, P3, O1 and so on) deflects <strong>down</strong> with the discharge, although those electrodes recorded no discharge. The reference went negative, so the result is positive.</li>
        </ul>
        <p>To an untrained eye this looks like a widespread downward discharge across every channel referenced to that ear, with a smaller discharge at T3. That is the trap.</p>
      </Card>
      <Card title="How to see through it" tone="indigo">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Notice that the spurious deflections are all <strong>downward</strong> and appear at the same instant in every channel that shares the reference.</li>
          <li>Switch to a different reference: refer all channels to the <strong>other ear</strong> (A2), or use <strong>Cz</strong> or an <strong>average</strong> reference.</li>
          <li>Check that the discharge now shows its true size at T3 and that the spurious deflections have gone.</li>
          <li>Document which montage you used and why.</li>
        </ol>
        <p>Referring everything to the contaminated ear does the opposite: it spreads the discharge into every channel.</p>
        <p>Linked ears do not fix this: the T3 discharge reaches the linked reference too, so every channel still shows a smaller downward deflection. Use the other ear, Cz or an average reference.</p>
      </Card>
      <EegTracing scene={lab.earT3} caption="T3 spikes near 2.0, 5.1 and 8.2 s. Start in the ipsilateral ear montage, then open All to A2, All to A1, Cz ref, Average and Linked ears." />
      <Card title="EKG at the ears" tone="amber">
        <p>Ear references tend to pick up the EKG more than scalp-to-scalp bipolar montages do. The QRS has opposite polarity at the two ears, so in the left-ear channels it swings one way and in the right-ear channels the other way. Joining A1 and A2 electrically (linked ears) reduces it, because the opposite-polarity QRS signals partly cancel.</p>
        <p>Linked ears reduce the EKG but do not make the reference perfect: it still carries any activity that reaches either ear.</p>
      </Card>
      <EegTracing scene={lab.ekgEars} caption="A strong heartbeat in the ear-referenced channels. Compare the ipsilateral-ear montage with Linked ears." />
    </div>
  );
}

function Choosing() {
  return (
    <div className="space-y-5">
      <Card title="Cz reference: good until the patient falls asleep">
        <p>A Cz reference gives a fairly true amplitude and distribution for a temporal discharge and lets you compare left and right homologous channels, because the distances to Cz are matched.</p>
        <p>But Cz is the electrode where vertex waves and spindles are largest. In drowsiness or sleep every channel then subtracts those potentials, and they appear in every channel, usually with the opposite polarity to what Cz is doing. It is also unsuitable when the discharge itself is at or near the vertex.</p>
      </Card>
      <EegTracing scene={lab.czSleep} caption="Vertex waves near 2.4 and 6.6 s and spindles near 4.0 and 8.0 s. Compare the ear-referenced montage with Cz ref." />
      <Card title="Average reference" tone="indigo">
        <p>The average reference subtracts the mean of the electrodes from each channel. Positive and negative values balance, so the sum of all channels is close to zero. A focal negative discharge appears at its maximum, with small positive (downward) deflections at distant electrodes.</p>
        <p>Because the mean is made from the electrodes you include, a large artifact or very active electrode in the average spreads into every channel. That is why Fp1 and Fp2 are usually left out: a blink would show up inverted in all channels. Compare it with the referential and Cz views in the tracing below.</p>
      </Card>
      <EegTracing scene={lab.avgF4} caption="Right frontal spikes near 3.2 and 6.4 s with large blinks at 1.2 and 8.3 s. Fp1 and Fp2 are left out of the average. Try the Laplacian tab for the sharpest view." />
      <Card title="Laplacian (source) derivation">
        <p>Each electrode is referred to its own reference, made from the average of the four surrounding electrodes. This produces steeper potential gradients, so focal features stand out from their neighbours. It sits between bipolar and average-reference montages in character, and it gets more accurate when more electrodes are used.</p>
      </Card>
      <Table
        head={["Situation", "A sensible choice"]}
        rows={[
          ["A focal discharge near T3 contaminates A1", "Refer all channels to A2, or use Cz or an average reference"],
          ["Comparing amplitude between hemispheres, patient awake", "Cz reference (homologous distances are matched)"],
          ["Patient drowsy or asleep", "Not Cz: use another reference or a bipolar montage"],
          ["Strong EKG in ear channels", "Linked ears (and check the electrodes)"],
          ["Delineating the extent of a focus", "Average reference without Fp1 and Fp2, or a Laplacian view"],
        ]}
      />
    </div>
  );
}

function Bipolar() {
  return (
    <div className="space-y-5">
      <Card title="Phase reversal in a chain of pairs">
        <p>In a bipolar montage the electrodes are connected in chains: input 2 of one channel is input 1 of the next. A potential that is largest at one electrode shows up as a <strong>phase reversal</strong>: two neighbouring channels deflect in opposite directions at the electrode they share.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Negative phase reversal:</strong> the deflections point <strong>toward</strong> each other. The shared electrode has the most negative potential.</li>
          <li><strong>Positive phase reversal:</strong> the deflections point <strong>away</strong> from each other. The shared electrode has the most positive potential.</li>
        </ul>
        <p>Most spikes are negative at the surface, so a negative phase reversal is the common finding.</p>
      </Card>
      <PhaseCalc />
      <Card title="Three special cases" tone="amber">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Cancellation.</strong> If two electrodes carry the same potential, the channel between them is flat. A focus midway between two electrodes can therefore hide in that channel.</li>
          <li><strong>Double phase reversal.</strong> When two peaks of potential exist at the same time, two reversals can appear side by side. In a bipolar chain this is most often artifact, such as head movement, and the first suspicion should be artifact. It can occur in genuine activity but rarely: when discharges at T3 and T4 are both larger than at Cz, the transverse chain (T3-C3-Cz-C4-T4) shows a positive reversal at Cz, because C3-Cz and Cz-C4 point away from each other, while T3 and T4 sit at the ends of that chain. The longitudinal chains show a negative reversal at T3 and another at T4 (a butterfly pattern).</li>
          <li><strong>End of chain.</strong> If the maximum is at input 1 of the first channel or input 2 of the last channel, every deflection points the same way and there is <strong>no reversal</strong>. The true maximum may be at that electrode or even further out. Add electrodes to the chain, or change montage until a reversal appears.</li>
        </ul>
      </Card>
      <EegTracing scene={lab.butterfly} caption="Simultaneous T3 and T4 discharges near 3.0 and 6.5 s in the transverse chain. Find the reversal at Cz, then compare the longitudinal montage." />
    </div>
  );
}

function Lab() {
  const steps = [
    ["Ear contamination", "In the ear-referenced page, find the three T3 spikes. Which channels move down at the same time? Switch to All to A2: what changes at T3 and elsewhere? Now try All to A1."],
    ["Cz in sleep", "On the sleep page, watch a vertex wave in the ear montage and then in Cz ref. Where do you see it now?"],
    ["EKG at the ears", "On the heartbeat page, compare the left-ear and right-ear channels, then switch to Linked ears."],
    ["Average reference", "On the frontal spike page, see the maximum at F4 in Average, with small deflections elsewhere that are mostly downward at distant electrodes (a few near F4 can point up). Then open Laplacian."],
    ["Butterfly", "On the T3/T4 page, find the reversal at Cz in the transverse montage."],
  ];
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">Each recording below is a NeuroLinea synthetic page. Use the montage tabs to switch reference and watch the same activity change.</p>
      <EegTracing scene={lab.earT3} caption="Ear contamination: a T3 discharge." />
      <EegTracing scene={lab.czSleep} caption="Sleep: vertex waves and spindles." />
      <EegTracing scene={lab.ekgEars} caption="Heartbeat in ear-referenced channels." />
      <EegTracing scene={lab.avgF4} caption="Right frontal spikes with blinks." />
      <EegTracing scene={lab.butterfly} caption="Simultaneous T3 and T4 discharges." />
      <Card title="Guided exercises" tone="indigo">
        <ol className="list-decimal space-y-2 pl-5">
          {steps.map(([t, body]) => (
            <li key={t}><strong>{t}.</strong> {body}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

const MISTAKES = [
  ["A referential montage always shows the true amplitude under each electrode.", "Only if the reference is quiet. Ear contamination makes the discharge look smaller at the focus and puts spurious deflections in other channels."],
  ["If A1 is contaminated, refer everything to A1 to see it better.", "That spreads the discharge into every channel. Switch to the other ear, Cz or an average reference."],
  ["A Cz reference is a safe choice at any time.", "Not in drowsiness or sleep: vertex waves and spindles then contaminate every channel."],
  ["A quiet channel that deflects with a discharge elsewhere must be involved.", "It may only share a contaminated reference. Check which channels share the reference and which way they point."],
  ["The average reference must include every electrode.", "Leave out Fp1 and Fp2, and any electrode with a large artifact or very active focus, or they spill into every channel."],
  ["Linked ears make the reference perfectly inactive.", "They reduce EKG, but the reference still carries any activity that reaches either ear."],
  ["Deflections pointing toward each other mean a positive reversal.", "Toward each other is negative (maximum negativity at the shared electrode); away is positive."],
  ["No phase reversal means there is no focus.", "A maximum at the end of a chain gives no reversal. Add electrodes or change the montage."],
  ["Two phase reversals side by side always show two real foci.", "A double phase reversal in a bipolar chain is artifact until proven otherwise. A genuine butterfly pattern is rare."],
  ["A flat channel between two active electrodes means nothing happened.", "If both electrodes carry the same potential they cancel, and the focus may sit between them."],
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
  const cases = (casesData.starterCases || []).filter((c) => (c.tags || []).includes("montages"));
  return (
    <div className="space-y-5">
      <Card title="Practice with tracings" tone="indigo">
        <p>These cases put the rules to work on recordings you can switch between montages.</p>
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
        <p>Montage and referencing questions are included in this app&apos;s practice questions. Start a quiz and choose the montage topics, or use Review Incorrect to revisit misses.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link to="/quiz" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Open quizzes</Link>
          <Link to="/study" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">ABRET Study</Link>
        </div>
      </Card>
    </div>
  );
}

export default function MontageReferences() {
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
          <span className="font-medium text-slate-900">Montages &amp; References</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Montages &amp; References</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Referential and bipolar montages, ear contamination, choosing a reference, phase reversals and the Laplacian, with recordings you can switch.
        </p>
      </header>

      <div className="sticky top-[57px] z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur-sm">
        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="Montages and references sections">
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
        {tab === "referential" && <Referential />}
        {tab === "contamination" && <Contamination />}
        {tab === "choosing" && <Choosing />}
        {tab === "bipolar" && <Bipolar />}
        {tab === "lab" && <Lab />}
        {tab === "mistakes" && <Mistakes />}
        {tab === "practice" && <Practice />}
      </div>
    </div>
  );
}
