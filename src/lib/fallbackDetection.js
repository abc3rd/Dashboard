// Replicates the UCP router's selection-rule evaluation so the monitoring UI can
// flag queries where NO rule matched and the router fell back to the default
// model. Returns true only when no rule matched (i.e. fallback was used).
export function getFallbackModel(packet) {
  return packet?.selection_policy?.fallback_model || null;
}

export function isFallbackQuery(packet, prompt) {
  const rules = packet?.selection_policy?.rules;
  if (!Array.isArray(rules)) return false;
  const text = prompt || '';
  const length = text.length;
  const lower = text.toLowerCase();
  for (const rule of rules) {
    const c = rule.condition || {};
    let match = true;
    if (c.prompt_length_lt !== undefined && !(length < c.prompt_length_lt)) match = false;
    if (c.prompt_length_gte !== undefined && !(length >= c.prompt_length_gte)) match = false;
    if (Array.isArray(c.contains_keywords) && c.contains_keywords.length > 0) {
      if (!c.contains_keywords.some((kw) => lower.includes(String(kw).toLowerCase()))) match = false;
    }
    if (match) return false; // a rule matched → not a fallback
  }
  return true; // no rule matched → fell back to the default model
}