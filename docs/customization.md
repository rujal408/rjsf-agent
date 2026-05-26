# Custom Widgets, Fields & Templates

When RJSF's built-in input types are not sufficient, the agent generates custom components. This guide explains how to choose the right extension point, how the agent builds each type, and how to add your own.

---

## The Decision Tree

Before building anything custom, ask three questions in order:

**1. Does the requirement involve a single input control?**
If yes, and a standard HTML input type covers it (text, email, date, checkbox, select, radio) — no custom component needed. Control its appearance through `uiSchema`.

If yes, but a standard input type does not cover it (phone with country prefix, star rating, color picker, masked credit card) — build a **Widget**.

**2. Does the requirement involve multiple inputs that share one label and one validation error?**
If yes — build a **Field**. Examples: date range (start + end), address (street + city + state + country), currency (amount + currency selector).

**3. Does the requirement affect how a group of fields is laid out?**
If yes — build a **Template**. Examples: multi-step wizard, tab layout, custom array add/remove/reorder, two-column or three-column grid.

---

## Quick Reference Table

| Requirement | Type | Interface |
|---|---|---|
| Phone number with country code prefix | Widget | `WidgetProps` |
| Star rating (1–5 stars) | Widget | `WidgetProps` |
| Color picker | Widget | `WidgetProps` |
| Masked input (SSN, credit card, phone) | Widget | `WidgetProps` |
| Rich text / WYSIWYG editor | Widget | `WidgetProps` |
| Autocomplete / search-as-you-type | Widget | `WidgetProps` |
| File upload with server POST | Widget | `WidgetProps` |
| Date range (start date + end date) | Field | `FieldProps` |
| Address (street + city + state + country) | Field | `FieldProps` |
| Currency (amount + currency selector) | Field | `FieldProps` |
| Multi-step wizard | Template | `ObjectFieldTemplateProps` |
| Tab layout | Template | `ObjectFieldTemplateProps` |
| Accordion (collapsible sections) | Template | `ObjectFieldTemplateProps` |
| Two-column or three-column grid | Template | `ObjectFieldTemplateProps` |
| Drag-to-reorder array items | Template | `ArrayFieldTemplateProps` |
| Custom array add/remove controls | Template | `ArrayFieldTemplateProps` |

All type imports always come from `@rjsf/utils`, regardless of which theme your project uses.

---

## Walkthrough: PhoneWidget

A widget that renders a country code prefix select alongside a phone number text input. The value is stored as a single string in the format `+1|4155552671` — the schema type remains `string`.

### The component

```tsx
// src/forms/ContactForm/widgets/PhoneWidget.tsx
import React from 'react';
import { WidgetProps } from '@rjsf/utils';

const COUNTRY_CODES = [
  { code: '+1',  label: 'US/CA (+1)'  },
  { code: '+44', label: 'UK (+44)'    },
  { code: '+91', label: 'IN (+91)'    },
  { code: '+61', label: 'AU (+61)'    },
  { code: '+49', label: 'DE (+49)'    },
];

const PhoneWidget: React.FC<WidgetProps> = ({
  id,
  value,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
  onFocus,
  rawErrors,
}) => {
  const [countryCode, localNumber] = value
    ? (value as string).split('|')
    : ['+1', ''];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${e.target.value}|${localNumber}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${countryCode}|${e.target.value}`);
  };

  const hasError = rawErrors && rawErrors.length > 0;

  return (
    <div
      style={{ display: 'flex', gap: 8 }}
      role="group"
      aria-labelledby={`${id}-label`}
    >
      <select
        aria-label="Country code"
        value={countryCode}
        disabled={disabled || readonly}
        onChange={handleCountryChange}
        style={{ width: 110 }}
      >
        {COUNTRY_CODES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        value={localNumber}
        required={required}
        disabled={disabled || readonly}
        placeholder="e.g. 4155552671"
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
        onChange={handleNumberChange}
        onBlur={(e) => onBlur(id, e.target.value)}
        onFocus={(e) => onFocus(id, e.target.value)}
        style={{ flex: 1, borderColor: hasError ? 'red' : undefined }}
      />
    </div>
  );
};

export default PhoneWidget;
```

### Key points

- `value` and `onChange` are the only truly required props for a functioning widget. The rest (`disabled`, `readonly`, `rawErrors`) improve behavior.
- Call `onBlur` with the field `id` and current value — this triggers async field validation if configured.
- Use `aria-invalid` and `aria-describedby` to satisfy axe-core accessibility tests.
- The schema entry for this field remains `{ "type": "string" }`. The widget handles the encoding internally.

### Registering in schema and uiSchema

In `schema.ts`, it is a plain string:
```typescript
phone: { type: 'string', title: 'Phone Number' }
```

In `uiSchema.ts`:
```typescript
phone: { 'ui:widget': 'PhoneWidget', 'ui:help': 'Include your country code' }
```

---

## Walkthrough: DateRangeField

A field that manages two date inputs — a start date and an end date — under a single schema property. The stored value is an object: `{ start: '2026-01-01', end: '2026-03-31' }`.

### The component

```tsx
// src/forms/ProjectForm/fields/DateRangeField.tsx
import React from 'react';
import { FieldProps } from '@rjsf/utils';

interface DateRange {
  start?: string;
  end?: string;
}

