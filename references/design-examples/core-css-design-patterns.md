# Core CSS Design Patterns for RJSF Forms

Production-quality UI/UX patterns using `@rjsf/core` theme with plain CSS (no UI framework).
Use these as reference when generating forms with `rjsfTheme: "@rjsf/core"` and `stylingApproach: "css-modules"`, `"scss"`, or `"plain-css"`.

---

## 1. Form Card Container

### CSS Module

```css
/* FormCard.module.css */
.formCard {
  max-width: 780px;
  margin: 0 auto;
  padding: 32px 40px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
}

@media (max-width: 640px) {
  .formCard {
    padding: 20px 16px;
    border-radius: 12px;
    margin: 0 12px;
  }
}

.formTitle {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.formSubtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 20px 0;
}

.formDivider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0 0 24px 0;
}
```

### Component

```tsx
import styles from './FormCard.module.css';

function FormCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.formCard}>
      <h1 className={styles.formTitle}>{title}</h1>
      {subtitle && <p className={styles.formSubtitle}>{subtitle}</p>}
      <hr className={styles.formDivider} />
      {children}
    </div>
  );
}
```

---

## 2. Section Grouping Styles

### Style A: Bordered Card Sections (recommended)

```css
/* SectionTemplate.module.css */
.section {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  background: #f9fafb;
  transition: border-color 0.2s;
}

.section:hover {
  border-color: #d1d5db;
}

.sectionTitle {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  padding: 0 4px;
}

.sectionDescription {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.grid {
  display: grid;
  gap: 16px 24px;
}

.grid1 { grid-template-columns: 1fr; }
.grid2 { grid-template-columns: 1fr; }
.grid3 { grid-template-columns: 1fr; }

@media (min-width: 640px) {
  .grid2 { grid-template-columns: repeat(2, 1fr); }
  .grid3 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid3 { grid-template-columns: repeat(3, 1fr); }
}

.colFull {
  grid-column: 1 / -1;
}
```

```tsx
import styles from './SectionTemplate.module.css';
import type { ObjectFieldTemplateProps } from '@rjsf/utils';

const SECTION_COLUMNS: Record<string, string> = {
  personalInfo: 'grid2',
  addressInfo: 'grid2',
  preferences: 'grid1',
};

const FULL_WIDTH_FIELDS = new Set(['bio', 'description', 'address']);

export function SectionTemplate(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const gridClass = SECTION_COLUMNS[sectionKey] ?? 'grid1';

  return (
    <fieldset className={styles.section}>
      {title && <legend className={styles.sectionTitle}>{title}</legend>}
      {description && <p className={styles.sectionDescription}>{description}</p>}
      <div className={`${styles.grid} ${styles[gridClass]}`}>
        {properties.map((prop) =>
          prop.hidden ? null : (
            <div
              key={prop.name}
              className={FULL_WIDTH_FIELDS.has(prop.name) ? styles.colFull : undefined}
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

```css
/* FlatDividerSection.module.css */
.section {
  margin-bottom: 32px;
}

.sectionTitle {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4f46e5;
  margin: 0;
}

