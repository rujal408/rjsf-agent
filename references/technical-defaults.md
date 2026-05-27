# Technical Defaults Reference

Default values for technical decisions surfaced in Phase 2.5. Phase 4 reads these from `session.json → technicalChoices` and applies them during code generation.

---

## All Technical Decisions

Each decision has a key (stored in `session.json`), a default value, and available options.

### Schema & Validation

| Key | Decision | Default | Options |
|-----|----------|---------|---------|
| `schemaVersion` | JSON Schema version | `"draft-07"` | A) `"draft-07"` — widest RJSF compatibility. B) `"draft-2020-12"` — latest spec, needed for `$dynamicRef`. C) `"draft-2019-09"` — if your backend requires it. |
| `validator` | Validation library | `"ajv8"` | A) `"ajv8"` — recommended, fastest, full Draft-07 support. B) `"yup"` — if team already uses Yup elsewhere. |
| `validationTiming` | When validation runs | `"onSubmit"` | A) `"onSubmit"` — validate on submit only (default RJSF). B) `"onBlur"` — validate each field when it loses focus. C) `"live"` — validate on every keystroke (`liveValidate={true}`). |
| `html5Validation` | Native browser validation | `true` | A) `true` — RJSF + browser both validate (double check). B) `false` — RJSF only (`noHtml5Validate={true}`), consistent error UX. |
| `omitExtraData` | Strip extra properties | `false` | A) `false` — keep extra properties in formData. B) `true` — strip any properties not in schema (`omitExtraData={true}`). |

### Form Behavior

| Key | Decision | Default | Options |
|-----|----------|---------|---------|
| `submissionPattern` | How form submits | `"async-loading"` | A) `"async-loading"` — async/await with loading/success/error states. B) `"sync"` — synchronous submit, no loading state. C) `"optimistic"` — show success immediately, rollback on error. D) `"callback-only"` — just call `onSubmit(data)`, no UI state. |
| `successBehavior` | What happens after success | `"inline-message"` | A) `"inline-message"` — show "Form submitted successfully" inline. B) `"callback"` — call `onSuccess()` prop, let parent decide (redirect, toast, etc.). C) `"reset"` — clear form and show success message. |
| `serverErrorShape` | Expected server error format | `"flat-record"` | A) `"flat-record"` — `Record<string, string>` with dot-notation paths. B) `"nested-object"` — nested `{ field: { subfield: "error" } }`. C) `"custom-transformer"` — generate a transformer function the dev fills in. |
| `draftSaveInterval` | Auto-save interval (if draft_save: true) | `30` | A) `30` — save every 30 seconds. B) `60` — save every 60 seconds. C) `0` — manual save only (Save Draft button). |

### Layout & Styling

| Key | Decision | Default | Options |
|-----|----------|---------|---------|
| `formWrapper` | Form container style | `"centered-card"` | A) `"centered-card"` — max-width centered card with shadow. B) `"full-width"` — no max-width, fills parent container. C) `"no-wrapper"` — no wrapper div, form embeds directly in parent layout. |
| `breakpoints` | Responsive breakpoints | `"standard"` | A) `"standard"` — tablet: 640px, desktop: 1024px. B) `"bootstrap"` — tablet: 576px, desktop: 992px. C) `"custom"` — ask developer for tablet and desktop px values. |
| `touchTargetSize` | Minimum interactive element height | `"44px"` | A) `"44px"` — WCAG AAA, best for mixed mobile/desktop. B) `"36px"` — compact, desktop-only forms. C) `"48px"` — mobile-first, larger touch targets. |
| `gridGap` | Space between form fields | `"default"` | A) `"default"` — 16px row gap, 24px column gap. B) `"compact"` — 8px row, 16px column. C) `"spacious"` — 24px row, 32px column. |
| `colorPalette` | Form color scheme | `"neutral"` | A) `"neutral"` — gray borders (#d1d5db), blue focus (#2563eb), red errors (#dc2626). B) `"match-theme"` — inherit all colors from the RJSF theme's design system. C) `"custom"` — ask developer for border, focus, error, and primary hex values. |

### Code Structure

| Key | Decision | Default | Options |
|-----|----------|---------|---------|
| `typeStyle` | TypeScript interface generation | `"per-section"` | A) `"per-section"` — one interface per section + root FormData. B) `"flat"` — single flat interface with all fields. C) `"zod"` — generate Zod schema, infer types with `z.infer<>`. |
| `conditionalApproach` | How conditional fields are implemented | `"if-then-else"` | A) `"if-then-else"` — JSON Schema if/then/else (recommended). B) `"dependencies"` — JSON Schema dependencies keyword. C) `"allOf"` — allOf with conditional sub-schemas. |
| `formStateManagement` | Where form state lives | `"local-hooks"` | A) `"local-hooks"` — useState/useRef in the form component. B) `"context"` — React Context wrapping the form. C) `"external"` — external store (Zustand/Redux) — generate store file. |
| `formContextUsage` | RJSF formContext prop | `"disabled"` | A) `"disabled"` — don't pass formContext. B) `"enabled"` — pass formContext with custom data for widgets to consume (generate a formContext type + example). |

---

## How Phase 4 Reads These

```typescript
// In rjsf-execute, Step 1:
// Read session.json → technicalChoices object
// For each decision key, use the value from technicalChoices.
// If a key is missing (legacy session), use the default from this reference.

const choices = session.technicalChoices ?? {};
const schemaVersion = choices.schemaVersion ?? 'draft-07';
const validator = choices.validator ?? 'ajv8';
// ... etc.
```

---

## Session Storage Format

```json
{
  "technicalChoices": {
    "schemaVersion": "draft-07",
    "validator": "ajv8",
    "validationTiming": "onSubmit",
    "html5Validation": false,
    "omitExtraData": true,
    "submissionPattern": "async-loading",
    "successBehavior": "callback",
    "serverErrorShape": "flat-record",
    "formWrapper": "full-width",
    "breakpoints": "standard",
    "touchTargetSize": "44px",
    "gridGap": "default",
    "colorPalette": "neutral",
    "typeStyle": "per-section",
    "conditionalApproach": "if-then-else",
    "formStateManagement": "local-hooks",
    "formContextUsage": "disabled"
  }
}
```
