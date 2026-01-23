/**
 * Helper function to get quiz tags for a pattern
 * Extracts relevant tags from pattern data to match questions in the question bank
 */
export function getPatternQuizTags(pattern) {
  const tags = [];
  
  // Use cross_links.quiz_tags if available (highest priority)
  if (pattern.cross_links?.quiz_tags && pattern.cross_links.quiz_tags.length > 0) {
    tags.push(...pattern.cross_links.quiz_tags);
  }
  
  // Add pattern-specific tags based on pattern name
  const patternNameLower = pattern.name?.toLowerCase() || "";
  if (patternNameLower.includes("pdr") || patternNameLower.includes("posterior dominant")) {
    if (!tags.includes("pdr")) tags.push("pdr");
  }
  if (patternNameLower.includes("mu rhythm") || patternNameLower.includes("mu")) {
    if (!tags.includes("mu")) tags.push("mu");
  }
  if (patternNameLower.includes("wicket")) {
    if (!tags.includes("wicket")) tags.push("wicket");
  }
  if (patternNameLower.includes("spike") || patternNameLower.includes("sharp")) {
    if (!tags.includes("epileptiform")) tags.push("epileptiform");
  }
  if (patternNameLower.includes("slowing")) {
    if (!tags.includes("slowing")) tags.push("slowing");
  }
  if (patternNameLower.includes("artifact")) {
    if (!tags.includes("artifact")) tags.push("artifact");
  }
  if (patternNameLower.includes("sleep") || patternNameLower.includes("spindle") || patternNameLower.includes("k-complex")) {
    if (!tags.includes("sleep")) tags.push("sleep");
  }
  
  // Add category as lowercase tag (e.g., "normal", "epileptiform")
  const categoryLower = pattern.category?.toLowerCase() || "";
  if (categoryLower && !tags.includes(categoryLower)) {
    tags.push(categoryLower);
  }
  
  // Add topography tags (e.g., "occipital", "posterior", "temporal")
  if (pattern.topography && pattern.topography.length > 0) {
    pattern.topography.forEach(topo => {
      const topoLower = topo.toLowerCase();
      if (!tags.includes(topoLower)) {
        tags.push(topoLower);
      }
    });
  }
  
  // Fallback: if no tags found, use common pattern-related tags
  if (tags.length === 0) {
    tags.push("normal-variants", "pattern-recognition");
  }
  
  return tags;
}