.divider {
  border: none;
  border-top: 2px solid #c7d2fe;
  margin: 8px 0 20px 0;
}
```

### Style C: Color-Banded Header Sections

```css
/* ColorBandedSection.module.css */
.section {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.header {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  padding: 14px 24px;
}

.headerTitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.headerDescription {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 4px 0 0 0;
}

.body {
  padding: 20px 24px;
  background: #fff;
}
```

---

## 3. Base Form CSS Overrides (`rjsf-overrides.css`)

This is the most important file for `@rjsf/core` — without it, forms look unstyled and amateurish.

```css
/* rjsf-overrides.css — Core theme comprehensive polish */

/* ═══════════════════════════════════════════════════════
   1. FORM CONTAINER
   ═══════════════════════════════════════════════════════ */

.rjsf-form-card {
  max-width: 780px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 32px 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

@media (max-width: 640px) {
  .rjsf-form-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
}

/* ═══════════════════════════════════════════════════════
   2. LABELS & TYPOGRAPHY
   ═══════════════════════════════════════════════════════ */

.rjsf label,
.rjsf .control-label {
  display: block;
  text-align: left;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 6px;
  line-height: 1.4;
}

.rjsf .required {
  color: #dc2626;
  font-weight: 600;
}

/* Section titles */
.rjsf fieldset > legend {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  padding: 0 8px;
  margin-bottom: 8px;
}

/* ═══════════════════════════════════════════════════════
   3. INPUTS — Base Styling
   ═══════════════════════════════════════════════════════ */

.rjsf input:not([type="checkbox"]):not([type="radio"]),
.rjsf select,
.rjsf textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  font-size: 0.95rem;
  color: #1f2937;
  background: #fafbfc;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-sizing: border-box;
  transition: all 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
}

.rjsf textarea {
  min-height: 88px;
  resize: vertical;
}

.rjsf select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

/* ═══════════════════════════════════════════════════════
   4. INPUT STATES
   ═══════════════════════════════════════════════════════ */

/* Hover */
.rjsf input:not([type="checkbox"]):not([type="radio"]):hover,
.rjsf select:hover,
.rjsf textarea:hover {
  border-color: #9ca3af;
  background: #f5f6f8;
}

/* Focus */
.rjsf input:not([type="checkbox"]):not([type="radio"]):focus,
.rjsf select:focus,
.rjsf textarea:focus {
  outline: none;
  border-color: #4f46e5;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

/* Disabled */
.rjsf input:disabled,
.rjsf select:disabled,
.rjsf textarea:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

/* Read-only */
.rjsf input:read-only,
.rjsf textarea:read-only {
  background: #f9fafb;
  border-color: #e5e7eb;
}

/* Error state */
.rjsf .has-error input,
.rjsf .has-error select,
.rjsf .has-error textarea,
.rjsf .field-error input,
.rjsf .field-error select,
.rjsf .field-error textarea {
  border-color: #dc2626;
  background: #fef2f2;
}

.rjsf .has-error input:focus,
.rjsf .field-error input:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

/* Placeholder */
.rjsf input::placeholder,
.rjsf textarea::placeholder {
  color: #9ca3af;
  font-size: 0.9rem;
}

/* ═══════════════════════════════════════════════════════
   5. CHECKBOX & RADIO
   ═══════════════════════════════════════════════════════ */

.rjsf input[type="checkbox"],
.rjsf input[type="radio"] {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  accent-color: #4f46e5;
  cursor: pointer;
  vertical-align: middle;
}

.rjsf .field-radio-group label,
.rjsf .field-boolean label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-weight: 400;
  margin-right: 16px;
  padding: 4px 0;
}

/* Inline radio group */
.rjsf .field-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
}

/* ═══════════════════════════════════════════════════════
   6. HELP TEXT & ERROR MESSAGES
   ═══════════════════════════════════════════════════════ */

.rjsf .help-block,
.rjsf .field-description {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.4;
}

.rjsf .error-detail,
.rjsf .text-danger {
  font-size: 0.8rem;
  color: #dc2626;
  font-weight: 500;
  margin-top: 4px;
  line-height: 1.4;
}

.rjsf .error-detail li {
  list-style: none;
  padding: 0;
  margin: 2px 0;
}

/* Hide default error list at top */
.rjsf > .panel.panel-danger,
.rjsf .errors-header,
.rjsf .error-list {
  display: none;
}

/* ═══════════════════════════════════════════════════════
   7. FIELDSET / SECTION STYLING
   ═══════════════════════════════════════════════════════ */

.rjsf fieldset {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  background: #f9fafb;
}

.rjsf fieldset:hover {
  border-color: #d1d5db;
}

.rjsf fieldset > legend {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  padding: 0 8px;
}

