import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import type { FormPlanJSON, FormSection, FormField } from '../types/form-plan.js';
import type { ResolvedChoices } from '../loaders/choices-loader.js';
import { registerHelpers } from '../helpers/handlebars-helpers.js';
import { fieldToHtmlElement } from '../helpers/field-mapper.js';
import { prototypeGridClass, prototypeBreakpointCSS } from '../helpers/column-resolver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates', 'prototype');

async function loadTemplate(name: string): Promise<string> {
  return readFile(join(TEMPLATES_DIR, name), 'utf-8');
}

async function loadPartial(name: string): Promise<string> {
  return readFile(join(TEMPLATES_DIR, 'partials', `${name}.hbs`), 'utf-8');
}

interface RenderedField {
  key: string;
  label: string;
  widget: string;
  width: string;
  required: boolean;
  helpText?: string;
  conditional?: FormField['conditional'];
  htmlElement: string;
}

interface RenderedSection {
  title: string;
  description?: string;
  gridClass: string;
  fields: RenderedField[];
}

interface StepSection {
  title: string;
  sections: RenderedSection[];
}

function renderField(field: FormField): RenderedField {
  return {
    key: field.key,
    label: field.label,
    widget: field.widget,
    width: field.width ?? 'half',
    required: field.required,
    helpText: field.helpText,
    conditional: field.conditional,
    htmlElement: fieldToHtmlElement(field),
  };
}

function renderSection(section: FormSection): RenderedSection {
  return {
    title: section.title,
    description: section.description,
    gridClass: prototypeGridClass(section.columns.desktop),
    fields: section.fields.map(renderField),
  };
}

function generateConditionalJS(plan: FormPlanJSON): string {
  const handlers: string[] = [];

  for (const section of plan.sections) {
    for (const field of section.fields) {
      if (!field.conditional) continue;
      const { triggerField, triggerValue, operator } = field.conditional;
      const fnName = `handle_${triggerField}_for_${field.key}`;

      if (operator === 'in' && field.conditional.triggerValues) {
        const valuesStr = field.conditional.triggerValues
          .map((v) => JSON.stringify(v))
          .join(', ');
        handlers.push(`
    function ${fnName}() {
      var el = document.getElementById('${triggerField}');
      var val = el ? (el.type === 'checkbox' ? el.checked : el.value) : '';
      var target = document.getElementById('field-${field.key}');
      if (target) {
        if ([${valuesStr}].indexOf(val) !== -1) {
          target.classList.remove('hidden');
        } else {
          target.classList.add('hidden');
        }
      }
    }
    var trigger_${fnName} = document.getElementById('${triggerField}');
    if (trigger_${fnName}) trigger_${fnName}.addEventListener('change', ${fnName});
    ${fnName}();`);
      } else {
        const checkExpr =
          operator === 'neq'
            ? `val !== ${JSON.stringify(triggerValue)}`
            : `val === ${JSON.stringify(triggerValue)}`;

        handlers.push(`
    function ${fnName}() {
      var el = document.getElementById('${triggerField}');
      var val = el ? (el.type === 'checkbox' ? el.checked : el.value) : '';
      var target = document.getElementById('field-${field.key}');
      if (target) {
        if (${checkExpr}) {
          target.classList.remove('hidden');
        } else {
          target.classList.add('hidden');
        }
      }
    }
    var trigger_${fnName} = document.getElementById('${triggerField}');
    if (trigger_${fnName}) trigger_${fnName}.addEventListener('change', ${fnName});
    ${fnName}();`);
      }
    }
  }

  return handlers.join('\n');
}

function generateMultiStepJS(stepCount: number): string {
  if (stepCount <= 1) return '';
  return `
    var currentStep = 0;
    var steps = document.querySelectorAll('.step');
    var dots  = document.querySelectorAll('.step-dot');

    function showStep(n) {
      steps.forEach(function(s, i) {
        s.classList.toggle('active', i === n);
      });
      dots.forEach(function(d, i) {
        d.classList.remove('active', 'done');
        if (i === n) d.classList.add('active');
        if (i < n)  d.classList.add('done');
      });
      document.getElementById('btn-back').classList.toggle('hidden', n === 0);
      document.getElementById('btn-next').classList.toggle('hidden', n === steps.length - 1);
      document.getElementById('btn-submit').classList.toggle('hidden', n !== steps.length - 1);
    }

    document.getElementById('btn-next').addEventListener('click', function() {
      var activeStep = document.querySelector('.step.active');
      var hasErrors = false;
      var firstInvalid = null;
      activeStep.querySelectorAll('[required]').forEach(function(input) {
        var empty = !input.value || !input.value.trim();
        if (empty) {
          input.style.borderColor = '#dc2626';
          input.style.outline = '2px solid #fca5a5';
          hasErrors = true;
          if (!firstInvalid) firstInvalid = input;
        } else {
          input.style.borderColor = '';
          input.style.outline = '';
        }
      });
      if (hasErrors) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      if (currentStep < steps.length - 1) { currentStep++; showStep(currentStep); }
    });
    document.getElementById('btn-back').addEventListener('click', function() {
      if (currentStep > 0) { currentStep--; showStep(currentStep); }
    });

    showStep(0);`;
}

function generateSubmitJS(): string {
  return `
    document.getElementById('prototype-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var data = {};
      var fd = new FormData(this);
      fd.forEach(function(val, key) { data[key] = val; });
      var summary = document.getElementById('data-summary');
      summary.querySelector('pre').textContent = JSON.stringify(data, null, 2);
      summary.style.display = 'block';
      summary.scrollIntoView({ behavior: 'smooth' });
    });`;
}

/**
 * Generate the complete prototype.html content.
 */
export async function generatePrototype(
  plan: FormPlanJSON,
  choices: ResolvedChoices
): Promise<string> {
  const hbs = Handlebars.create();
  registerHelpers(hbs);

  // Load and register partials
  const partialNames = [
    'css-base', 'limitations', 'field', 'section',
    'step-indicator', 'step-nav',
  ];
  for (const name of partialNames) {
    hbs.registerPartial(name, await loadPartial(name));
  }

  // Load base template
  const baseTemplate = hbs.compile(await loadTemplate('base.hbs'));

  // Render CSS
  const cssTemplate = hbs.compile(await loadPartial('css-base'));
  const cssBlock = cssTemplate({
    colorPalette: choices.colorPalette,
    touchTargetSize: choices.touchTargetSize,
    gridCSS: prototypeBreakpointCSS(choices),
  });

  // Render sections
  const renderedSections = plan.sections.map(renderSection);

  // Build step sections if multi-step
  let stepSections: StepSection[] = [];
  if (plan.multiStep && plan.steps) {
    const sectionMap = new Map(plan.sections.map((s) => [s.key, s]));
    stepSections = plan.steps.map((step) => ({
      title: step.title,
      sections: step.sectionKeys
        .map((key) => sectionMap.get(key))
        .filter((s): s is FormSection => s != null)
        .map(renderSection),
    }));
  }

  // Generate JS
  const conditionalJS = generateConditionalJS(plan);
  const multiStepJS = plan.multiStep ? generateMultiStepJS(plan.steps?.length ?? 0) : '';
  const submitJS = generateSubmitJS();
  const jsBlock = [conditionalJS, multiStepJS, submitJS].filter(Boolean).join('\n');

  // Render full HTML
  return baseTemplate({
    formTitle: plan.formTitle,
    formSubtitle: plan.formSubtitle,
    multiStep: plan.multiStep,
    steps: plan.steps,
    stepSections,
    renderedSections,
    cssBlock,
    jsBlock,
  });
}