const DateRangeField: React.FC<FieldProps<DateRange>> = ({
  idSchema,
  formData,
  onChange,
  rawErrors,
  required,
  disabled,
  readonly,
  schema,
}) => {
  const value: DateRange = formData ?? {};

  const handleChange = (key: 'start' | 'end') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, [key]: e.target.value || undefined });
    };

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ fontWeight: 600, marginBottom: 8 }}>
        {schema.title}
        {required && <span aria-hidden="true" style={{ color: 'red' }}> *</span>}
      </legend>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor={`${idSchema.$id}-start`}>Start Date</label>
          <input
            id={`${idSchema.$id}-start`}
            type="date"
            value={value.start ?? ''}
            disabled={disabled}
            readOnly={readonly}
            onChange={handleChange('start')}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor={`${idSchema.$id}-end`}>End Date</label>
          <input
            id={`${idSchema.$id}-end`}
            type="date"
            value={value.end ?? ''}
            disabled={disabled}
            readOnly={readonly}
            onChange={handleChange('end')}
          />
        </div>
      </div>
      {rawErrors?.map((err, i) => (
        <p key={i} style={{ color: 'red', fontSize: 12 }}>{err}</p>
      ))}
    </fieldset>
  );
};

export default DateRangeField;
```

### Key points

- A Field receives the full `FieldProps` and is responsible for rendering its own label, inputs, and error display.
- Use `idSchema.$id` as the ID prefix to guarantee uniqueness in a form with multiple sections.
- `onChange` receives the entire value of the field — replace the whole object, do not merge deeply.
- Use `<fieldset>` + `<legend>` for semantics and screen reader support.

### Schema entry

```typescript
projectPeriod: {
  type: 'object',
  title: 'Project Period',
  properties: {
    start: { type: 'string', format: 'date', title: 'Start Date' },
    end:   { type: 'string', format: 'date', title: 'End Date'   },
  },
}
```

### uiSchema entry

```typescript
projectPeriod: { 'ui:field': 'DateRangeField' }
```

---

## Walkthrough: WizardTemplate

An `ObjectFieldTemplate` that breaks the form into numbered steps with Back and Next navigation. Each step renders one top-level section from the schema.

### The component

```tsx
// src/forms/ApplicationForm/templates/WizardTemplate.tsx
import React, { useState } from 'react';
import { ObjectFieldTemplateProps } from '@rjsf/utils';

const WizardTemplate: React.FC<ObjectFieldTemplateProps> = ({
  title,
  properties,
  uiSchema,
}) => {
  const steps: string[] = uiSchema?.['ui:options']?.steps as string[] ?? [];
  const [currentStep, setCurrentStep] = useState(0);

  // Each "property" in properties corresponds to a top-level section
  // Filter to properties assigned to the current step
  const stepProperties = properties.filter((prop) =>
    steps[currentStep] === prop.name ||
    // If no steps config, show all on one page
    steps.length === 0
  );

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {steps.map((step, i) => (
          <div
            key={step}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              background: i === currentStep ? '#4f46e5' : '#e5e7eb',
              color: i === currentStep ? '#fff' : '#374151',
              fontWeight: i === currentStep ? 600 : 400,
            }}
          >
            {i + 1}. {step}
          </div>
        ))}
      </div>

      {/* Current step fields */}
      <div>
        {stepProperties.map((prop) => (
          <div key={prop.name}>{prop.content}</div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button
          type="button"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep((s) => s - 1)}
        >
          Back
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => s + 1)}
          >
            Next
          </button>
        ) : (
          <button type="submit">Submit</button>
        )}
      </div>
    </div>
  );
};

export default WizardTemplate;
```

### Key points

- The template receives `properties` — an array of rendered field groups. It decides which ones to render on the current step.
- Step names are passed via `uiSchema['ui:options'].steps`.
- The `type="submit"` button on the last step triggers RJSF's built-in validation before calling `onSubmit`. Back/Next buttons are `type="button"` to prevent accidental submission.

---

## Registering Custom Components

All custom components are registered in `index.tsx` and wired to the `Form` component:

```tsx
// src/forms/ApplicationForm/index.tsx
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { schema } from './schema';
import { uiSchema } from './uiSchema';

// Custom widgets
import PhoneWidget from './widgets/PhoneWidget';

// Custom fields
import DateRangeField from './fields/DateRangeField';

// Custom templates
import WizardTemplate from './templates/WizardTemplate';

const widgets = {
  PhoneWidget,
};

const fields = {
  DateRangeField,
};

const templates = {
  ObjectFieldTemplate: WizardTemplate,
};

export default function ApplicationForm({ onSubmit, formData }: ApplicationFormProps) {
  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      widgets={widgets}
      fields={fields}
      templates={templates}
      formData={formData}
      onSubmit={({ formData: data }) => onSubmit(data)}
    />
  );
}
```

The keys in the `widgets` and `fields` objects must match the strings used in `uiSchema` (`"ui:widget": "PhoneWidget"`, `"ui:field": "DateRangeField"`).

---

## Adding a Custom Component with `/rjsf-iterate`

If you need to add a custom component to an existing generated form, describe the requirement in plain English:

```
/rjsf-iterate "add a star rating widget for the satisfaction field — 1 to 5 stars, required"
```

The agent will:
1. Create `widgets/StarRatingWidget.tsx` with a working implementation
2. Update `uiSchema.ts` to set `"ui:widget": "StarRatingWidget"` on the satisfaction field
3. Update `index.tsx` to import and register `StarRatingWidget` in the `widgets` object
4. Add test cases for the new widget to the test file

You review the diff for all four files before anything is written.
