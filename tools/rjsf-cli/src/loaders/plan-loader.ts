import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FormPlanJSON } from '../types/form-plan.js';

const REQUIRED_TOP_LEVEL: (keyof FormPlanJSON)[] = [
  'formName',
  'formTitle',
  'stylingApproach',
  'rjsfTheme',
  'sections',
  'customization',
  'edgeCaseFlags',
];

/**
 * Load and validate form-plan.json from a session directory.
 */
export async function loadFormPlan(sessionDir: string): Promise<FormPlanJSON> {
  const planPath = join(sessionDir, 'form-plan.json');
  let raw: string;

  try {
    raw = await readFile(planPath, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `form-plan.json not found at ${planPath}. ` +
        'Did Phase 2 complete? Run /rjsf-plan first. ' +
        'Ensure the plan skill outputs form-plan.json alongside form-plan.md.'
      );
    }
    throw err;
  }

  let plan: FormPlanJSON;
  try {
    plan = JSON.parse(raw) as FormPlanJSON;
  } catch {
    throw new Error(`form-plan.json at ${planPath} contains invalid JSON.`);
  }

  // Validate required top-level keys
  const missing = REQUIRED_TOP_LEVEL.filter(
    (key) => plan[key] === undefined || plan[key] === null
  );
  if (missing.length > 0) {
    throw new Error(
      `form-plan.json is missing required fields: ${missing.join(', ')}. ` +
      'Regenerate the form plan with /rjsf-plan.'
    );
  }

  // Validate sections have fields
  if (!Array.isArray(plan.sections) || plan.sections.length === 0) {
    throw new Error('form-plan.json must have at least one section with fields.');
  }

  for (const section of plan.sections) {
    if (!section.key || !section.title) {
      throw new Error(`Section missing key or title: ${JSON.stringify(section)}`);
    }
    if (!Array.isArray(section.fields) || section.fields.length === 0) {
      throw new Error(`Section "${section.title}" has no fields.`);
    }
    if (!section.columns || typeof section.columns.desktop !== 'number') {
      throw new Error(`Section "${section.title}" missing responsive columns spec.`);
    }
    for (const field of section.fields) {
      if (!field.key || !field.label || !field.schemaType || !field.widget) {
        throw new Error(
          `Field in section "${section.title}" missing required properties (key, label, schemaType, widget): ${JSON.stringify(field)}`
        );
      }
    }
  }

  // Validate multi-step has steps defined
  if (plan.multiStep && (!plan.steps || plan.steps.length === 0)) {
    throw new Error('multiStep is true but no steps are defined. Add a steps array to form-plan.json.');
  }

  return plan;
}