/* ═══════════════════════════════════════════════════════
   8. BUTTONS
   ═══════════════════════════════════════════════════════ */

.rjsf .btn,
.rjsf button[type="submit"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 32px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: #4f46e5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rjsf button[type="submit"]:hover {
  background: #4338ca;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transform: translateY(-1px);
}

.rjsf button[type="submit"]:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

.rjsf button[type="submit"]:disabled {
  background: #c7d2fe;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Secondary / outline button */
.rjsf .btn-secondary {
  background: transparent;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.rjsf .btn-secondary:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  box-shadow: none;
  transform: none;
}

/* Add array item button */
.rjsf .btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4f46e5;
  background: transparent;
  border: 1px dashed #c7d2fe;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
}

.rjsf .btn-add:hover {
  background: #eef2ff;
  border-color: #818cf8;
  color: #4338ca;
}

/* Remove array item button */
.rjsf .btn-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 1rem;
  color: #9ca3af;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.rjsf .btn-remove:hover {
  color: #dc2626;
  background: #fef2f2;
}

/* ═══════════════════════════════════════════════════════
   9. FORM ACTIONS (Button bar)
   ═══════════════════════════════════════════════════════ */

.rjsf .form-actions,
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

/* ═══════════════════════════════════════════════════════
   10. ARRAY ITEMS
   ═══════════════════════════════════════════════════════ */

.rjsf .array-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.15s;
}

.rjsf .array-item:hover {
  border-color: #d1d5db;
}

.rjsf .array-item-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 4px;
}

/* ═══════════════════════════════════════════════════════
   11. SHORT FIELD WIDTH CONSTRAINTS
   ═══════════════════════════════════════════════════════ */

.rjsf input[type="date"],
.rjsf input[type="time"],
.rjsf input[type="number"] {
  max-width: 280px;
}
```

---

## 4. Submit Button Patterns

### Style A: Right-Aligned Primary

```tsx
import styles from './FormActions.module.css';

<div className={styles.actions}>
  <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
    {status === 'loading' && <span className={styles.spinner} />}
    {status === 'loading' ? 'Submitting...' : 'Submit Application'}
  </button>
</div>
```

```css
/* FormActions.module.css */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.submitBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 12px 40px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.submitBtn:hover:not(:disabled) {
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.35);
  transform: translateY(-1px);
}

.submitBtn:active {
  transform: translateY(0);
}

