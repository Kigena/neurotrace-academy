import React, { useId } from "react";
import { tokenizeMedicalText } from "../data/medicalGlossary.js";

function MedicalTerm({ children, definition, interactive }) {
  const tooltipId = useId();

  return (
    <dfn
      className="medical-term"
      tabIndex={interactive ? 0 : undefined}
      aria-describedby={interactive ? tooltipId : undefined}
      title={interactive ? undefined : definition}
    >
      {children}
      <span id={tooltipId} className="medical-tooltip" role="tooltip">
        <span className="medical-tooltip-label">Plain-language definition</span>
        {definition}
      </span>
    </dfn>
  );
}

/**
 * Adds inline definitions to known terms in a string. Set interactive={false}
 * inside an existing button so the tooltip does not add a nested tab stop.
 */
export default function MedicalText({ children, interactive = true }) {
  if (typeof children !== "string") return children;

  return tokenizeMedicalText(children).map((part, index) =>
    part.definition ? (
      <MedicalTerm key={`${part.term}-${index}`} definition={part.definition} interactive={interactive}>
        {part.text}
      </MedicalTerm>
    ) : (
      <React.Fragment key={index}>{part.text}</React.Fragment>
    ),
  );
}
