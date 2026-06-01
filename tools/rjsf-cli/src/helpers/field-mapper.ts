import type { FormField } from '../types/form-plan.js';

/**
 * Map a FormField widget type to the appropriate HTML input element
 * for the prototype HTML.
 */
export function fieldToHtmlElement(field: FormField): string {
  const id = field.key;
  const req = field.required ? ' required' : '';
  const ph = field.placeholder ? ` placeholder="${escapeAttr(field.placeholder)}"` : '';

  switch (field.widget) {
    case 'text':
    case 'autocomplete':
    case 'phone':
    case 'masked':
      return `<input type="text" id="${id}" name="${id}"${ph}${req}>`;

    case 'email':
      return `<input type="email" id="${id}" name="${id}"${ph}${req}>`;

    case 'password':
      return `<input type="password" id="${id}" name="${id}"${ph}${req}>`;

    case 'date':
    case 'datetime':
      return `<input type="date" id="${id}" name="${id}"${req}>`;

    case 'number':
    case 'integer':
    case 'rating': {
      const min = field.validation?.minimum != null ? ` min="${field.validation.minimum}"` : '';
      const max = field.validation?.maximum != null ? ` max="${field.validation.maximum}"` : '';
      return `<input type="number" id="${id}" name="${id}"${min}${max}${ph}${req}>`;
    }

    case 'textarea':
    case 'richtext':
      return `<textarea id="${id}" name="${id}" rows="4"${ph}${req}></textarea>`;

    case 'select': {
      const options = (field.options ?? [])
        .map((o) => `  <option value="${escapeAttr(o.value)}">${escapeHtml(o.label)}</option>`)
        .join('\n');
      return `<select id="${id}" name="${id}"${req}>\n  <option value="">Select...</option>\n${options}\n</select>`;
    }

    case 'multiselect': {
      const options = (field.options ?? [])
        .map((o) => `  <option value="${escapeAttr(o.value)}">${escapeHtml(o.label)}</option>`)
        .join('\n');
      return `<select id="${id}" name="${id}" multiple${req}>\n${options}\n</select>`;
    }

    case 'radio': {
      const inline = shouldInlineRadio(field);
      const style = inline ? ' style="display: flex; gap: 16px; flex-wrap: wrap;"' : '';
      const options = (field.options ?? [])
        .map(
          (o) =>
            `  <label style="display: flex; align-items: center; gap: 6px;">` +
            `<input type="radio" name="${id}" value="${escapeAttr(o.value)}"${req}> ${escapeHtml(o.label)}</label>`
        )
        .join('\n');
      return `<div id="${id}"${style}>\n${options}\n</div>`;
    }

    case 'checkbox':
      return `<label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" id="${id}" name="${id}"${req}> ${escapeHtml(field.label)}</label>`;

    case 'checkboxes': {
      const options = (field.options ?? [])
        .map(
          (o) =>
            `  <label style="display: flex; align-items: center; gap: 6px;">` +
            `<input type="checkbox" name="${id}" value="${escapeAttr(o.value)}"> ${escapeHtml(o.label)}</label>`
        )
        .join('\n');
      return `<div id="${id}">\n${options}\n</div>`;
    }

    case 'file':
    case 'files':
      return `<input type="file" id="${id}" name="${id}"${field.widget === 'files' ? ' multiple' : ''}${req}>`;

    case 'hidden':
      return `<input type="hidden" id="${id}" name="${id}">`;

    case 'color':
      return `<input type="color" id="${id}" name="${id}"${req}>`;

    case 'signature':
      return `<div id="${id}" style="border: 1px dashed #d1d5db; border-radius: 6px; padding: 20px; text-align: center; color: #6b7280; min-height: 100px;">(Signature pad — interactive in final form)</div>`;

    default:
      // Custom widget — render as text input with a note
      return `<input type="text" id="${id}" name="${id}"${ph}${req}>`;
  }
}

/**
 * Determine if radio options should render inline (horizontal).
 * Inline when ≤5 options and all labels ≤30 chars.
 */
export function shouldInlineRadio(field: FormField): boolean {
  if (!field.options) return false;
  return (
    field.options.length <= 5 &&
    field.options.every((o) => o.label.length <= 30)
  );
}

/**
 * Map a FormField to the JSON Schema type + format for schema.ts generation.
 */
export function fieldToSchemaType(field: FormField): { type: string; format?: string } {
  return {
    type: field.schemaType,
    format: field.format,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/&/g, '&amp;');
}
