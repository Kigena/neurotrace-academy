import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { quizApi } from "../../services/quizApi";
import { Card } from "./ui.jsx";

/**
 * End-of-section quiz for a study page's Practice tab: runs the Challenge
 * questions written for this page (server study set `setKey`) in practice
 * mode, with feedback and explanations after each answer.
 */
export default function SectionQuiz({ setKey }) {
  const [state, setState] = useState({ loading: true, count: 0, error: null });

  useEffect(() => {
    let cancelled = false;
    quizApi
      .getStudySets()
      .then((res) => {
        if (cancelled) return;
        const set = (res.sets || []).find((s) => s.key === setKey);
        setState({ loading: false, count: set ? set.count : 0, error: null });
      })
      .catch((err) => !cancelled && setState({ loading: false, count: 0, error: err.message || "Unable to load the question count" }));
    return () => {
      cancelled = true;
    };
  }, [setKey]);

  const { loading, count, error } = state;
  const href = (n) => `/quiz/session?studySet=${encodeURIComponent(setKey)}&questions=${n}`;
  const sizes = [10, 20].filter((n) => n < count);

  return (
    <Card title="Section quiz" tone="indigo">
      {loading && <p>Loading the questions for this section...</p>}
      {!loading && error && <p className="text-rose-700">{error}</p>}
      {!loading && !error && count === 0 && <p>Questions for this section are being prepared. Use the general quizzes for now.</p>}
      {!loading && !error && count > 0 && (
        <>
          <p>
            <strong>{count} questions</strong> written for this section. Each answer shows the explanation straight away, and your
            results count toward your progress and Review Incorrect.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {sizes.map((n) => (
              <Link key={n} to={href(n)} className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
                {n} questions
              </Link>
            ))}
            <Link to={href("all")} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              All {count} questions
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
