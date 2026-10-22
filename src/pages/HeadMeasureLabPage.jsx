import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";

// three.js is large, so the 3D lab loads only on this page.
const HeadMeasureLab = lazy(() => import("../components/lab/HeadMeasureLab.jsx"));

/** 10-20 head measurement skills lab: measure, calculate and mark on a 3D head. */
export default function HeadMeasureLabPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-700">Home</Link><span>/</span>
          <span className="font-medium text-slate-900">10-20 Measurement Lab</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">10-20 Measurement Lab</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Practise measuring the head for the International 10-20 System on a life-size 3D head. Find the landmarks, run a
          flexible tape over the scalp, work out the 10% and 20% distances and mark each electrode. Every placement is graded
          against the ideal position.
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-slate-500">Loading the 3D head...</p>}>
        <HeadMeasureLab />
      </Suspense>
    </div>
  );
}