.submitBtn:disabled {
  background: #c7d2fe;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Style B: Full-Width Primary

```css
.submitBtnFull {
  width: 100%;
  min-height: 48px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: #4f46e5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 32px;
  transition: all 0.2s;
}
```

### Style C: Split Save Draft + Submit

```css
.draftBtn {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #4b5563;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.draftBtn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}
```

---

## 5. Step Indicator (Multi-Step Wizard)

```css
/* StepIndicator.module.css */
.stepBar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 32px;
}

.stepItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.connector {
  width: 48px;
  height: 2px;
  background: #e5e7eb;
  transition: background 0.3s;
}

.connectorDone {
  background: #4f46e5;
}

.dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  color: #9ca3af;
  transition: all 0.3s;
}

.dotActive {
  border-color: #4f46e5;
  background: #fff;
  color: #4f46e5;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
}

.dotCompleted {
  border-color: #4f46e5;
  background: #4f46e5;
  color: #fff;
}

.stepLabel {
  font-size: 0.7rem;
  margin-top: 8px;
  font-weight: 500;
  color: #6b7280;
}

.stepLabelActive {
  font-weight: 700;
  color: #4f46e5;
}
```

```tsx
import styles from './StepIndicator.module.css';

function StepIndicator({ steps, currentStep }: {
  steps: { key: string; title: string }[];
  currentStep: number;
}) {
  return (
    <div className={styles.stepBar}>
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div className={`${styles.connector} ${isDone ? styles.connectorDone : ''}`} />
            )}
            <div className={styles.stepItem}>
              <div className={`${styles.dot} ${isActive ? styles.dotActive : ''} ${isDone ? styles.dotCompleted : ''}`}>
                {isDone ? '\u2713' : i + 1}
              </div>
              <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
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

## 6. Success / Error Alerts

```css
/* Alert.module.css */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.alertSuccess {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.alertError {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alertIcon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.alertTitle {
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0 0 2px 0;
}

.alertMessage {
  font-size: 0.825rem;
  margin: 0;
  opacity: 0.85;
}

.alertClose {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.5;
  font-size: 1rem;
  padding: 2px;
}

.alertClose:hover {
  opacity: 1;
}
```

```tsx
import styles from './Alert.module.css';

{/* Success */}
{status === 'success' && (
  <div className={`${styles.alert} ${styles.alertSuccess}`}>
    <span className={styles.alertIcon}>&#10003;</span>
    <div>
      <p className={styles.alertTitle}>Success</p>
      <p className={styles.alertMessage}>Your form has been submitted.</p>
    </div>
    <button className={styles.alertClose} onClick={() => setStatus('idle')}>&times;</button>
  </div>
)}

{/* Error */}
{status === 'error' && (
  <div className={`${styles.alert} ${styles.alertError}`}>
    <span className={styles.alertIcon}>&#10007;</span>
    <div>
      <p className={styles.alertTitle}>Submission Failed</p>
      <p className={styles.alertMessage}>Please fix the errors below and try again.</p>
    </div>
    <button className={styles.alertClose} onClick={() => setStatus('idle')}>&times;</button>
  </div>
)}
```

---

## 7. Empty Array State

```css
/* EmptyState.module.css */
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
}

.emptyIcon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.emptyIcon svg {
  width: 24px;
  height: 24px;
  color: #818cf8;
}

.emptyTitle {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.95rem;
  margin: 0 0 4px 0;
}

.emptyDescription {
  font-size: 0.85rem;
  color: #9ca3af;
  text-align: center;
  max-width: 300px;
  margin: 0 0 16px 0;
}

.addBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4f46e5;
  background: transparent;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.addBtn:hover {
  background: #eef2ff;
  border-color: #818cf8;
}
```

---

## 8. Array Item Card

```css
/* ArrayItem.module.css */
.item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s;
}

.item:hover {
  border-color: #d1d5db;
}

.itemDragging {
  background: #eef2ff;
  border-color: #c7d2fe;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.dragHandle {
  cursor: grab;
  background: none;
  border: none;
  padding: 4px 6px;
  color: #9ca3af;
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
  transition: color 0.15s;
}

.dragHandle:hover {
  color: #6b7280;
}

.itemBadge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 4px;
}

.itemContent {
  flex: 1;
  min-width: 0;
}

.removeBtn {
  background: none;
  border: none;
  padding: 4px 8px;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.15s;
}

.removeBtn:hover {
  color: #dc2626;
  background: #fef2f2;
}
```

---

## 9. Success Page

```css
/* SuccessPage.module.css */
.successPage {
  max-width: 780px;
  margin: 0 auto;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.successIcon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
  font-size: 28px;
  color: #16a34a;
}

