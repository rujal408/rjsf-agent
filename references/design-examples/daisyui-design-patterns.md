# DaisyUI (Tailwind CSS) Design Patterns for RJSF Forms

Production-quality UI/UX patterns using `@rjsf/core` theme with DaisyUI + Tailwind CSS utility classes.
Use these as reference when generating forms with `stylingApproach: "tailwind"` and DaisyUI as the component library.

---

## 1. Form Card Container

```tsx
function FormCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6 md:p-10">
          <h1 className="card-title text-xl font-bold text-base-content">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-base-content/60 -mt-1">
              {subtitle}
            </p>
          )}
          <div className="divider mt-2 mb-4" />
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## 2. Section Grouping Styles

### Style A: Bordered Card Sections (recommended)

```tsx
import type { ObjectFieldTemplateProps } from '@rjsf/utils';

const SECTION_COLUMNS: Record<string, string> = {
  personalInfo: 'grid-cols-1 sm:grid-cols-2',
  addressInfo: 'grid-cols-1 sm:grid-cols-2',
  preferences: 'grid-cols-1',
};

const FULL_WIDTH_FIELDS = new Set(['bio', 'description', 'address']);

export function SectionTemplate(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const gridCols = SECTION_COLUMNS[sectionKey] ?? 'grid-cols-1';

  return (
    <fieldset className="border border-base-200 rounded-2xl p-4 md:p-5 mb-5 bg-base-200/30 hover:border-base-300 transition-colors">
      {title && (
        <legend className="text-sm font-semibold text-base-content px-2">
          {title}
        </legend>
      )}
      {description && (
        <p className="text-sm text-base-content/60 mb-3">
          {description}
        </p>
      )}
      <div className={`grid ${gridCols} gap-x-6 gap-y-4`}>
        {properties.map((prop) =>
          prop.hidden ? null : (
            <div
              key={prop.name}
              className={FULL_WIDTH_FIELDS.has(prop.name) ? 'col-span-full' : ''}
            >
              {prop.content}
            </div>
          ),
        )}
      </div>
    </fieldset>
  );
}
```

### Style B: Flat Divider Sections

```tsx
export function FlatDividerSection(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const gridCols = SECTION_COLUMNS[sectionKey] ?? 'grid-cols-1';

  return (
    <div className="mb-8">
      {title && (
        <>
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
            {title}
          </h3>
          <div className="divider mt-1 mb-4 before:bg-primary/30 after:bg-primary/30 before:h-[2px] after:h-[2px]" />
        </>
      )}
      {description && (
        <p className="text-sm text-base-content/60 mb-3">{description}</p>
      )}
      <div className={`grid ${gridCols} gap-x-6 gap-y-4`}>
        {properties.map((prop) =>
          prop.hidden ? null : (
            <div
              key={prop.name}
              className={FULL_WIDTH_FIELDS.has(prop.name) ? 'col-span-full' : ''}
            >
              {prop.content}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
```

### Style C: Color-Banded Header Sections

```tsx
export function ColorBandedSection(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const gridCols = SECTION_COLUMNS[sectionKey] ?? 'grid-cols-1';

  return (
    <div className="mb-5 rounded-2xl overflow-hidden border border-base-200">
      {title && (
        <div className="bg-primary px-5 py-3">
          <h3 className="text-sm font-semibold text-primary-content">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-primary-content/70 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="p-4 md:p-5 bg-base-100">
        <div className={`grid ${gridCols} gap-x-6 gap-y-4`}>
          {properties.map((prop) =>
            prop.hidden ? null : (
              <div
                key={prop.name}
                className={FULL_WIDTH_FIELDS.has(prop.name) ? 'col-span-full' : ''}
              >
                {prop.content}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 3. DaisyUI CSS Overrides (`rjsf-overrides.css`)

```css
/* rjsf-overrides.css — DaisyUI/Tailwind theme polish */

.rjsf-form-card {
  max-width: 780px;
  margin: 0 auto;
}

/* Override RJSF default inputs with DaisyUI input classes */
.rjsf input:not([type="checkbox"]):not([type="radio"]),
.rjsf select,
.rjsf textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  font-size: 0.95rem;
  border: 1px solid oklch(var(--bc) / 0.2);
  border-radius: 0.5rem;
  background: oklch(var(--b1));
  transition: all 0.2s;
}

.rjsf input:focus,
.rjsf select:focus,
.rjsf textarea:focus {
  outline: none;
  border-color: oklch(var(--p));
  box-shadow: 0 0 0 3px oklch(var(--p) / 0.1);
}

/* Use DaisyUI input class styling */
.rjsf input:not([type="checkbox"]):not([type="radio"]) {
  @apply input input-bordered w-full;
}

.rjsf select {
  @apply select select-bordered w-full;
}

.rjsf textarea {
  @apply textarea textarea-bordered w-full;
}

/* Labels */
.rjsf label {
  @apply label;
}

.rjsf label span {
  @apply label-text font-medium;
}

/* Required asterisk */
.rjsf .required {
  @apply text-error;
}

/* Help text */
.rjsf .help-block,
.rjsf .field-description {
  @apply text-xs text-base-content/50 mt-1;
}

/* Error text */
.rjsf .text-danger,
.rjsf .error-detail {
  @apply text-xs text-error font-medium mt-1;
}

/* Error field border */
.rjsf .has-error input,
.rjsf .has-error select,
.rjsf .field-error input,
.rjsf .field-error select {
  @apply input-error;
}

/* Checkbox / Radio */
.rjsf input[type="checkbox"] {
  @apply checkbox checkbox-primary;
}

.rjsf input[type="radio"] {
  @apply radio radio-primary;
}

/* Button reset — use DaisyUI btn class instead */
.rjsf button[type="submit"] {
  @apply btn btn-primary;
}
```

---

## 4. Submit Button Patterns

### Style A: Right-Aligned Primary

```tsx
<div className="flex justify-end gap-3 mt-8 pt-5 border-t border-base-200">
  <button
    type="submit"
    className="btn btn-primary btn-lg px-10 no-animation"
    disabled={status === 'loading'}
  >
    {status === 'loading' && <span className="loading loading-spinner loading-sm" />}
    {status === 'loading' ? 'Submitting...' : 'Submit Application'}
  </button>
</div>
```

### Style B: Full-Width

```tsx
<div className="mt-8">
  <button
    type="submit"
    className="btn btn-primary btn-lg btn-block"
    disabled={status === 'loading'}
  >
    {status === 'loading' && <span className="loading loading-spinner loading-sm" />}
    Submit
  </button>
</div>
```

### Style C: Split Save Draft + Submit

```tsx
<div className="flex justify-end gap-3 mt-8 pt-5 border-t border-base-200">
  <button
    type="button"
    className="btn btn-outline btn-lg"
    onClick={handleSaveDraft}
  >
    Save Draft
  </button>
  <button
    type="submit"
    className="btn btn-primary btn-lg px-8"
    disabled={status === 'loading'}
  >
    {status === 'loading' && <span className="loading loading-spinner loading-sm" />}
    Submit
  </button>
</div>
```

---

## 5. Step Indicator (Multi-Step Wizard)

### Using DaisyUI Steps Component

```tsx
interface StepIndicatorProps {
  steps: { key: string; title: string }[];
  currentStep: number;
}

function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <ul className="steps steps-horizontal w-full">
        {steps.map((step, i) => (
          <li
            key={step.key}
            className={`step ${i <= currentStep ? 'step-primary' : ''}`}
            data-content={i < currentStep ? '✓' : String(i + 1)}
          >
            <span className={`text-xs mt-1 ${i === currentStep ? 'font-bold text-primary' : 'text-base-content/60'}`}>
              {step.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Custom Step Indicator (pill/dot style)

```tsx
function PillStepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;

        return (
          <div key={step.key} className="flex items-center gap-2">
            {i > 0 && (
              <div className={`w-8 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-base-300'} transition-colors`} />
            )}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-300 border-2
                  ${isCompleted
                    ? 'bg-primary border-primary text-primary-content'
                    : isActive
                      ? 'bg-base-100 border-primary text-primary shadow-md'
                      : 'bg-base-200 border-base-300 text-base-content/40'
                  }
                `}
              >
                {isCompleted ? '✓' : i + 1}
              </div>
              <span
                className={`text-[10px] mt-1.5 ${isActive ? 'font-bold text-primary' : 'text-base-content/50'}`}
              >
                {step.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

## 6. Step Navigation Buttons

```tsx
<div className="flex justify-between mt-8 pt-5 border-t border-base-200">
  <button
    type="button"
    className={`btn btn-ghost gap-1 ${currentStep === 0 ? 'invisible' : ''}`}
    onClick={() => setCurrentStep((s) => s - 1)}
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    Back
  </button>
  <button
    type="submit"
    className="btn btn-primary gap-1 px-6"
  >
    {isLastStep ? 'Submit' : (
      <>
        Continue
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </>
    )}
  </button>
</div>
```

---

## 7. Success / Error Alerts

```tsx
{/* Success */}
{status === 'success' && (
  <div className="alert alert-success mb-5 rounded-xl">
    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div>
      <h3 className="font-semibold text-sm">Success</h3>
      <p className="text-xs">Your form has been submitted successfully.</p>
    </div>
    <button className="btn btn-ghost btn-xs" onClick={() => setStatus('idle')}>✕</button>
  </div>
)}

{/* Error */}
{status === 'error' && (
  <div className="alert alert-error mb-5 rounded-xl">
    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div>
      <h3 className="font-semibold text-sm">Submission Failed</h3>
      <p className="text-xs">Please check the errors below and try again.</p>
    </div>
    <button className="btn btn-ghost btn-xs" onClick={() => setStatus('idle')}>✕</button>
  </div>
)}
```

---

## 8. Empty Array State

```tsx
function EmptyArrayState({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <div className="flex flex-col items-center py-10 px-6 border-2 border-dashed border-base-300 rounded-2xl bg-base-200/50">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <p className="font-medium text-base-content/70">No {label} added yet</p>
      <p className="text-sm text-base-content/40 text-center max-w-xs mt-1 mb-4">
        Click the button below to add your first item.
      </p>
      <button className="btn btn-outline btn-primary btn-sm gap-1" onClick={onAdd}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add {label}
      </button>
    </div>
  );
}
```

---

## 9. Array Item Card

```tsx
function ArrayItemCard({
  index,
  children,
  onRemove,
  canRemove,
  isDragging,
  dragListeners,
}: {
  index: number;
  children: React.ReactNode;
  onRemove: () => void;
  canRemove: boolean;
  isDragging?: boolean;
  dragListeners?: Record<string, unknown>;
}) {
  return (
    <div
      className={`
        flex items-start gap-2 p-3 mb-2 rounded-xl border transition-all
        ${isDragging
          ? 'bg-primary/5 border-primary/30 shadow-lg'
          : 'bg-base-100 border-base-200 hover:border-base-300'
        }
      `}
    >
      <button
        type="button"
        className="btn btn-ghost btn-xs text-base-content/30 cursor-grab mt-1"
        aria-label="Drag to reorder"
        {...dragListeners}
      >
        ⠿
      </button>
      <div className="badge badge-primary badge-outline badge-sm mt-2 font-bold">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      {canRemove && (
        <button
          type="button"
          className="btn btn-ghost btn-xs text-base-content/30 hover:text-error hover:bg-error/10 mt-1"
          aria-label="Remove item"
          onClick={onRemove}
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

---

## 10. Complete Form Example — Feedback Form (DaisyUI)

```tsx
import { useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import type { IChangeEvent } from '@rjsf/utils';
import { schema } from './schema';
import { uiSchema } from './uiSchema';
import type { FeedbackFormData } from './types';
import { SectionTemplate } from './templates/SectionTemplate';
import './rjsf-overrides.css';

const templates = { ObjectFieldTemplate: SectionTemplate };

interface Props {
  onSubmit: (data: FeedbackFormData) => Promise<void>;
}

export function FeedbackForm({ onSubmit }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (data: IChangeEvent<FeedbackFormData>) => {
    if (!data.formData) return;
    setStatus('loading');
    try {
      await onSubmit(data.formData);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="card bg-base-100 border border-base-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Thank You!</h2>
          <p className="text-base-content/60">Your feedback has been received.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6 md:p-10">
          <h1 className="card-title text-xl font-bold">Share Your Feedback</h1>
          <p className="text-sm text-base-content/60 -mt-1">
            Help us improve by sharing your experience.
          </p>
          <div className="divider mt-2 mb-4" />

          {status === 'error' && (
            <div className="alert alert-error mb-5 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-sm">Failed to send</h3>
                <p className="text-xs">Please try again later.</p>
              </div>
            </div>
          )}

          <Form<FeedbackFormData>
            schema={schema}
            uiSchema={uiSchema}
            validator={validator}
            templates={templates}
            noHtml5Validate
            omitExtraData
            onSubmit={handleSubmit}
            showErrorList={false}
          >
            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-base-200">
              <button
                type="submit"
                className="btn btn-primary btn-lg px-10"
                disabled={status === 'loading'}
              >
                {status === 'loading' && <span className="loading loading-spinner loading-sm" />}
                {status === 'loading' ? 'Sending...' : 'Submit Feedback'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
```

---

## DaisyUI Theme Integration

When using DaisyUI, forms automatically respect the active theme (light, dark, cupcake, etc.).
Use semantic color names instead of hardcoded values:

```tsx
// DaisyUI semantic colors (auto-adapt to theme)
'bg-base-100'       // Primary surface (white in light, dark gray in dark)
'bg-base-200'       // Secondary surface (light gray, darker gray)
'text-base-content'  // Primary text
'text-base-content/60' // Muted text (60% opacity)
'border-base-200'    // Subtle borders
'border-base-300'    // Hover borders
'bg-primary'         // Primary accent
'text-primary'       // Primary text accent
'text-error'         // Error text
'bg-success/10'      // Success background (10% opacity)
```

## Design Token Reference (DaisyUI)

| Token | Class | Usage |
|-------|-------|-------|
| Card border-radius | `rounded-2xl` (16px) | Form container |
| Section border-radius | `rounded-2xl` (16px) | Section fieldsets |
| Input border-radius | `rounded-lg` (8px) | Inputs via DaisyUI `input` class |
| Button border-radius | DaisyUI `btn` default | Submit, nav buttons |
| Card padding | `p-6 md:p-10` | Form container |
| Grid gap | `gap-x-6 gap-y-4` | Between fields |
| Section margin | `mb-5` | Between sections |
| Input min-height | 44px (via DaisyUI `input` class) | WCAG touch target |
| Primary color | Theme-dependent (oklch) | Buttons, focus, accents |
| Error color | `text-error` | Validation, required |
| Surface | `bg-base-100` / `bg-base-200` | Cards, sections |
| Text primary | `text-base-content` | Headings, input text |
| Text muted | `text-base-content/60` | Help, descriptions |
