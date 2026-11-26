import React, { useId } from "react";

// Decorative paint stays clipped to the placement outline and below the lab overlays.
export default function LimbSurface({ outline, contours = [], relief = [], nails = [], horizontal = false }) {
  const id = useId();
  const clip = `${id}-clip`;
  const skin = `${id}-skin`;
  const light = `${id}-light`;
  const shade = `${id}-shade`;

  return (
    <g aria-hidden="true" pointerEvents="none">
      <defs>
        <clipPath id={clip}><path d={outline} /></clipPath>
        <linearGradient id={skin} x2={horizontal ? "0%" : "100%"} y2={horizontal ? "100%" : "0%"}>
          <stop stopColor="#bb8a74" />
          <stop offset=".24" stopColor="#e4b59a" />
          <stop offset=".44" stopColor="#f5d4b8" />
          <stop offset=".66" stopColor="#e9bea3" />
          <stop offset=".87" stopColor="#d19d84" />
          <stop offset="1" stopColor="#af7d6b" />
        </linearGradient>
        <radialGradient id={light}>
          <stop stopColor="#fff0d9" stopOpacity=".84" />
          <stop offset="1" stopColor="#fff0d9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={shade}>
          <stop stopColor="#9e5750" stopOpacity=".65" />
          <stop offset="1" stopColor="#9e5750" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={outline} fill={`url(#${skin})`} />
      <g clipPath={`url(#${clip})`}>
        {relief.map(([cx, cy, rx, ry, rotation, tone, opacity], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rotation} ${cx} ${cy})`}
            fill={`url(#${tone === "light" ? light : shade})`} opacity={opacity} />
        ))}
        {contours.map((d) => (
          <path key={d} d={d} fill="none" stroke="#824e43" strokeWidth=".85" strokeLinecap="round" opacity=".42" />
        ))}
        {nails.map(([cx, cy, width, height, rotation]) => (
          <rect key={`${cx}-${cy}`} x={cx - width / 2} y={cy - height / 2} width={width} height={height}
            rx={width * .32} fill="#f1c3b0" stroke="#a47162" strokeWidth=".55"
            transform={`rotate(${rotation} ${cx} ${cy})`} />
        ))}
      </g>
      <path d={outline} fill="none" stroke="#9d7060" strokeWidth="1.1" />
    </g>
  );
}
