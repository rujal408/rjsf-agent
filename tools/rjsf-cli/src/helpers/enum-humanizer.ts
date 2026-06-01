import type { FieldOption } from '../types/form-plan.js';

/**
 * Check if any option value needs humanization (contains underscores,
 * hyphens, camelCase, or is all-caps abbreviation).
 */
export function needsHumanization(options: FieldOption[]): boolean {
  return options.some(
    (o) =>
      o.value.includes('_') ||
      o.value.includes('-') ||
      /[a-z][A-Z]/.test(o.value) ||
      (o.value.length > 1 && o.value === o.value.toUpperCase() && /[A-Z]/.test(o.value))
  );
}

/**
 * Generate the oneOf array for enum humanization in JSON Schema.
 * Always uses oneOf with const + title for human-readable labels.
 */
export function toOneOf(options: FieldOption[]): Array<{ const: string; title: string }> {
  return options.map((o) => ({
    const: o.value,
    title: o.label,
  }));
}

/**
 * Generate TypeScript string literal union from field options.
 * Example: "'male' | 'female' | 'other'"
 */
export function toStringLiteralUnion(options: FieldOption[]): string {
  return options.map((o) => `'${o.value}'`).join(' | ');
}
