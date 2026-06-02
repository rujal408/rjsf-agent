import type { FieldOption } from '../types/form-plan.js';

/**
 * Humanize a label string: converts snake_case, kebab-case, camelCase,
 * and ALL_CAPS into "Title Case With Spaces".
 * Already-humanized labels (contain spaces + mixed case) are returned as-is.
 */
export function humanizeLabel(label: string): string {
  // Already humanized — has spaces and mixed case
  if (label.includes(' ') && /[A-Z]/.test(label) && /[a-z]/.test(label)) return label;

  let humanized = label;

  // Replace underscores and hyphens with spaces
  humanized = humanized.replace(/[_-]/g, ' ');

  // Split camelCase: "firstName" → "first Name"
  humanized = humanized.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Capitalize first letter of each word
  humanized = humanized
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return humanized;
}

/**
 * Generate the oneOf array for enum humanization in JSON Schema.
 * Always uses oneOf with const + title. Labels are auto-humanized
 * so "prefer_not_to_say" becomes "Prefer Not To Say".
 */
export function toOneOf(options: FieldOption[]): Array<{ const: string; title: string }> {
  return options.map((o) => ({
    const: o.value,
    title: humanizeLabel(o.label),
  }));
}

/**
 * Generate TypeScript string literal union from field options.
 * Example: "'male' | 'female' | 'other'"
 */
export function toStringLiteralUnion(options: FieldOption[]): string {
  return options.map((o) => `'${o.value}'`).join(' | ');
}
