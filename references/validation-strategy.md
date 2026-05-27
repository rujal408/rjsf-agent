# Validation Strategy Reference

RJSF provides built-in JSON Schema validation. For single-page forms, this is sufficient. For multi-step wizards, custom per-step validation is required because RJSF validates the entire mounted schema — not individual steps.

---

## Strategy 1 — Single-Page Forms (Schema-Driven)

**Use when:** `multi_step: false` in RequirementsBrief.

**Principle:** Let RJSF + JSON Schema handle ALL validation. Write zero custom validation code unless `cross_field_validation: true` or `async_field_validation: true`.

### What JSON Schema Handles Natively

| Validation Rule | JSON Schema Keyword | Example |
|----------------|---------------------|---------|
| Required field | `"required": ["email"]` | Field must be non-empty |
| Min/max string length | `"minLength": 2, "maxLength": 100` | Name between 2–100 chars |
| String pattern | `"pattern": "^[A-Z]{2}\\d{6}$"` | ID format like AB123456 |
| Email format | `"format": "email"` | Valid email address |
| Date format | `"format": "date"` | Valid ISO date |
| Number range | `"minimum": 0, "maximum": 100` | Age between 0–100 |
| Integer only | `"type": "integer"` | Whole number |
| Enum values | `"enum": ["a", "b", "c"]` | Must be one of the listed values |
| Array min/max items | `"minItems": 1, "maxItems": 5` | Array length bounds |
| Unique array items | `"uniqueItems": true` | No duplicates |

### When Custom Validation IS Needed (Single-Page)

Only add `customValidate` when:
- `cross_field_validation: true` — e.g., "end date must be after start date", "confirm password must match password"
- `async_field_validation: true` — e.g., "check username availability on blur" (uses `extraErrors`, not `customValidate`)
- Business rules that JSON Schema cannot express — e.g., "if country is US, zip must be 5 digits; if country is UK, postcode must match UK format"

### Generated Code Pattern (Single-Page)

```tsx
<Form
  schema={schema}           // JSON Schema handles required, format, pattern, min/max
  uiSchema={uiSchema}
  validator={validator}      // ajv8 runs JSON Schema validation automatically
  showErrorList={false}      // inline errors only (or per error_display flag)
  onSubmit={handleSubmit}
  // customValidate is ONLY added when cross_field_validation: true
  // extraErrors is ONLY added when server_error_mapping: true
/>
```

**Do NOT generate** `customValidate` for rules that JSON Schema already handles. Duplicating validation in both JSON Schema and `customValidate` causes double error messages.

---

## Strategy 2 — Multi-Step Wizard Forms (Custom Per-Step)

**Use when:** `multi_step: true` in RequirementsBrief.

**Principle:** RJSF's built-in validation validates the entire mounted schema at once. In a wizard, only one step is visible — so we must split validation into per-step sub-schemas and validate programmatically on "Next".

### Why Custom Validation is Required for Wizards

```
Problem:
  RJSF <Form> validates against whatever schema prop is passed.
  Full schema has fields from ALL steps marked as required.
  On Step 1, fields from Steps 2–5 are not visible.
  If we pass the full schema → RJSF shows errors for invisible fields.
  If we pass only Step 1's sub-schema → RJSF only validates Step 1 fields. ✓

Solution:
  Split the full schema into per-step sub-schemas.
  Mount only the current step's sub-schema at any time.
  On "Next" click → call formRef.current.validateForm() against the current sub-schema.
  On "Submit" click (last step) → let RJSF's onSubmit pipeline validate the last step.
```

### Per-Step Sub-Schema Generation Rules

For each step in the Step Map:

1. **Extract only that step's fields** from the root schema's `properties`.
2. **Extract only that step's required fields** from the root schema's `required` array.
3. **Include conditional logic** (`if/then/else`) only if BOTH the trigger field AND the conditional field belong to the same step. If they span steps, handle it differently (see Cross-Step Conditions below).
4. **Include nested objects** in full — if a step contains a section key (nested object), include the entire section sub-schema.

```typescript
// Example: 3-step wizard
const stepSchemas: RJSFSchema[] = [
  {
    type: 'object',
    title: 'Personal Info',
    required: ['firstName', 'lastName', 'email'],  // only Step 1 required fields
    properties: {
      firstName: schema.properties.firstName,
      lastName: schema.properties.lastName,
      email: schema.properties.email,
    },
  },
  {
    type: 'object',
    title: 'Employment',
    required: ['employmentType'],
    properties: {
      employmentType: schema.properties.employmentType,
      companyName: schema.properties.companyName,  // conditional on employmentType
    },
    // if/then/else stays here because both fields are in Step 2
    if: { properties: { employmentType: { const: 'employed' } } },
    then: { required: ['companyName'] },
  },
  {
    type: 'object',
    title: 'Review & Submit',
    required: ['agreeToTerms'],
    properties: {
      agreeToTerms: schema.properties.agreeToTerms,
    },
  },
];
```

