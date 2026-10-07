import React from "react";
import { Navigate, useParams } from "react-router-dom";

/**
 * Old /syndromes and /syndromes/:id links now open the merged Neuroanatomy & Syndromes page,
 * so bookmarks, case links and search results keep working.
 */
const GENETIC = { angelman: "ube3a", rett: "mecp2", lissencephaly: "lis1dcx" };
const RENAMED = { landau_kleffner: "eses_csws" };

export default function SyndromeRedirect() {
  const { id } = useParams();
  if (!id) return <Navigate to="/neuro-syndromes?tab=syndromes" replace />;
  if (GENETIC[id]) return <Navigate to={`/neuro-syndromes?tab=genetics&id=${GENETIC[id]}`} replace />;
  return <Navigate to={`/neuro-syndromes?tab=syndromes&id=${RENAMED[id] || id}`} replace />;
}
