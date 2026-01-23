import React from "react";

function FilterPanel({ category, onCategoryChange, location, onLocationChange }) {
  const categories = [
    "all",
    "normal",
    "normal_variant",
    "epileptiform",
    "periodic",
    "encephalopathy",
  ];
  const locations = [
    "all",
    "frontal",
    "temporal",
    "central",
    "parietal",
    "occipital",
    "generalized",
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Category
        </label>
        <select
          className="text-sm border border-slate-300 rounded-md px-2 py-1"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All" : cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Topography
        </label>
        <select
          className="text-sm border border-slate-300 rounded-md px-2 py-1"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc === "all" ? "All" : loc}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default FilterPanel;
