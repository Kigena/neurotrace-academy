import React, { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { tokenizeMedicalText } from "../data/medicalGlossary.js";

const GAP = 10; // px between the term and the bubble
const EDGE = 8; // px kept clear of the viewport edges

/**
 * The visible bubble is portalled to <body> with position: fixed, so a table
 * wrapper or card with overflow: auto/hidden cannot clip it. It opens above the
 * term and flips below when there is not enough room above (e.g. a term in the
 * first row under a header), and is clamped horizontally to the viewport.
 */
function TooltipBubble({ anchor, definition }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    const place = () => {
      const bubble = ref.current;
      if (!bubble || !anchor) return;
      const a = anchor.getBoundingClientRect();
      const b = bubble.getBoundingClientRect();
      const below = a.top - GAP - b.height < EDGE && a.bottom + GAP + b.height <= window.innerHeight - EDGE;
      const top = below ? a.bottom + GAP : a.top - GAP - b.height;
      const centre = a.left + a.width / 2;
      const left = Math.min(Math.max(centre - b.width / 2, EDGE), window.innerWidth - b.width - EDGE);
      setPos({ top, left, below, arrow: centre - left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [anchor]);

  return createPortal(
    <span
      ref={ref}
      aria-hidden="true"
      className={`medical-tooltip-float${pos?.below ? " is-below" : ""}`}
      style={pos ? { top: pos.top, left: pos.left, "--arrow-x": `${pos.arrow}px` } : { top: 0, left: 0, visibility: "hidden" }}
    >
      <span className="medical-tooltip-label">Plain-language definition</span>
      {definition}
    </span>,
    document.body,
  );
}

function MedicalTerm({ children, definition, interactive }) {
  const tooltipId = useId();
  const [anchor, setAnchor] = useState(null);
  const show = useCallback((e) => setAnchor(e.currentTarget), []);
  const hide = useCallback(() => setAnchor(null), []);

  return (
    <dfn
      className="medical-term"
      tabIndex={interactive ? 0 : undefined}
      aria-describedby={interactive ? tooltipId : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={interactive ? show : undefined}
      onBlur={interactive ? hide : undefined}
    >
      {children}
      {/* Screen-reader copy of the definition; the visible bubble is portalled.
          Left out inside buttons, where it would be read as part of the label. */}
      {interactive && (
        <span id={tooltipId} className="medical-tooltip" role="tooltip">
          <span className="medical-tooltip-label">Plain-language definition</span>
          {definition}
        </span>
      )}
      {anchor && <TooltipBubble anchor={anchor} definition={definition} />}
    </dfn>
  );
}

/**
 * Adds inline definitions to known terms in a string. Set interactive={false}
 * inside an existing button so the tooltip does not add a nested tab stop.
 * Set enabled={false} on active assessment text until feedback is available:
 * a definition in either the stem or an option can give the answer away (e.g.
 * "radiculopathy" for "a disease of the nerve roots is termed").
 */
export default function MedicalText({ children, interactive = true, enabled = true }) {
  if (!enabled || typeof children !== "string") return children;

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
