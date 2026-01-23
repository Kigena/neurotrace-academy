/**
 * Shared Tag System for Cross-Linking Content
 * 
 * This utility provides a centralized tag system that allows content
 * across Workflow, Patterns, Standards, and Quiz pages to be linked
 * by common topics.
 */

export const TAG_LABELS = {
  // Technical
  filters: "Filters & Settings",
  sensitivity: "Sensitivity",
  timebase: "Timebase",
  montages: "Montages",
  calibration: "Calibration",
  instrumentation: "Instrumentation",
  
  // Procedures
  activation: "Activation Procedures",
  hyperventilation: "Hyperventilation",
  photic: "Photic Stimulation",
  sleep: "Sleep",
  
  // Electrodes & Placement
  electrodes: "Electrodes",
  "10-20": "10-20 System",
  impedance: "Impedance",
  localization: "Localization",
  polarity: "Polarity",
  
  // Patterns & Recognition
  patterns: "Patterns",
  normal: "Normal Patterns",
  "normal-variant": "Normal Variants",
  "benign-sharp": "Benign Sharp Transients",
  wicket: "Wicket Spikes",
  mu: "Mu Rhythm",
  lambda: "Lambda Waves",
  "small-sharp-spikes": "Small Sharp Spikes (BETS)",
  bets: "Benign Epileptiform Transients of Sleep",
  epileptiform: "Epileptiform",
  slowing: "Slowing",
  "diffuse-slowing": "Diffuse Slowing",
  "focal-slowing": "Focal Slowing",
  encephalopathy: "Encephalopathy",
  background: "Background",
  pdr: "Posterior Dominant Rhythm (PDR)",
  theta: "Theta Activity",
  delta: "Delta Activity",
  artifacts: "Artifacts",
  "60hz": "60 Hz Artifact",
  "electrode-pop": "Electrode Pop",
  metabolic: "Metabolic",
  toxic: "Toxic",
  hypoxic: "Hypoxic",
  "pattern-differentiation": "Pattern Differentiation",
  
  // Patient Care
  "patient-care": "Patient Care",
  communication: "Communication",
  rapport: "Rapport",
  
  // Documentation & Safety
  documentation: "Documentation",
  history: "History Taking",
  safety: "Safety",
  ethics: "Ethics",
  professionalism: "Professionalism",
  
  // Special Populations
  pediatrics: "Pediatrics",
  neonatal: "Neonatal",
  icu: "ICU",
  
  // Special Studies
  eci: "ECI / Brain Death",
  "brain-death": "Brain Death",
  critical: "Critical Values",
  
  // Standards
  acns: "ACNS",
  abret: "ABRET",
  aset: "ASET",
  
  // Legal & Compliance
  hipaa: "HIPAA",
  privacy: "Privacy",
  confidentiality: "Confidentiality",
  osha: "OSHA",
  "electrical-safety": "Electrical Safety",
  "patient-safety": "Patient Safety",
  "infection-control": "Infection Control",
  disinfection: "Disinfection",
  "professional-standards": "Professional Standards",
  "emergency-response": "Emergency Response",
  contraindications: "Contraindications",
  
  // Knowledge Areas
  neuroanatomy: "Neuroanatomy",
  epilepsy: "Epilepsy",
  pharmacology: "Pharmacology",
  planning: "Planning",
  teamwork: "Teamwork",
  archiving: "Archiving",
  "data-management": "Data Management",
  legal: "Legal",
};

/**
 * Get all tags for a piece of content
 */
export function getContentTags(content) {
  const tags = [];
  
  if (content.tags) {
    tags.push(...content.tags);
  }
  
  // Auto-detect tags from content properties
  if (content.category) {
    if (content.category === "normal") tags.push("normal");
    if (content.category === "epileptiform") tags.push("epileptiform");
  }
  
  if (content.topic) {
    tags.push(content.topic);
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Get label for a tag
 */
export function getTagLabel(tag) {
  return TAG_LABELS[tag] || tag;
}

/**
 * Filter content by tags
 */
export function filterByTags(contentArray, selectedTags) {
  if (!selectedTags || selectedTags.length === 0) return contentArray;
  
  return contentArray.filter((item) => {
    const itemTags = getContentTags(item);
    return selectedTags.some((tag) => itemTags.includes(tag));
  });
}

/**
 * Get related content by tags
 */
export function getRelatedContent(currentItem, allContent, limit = 5) {
  const currentTags = getContentTags(currentItem);
  if (currentTags.length === 0) return [];
  
  const related = allContent
    .filter((item) => item.id !== currentItem.id)
    .map((item) => {
      const itemTags = getContentTags(item);
      const commonTags = currentTags.filter((tag) => itemTags.includes(tag));
      return { item, score: commonTags.length };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
  
  return related;
}