.successTitle {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.successMessage {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}
```

---

## 10. Complete Form Example — Application Form (Core CSS)

```tsx
import { useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import type { IChangeEvent, ErrorSchema } from '@rjsf/utils';
import { schema } from './schema';
import { uiSchema } from './uiSchema';
import type { ApplicationFormData } from './types';
import { SectionTemplate } from './templates/SectionTemplate';
import './rjsf-overrides.css';
import styles from './ApplicationForm.module.css';

const templates = { ObjectFieldTemplate: SectionTemplate };

interface Props {
  formData?: Partial<ApplicationFormData>;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onError?: (errors: unknown) => void;
}

export function ApplicationForm({ formData, onSubmit, onError }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverErrors, setServerErrors] = useState<ErrorSchema<ApplicationFormData>>(
    {} as ErrorSchema<ApplicationFormData>,
  );

  const handleSubmit = async (data: IChangeEvent<ApplicationFormData>) => {
    if (!data.formData) return;
    setStatus('loading');
    setServerErrors({} as ErrorSchema<ApplicationFormData>);
    try {
      await onSubmit(data.formData);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      if (err && typeof err === 'object' && 'fieldErrors' in err) {
        const fe = (err as { fieldErrors: Record<string, string> }).fieldErrors;
        const es: Record<string, { __errors: string[] }> = {};
        for (const [field, msg] of Object.entries(fe)) {
          es[field] = { __errors: [msg] };
        }
        setServerErrors(es as ErrorSchema<ApplicationFormData>);
      }
      onError?.(err);
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.successPage}>
        <div className={styles.successIcon}>&#10003;</div>
        <h2 className={styles.successTitle}>Application Submitted</h2>
        <p className={styles.successMessage}>
          We'll review your application and get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="rjsf-form-card">
      <h1 className={styles.formTitle}>Job Application</h1>
      <p className={styles.formSubtitle}>
        Complete all required fields to submit your application.
      </p>
      <hr className={styles.divider} />

      {status === 'error' && (
        <div className={styles.alertError}>
          <span>&#10007;</span>
          <div>
            <p className={styles.alertTitle}>Submission Failed</p>
            <p className={styles.alertMessage}>Please fix the errors below.</p>
          </div>
        </div>
      )}

      <Form<ApplicationFormData>
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        formData={formData}
        templates={templates}
        extraErrors={serverErrors}
        noHtml5Validate
        omitExtraData
        onSubmit={handleSubmit}
        showErrorList={false}
      >
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={status === 'loading'}
          >
            {status === 'loading' && <span className={styles.spinner} />}
            {status === 'loading'
              ? 'Submitting...'
              : formData ? 'Update Application' : 'Submit Application'}
          </button>
        </div>
      </Form>
    </div>
  );
}
```

---

## Design Token Reference (Core CSS)

| Token | Value | Usage |
|-------|-------|-------|
| Card border-radius | `16px` | Form container |
| Section border-radius | `12px` | Section fieldsets |
| Input border-radius | `8px` | All inputs, selects |
| Button border-radius | `8px` | Submit, action buttons |
| Card padding | `32px 40px` desktop, `20px 16px` mobile | Form container |
| Grid gap | `16px 24px` | Between fields |
| Section margin-bottom | `24px` | Between sections |
| Input min-height | `44px` | WCAG touch target |
| Input background | `#fafbfc` idle, `#f5f6f8` hover, `#fff` focus | Fields |
| Primary color | `#4f46e5` (Indigo-600) | Buttons, focus, links |
| Primary hover | `#4338ca` (Indigo-700) | Button hover |
| Primary light | `#eef2ff` (Indigo-50) | Badges, highlights |
| Error color | `#dc2626` (Red-600) | Errors, required |
| Error background | `#fef2f2` (Red-50) | Error field bg |
| Success color | `#16a34a` (Green-600) | Success alerts |
| Success background | `#f0fdf4` (Green-50) | Success alert bg |
| Text heading | `#111827` (Gray-900) | Headings |
| Text label | `#374151` (Gray-700) | Field labels |
| Text body | `#4b5563` (Gray-600) | Body text |
| Text muted | `#6b7280` (Gray-500) | Help, descriptions |
| Text placeholder | `#9ca3af` (Gray-400) | Placeholders |
| Border default | `#d1d5db` (Gray-300) | Input borders |
| Border light | `#e5e7eb` (Gray-200) | Section, card borders |
| Surface bg | `#f9fafb` (Gray-50) | Section bg |
| Focus ring | `0 0 0 3px rgba(79, 70, 229, 0.12)` | Input focus |