### Validation Flow for Wizard

```
Step 1 visible:
  User fills fields → onChange merges into allData state
  User clicks "Next →" (type="button")
    → handleNext() calls formRef.current.validateForm()
    → validateForm() checks stepSchemas[0] (only Step 1 fields)
    → If invalid: RJSF shows inline errors on Step 1 fields, user stays on Step 1
    → If valid: setCurrentStep(1), Step 2 renders

Step 2 visible:
  Same flow — validates only stepSchemas[1]

Last step visible:
  User clicks "Submit" (type="submit")
    → RJSF's built-in onSubmit fires, validates stepSchemas[lastStep]
    → If valid: handleSubmit() runs with accumulated allData

Cross-field validation (if needed):
  customValidate runs ONLY against the current step's sub-schema.
  For cross-STEP validation, add a final validation pass in handleSubmit()
  that checks the complete allData against cross-step rules.
```

### Cross-Step Validation

When `cross_field_validation: true` AND the related fields span different steps:

```typescript
// In handleSubmit (last step), AFTER RJSF validates the last step:
const handleSubmit = async ({ formData: stepData }: { formData: any }) => {
  const finalData = { ...allData, ...stepData };

  // Cross-step validation — fields on different steps
  const crossStepErrors: string[] = [];
  if (finalData.endDate && finalData.startDate && finalData.endDate <= finalData.startDate) {
    crossStepErrors.push('End date (Step 3) must be after start date (Step 1)');
  }

  if (crossStepErrors.length > 0) {
    // Show as a form-level error on the final step
    setFormLevelErrors(crossStepErrors);
    return; // do not submit
  }

  // Proceed with submission...
};
```

### Accumulated Data Integrity

```
Critical rule:
  allData = { ...allData, ...currentStepData } on every onChange.
  When user goes Back to Step 1 and changes a field,
  allData is updated immediately.
  When user goes Forward again, Step 2 sees the updated allData.

  DO NOT reset allData on step change.
  DO NOT re-initialize allData from props on step change.
  allData is a single source of truth across all steps.
```

### Error State on Step Navigation

```
When user clicks "Back":
  - Clear RJSF's internal error state for the current step
    (unmounting the step's Form instance handles this automatically
     since a new Form mounts for the previous step)
  - Do NOT clear allData — preserve all entered values

When user clicks "Next" and validation fails:
  - RJSF shows inline errors on the current step
  - User stays on the current step
  - allData is NOT modified (onChange already captured partial input)

When user navigates back to a completed step:
  - Fields should be pre-populated from allData
  - No validation errors shown until user clicks "Next" again
```

---

## Strategy Comparison

| Aspect | Single-Page | Multi-Step Wizard |
|--------|-------------|-------------------|
| **Schema** | One full schema passed to `<Form>` | Per-step sub-schemas, one mounted at a time |
| **Required fields** | JSON Schema `required` array | Split into per-step `required` arrays |
| **Validation trigger** | On submit (RJSF default) | On "Next" click (programmatic) + on submit (last step) |
| **Validation method** | RJSF built-in (automatic) | `formRef.current.validateForm()` (explicit) |
| **Cross-field rules** | `customValidate` prop | `customValidate` for same-step + `handleSubmit` for cross-step |
| **Error display** | Inline below fields (or per `error_display` flag) | Inline on current step only; cross-step errors on last step |
| **Custom code needed** | Only if `cross_field_validation` or `async_field_validation` | Always — sub-schema splitting, step state, programmatic validation |
| **formRef needed** | No | Yes — required for `validateForm()` |
| **Form data state** | Managed by RJSF internally | Managed externally via `allData` useState |

---

## Decision Tree for Phase 4

```
Is multi_step: true?
├── NO → Strategy 1 (Schema-Driven)
│         ├── cross_field_validation: true? → Add customValidate
│         ├── async_field_validation: true? → Add blur handler + extraErrors
│         └── Otherwise → Zero custom validation code. JSON Schema handles it.
│
└── YES → Strategy 2 (Custom Per-Step)
          ├── Generate stepSchemas[] from Step Map
          ├── Generate stepUiSchemas[] from Step Map
          ├── Add formRef for validateForm()
          ├── Add allData state for cross-step accumulation
          ├── handleNext() calls validateForm() before advancing
          ├── cross_field_validation: true AND fields span steps?
          │   └── Add cross-step validation in handleSubmit()
          └── cross_field_validation: true AND fields on same step?
              └── Add customValidate to that step's Form instance
```
