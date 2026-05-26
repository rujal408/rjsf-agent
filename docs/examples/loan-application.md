# Example: Loan Application Form

A multi-section loan application demonstrating conditional fields driven by `if/then/else`, async
NID validation on blur, and server error mapping after submission.

---

## 1. Requirements

The natural language string passed to `/rjsf-build`:

```
Build a loan application form with two sections.

Personal Information section:
- Full name (text, required)
- Date of birth (date, required)
- NID number (text, required, validate against POST /api/validate-nid on blur —
  returns { valid: boolean, message: string })
- Phone number (text, required)
- Email address (email, required)

Employment section:
- Employment type (select: employed / self-employed / unemployed, required)
- Company name (text, required only when employment type = employed)
- Monthly income (number, min 0, required when employed or self-employed)
- Loan amount (number, min 1000, max 5000000, required)
- Loan purpose (textarea, required)

[x] Server error mapping (backend returns { "nidNumber": "NID already used", "loanAmount": "Exceeds credit limit" })
Use @rjsf/mui theme.
Single-page form.
```

---

## 2. RequirementsBrief

What Phase 1 produces after clarifying questions:

```markdown
# Requirements Brief: Loan Application

## Purpose
Loan applicants fill this form to submit a personal loan request for underwriting review.

## RJSF Theme
@rjsf/mui

## Sections & Fields

### Personal Information
| Field       | Type   | Required | Validation                           | Notes                          |
|-------------|--------|----------|--------------------------------------|--------------------------------|
| fullName    | string | Yes      | minLength: 2                         | —                              |
| dateOfBirth | date   | Yes      | format: date                         | —                              |
| nidNumber   | string | Yes      | minLength: 10, maxLength: 17         | Async blur check: POST /api/validate-nid |
| phone       | string | Yes      | minLength: 7                         | —                              |
| email       | string | Yes      | format: email                        | —                              |

### Employment & Loan
| Field          | Type    | Required               | Validation           | Notes                              |
|----------------|---------|------------------------|----------------------|------------------------------------|
| employmentType | string  | Yes                    | enum                 | employed / self-employed / unemployed |
| companyName    | string  | Yes (if employed)      | minLength: 2         | Shown only when employmentType = employed |
| monthlyIncome  | number  | Yes (if employed/self) | minimum: 0           | Hidden when unemployed             |
| loanAmount     | number  | Yes                    | min: 1000, max: 5000000 | —                               |
| loanPurpose    | string  | Yes                    | minLength: 10        | textarea widget                    |

## Conditional Logic
- Show `companyName` when `employmentType` equals `"employed"`
- Show `monthlyIncome` when `employmentType` equals `"employed"` OR `"self-employed"`

## Layout Intent
- Form type: single-page
- Two sections rendered as stacked MUI Paper cards

## Edge Case Flags
- async_options: false
- cross_field_validation: false
- multi_step: false
- edit_mode: false
- role_based: false
- draft_save: false
- async_field_validation: true — nidNumber (POST /api/validate-nid)
- server_error_mapping: true — nidNumber, loanAmount
- nested_arrays: false
- computed_fields: false
- array_reorder: false
- file_upload_server: false
- view_mode: false
- tab_layout: false
- i18n: false
- masked_input: false
- rich_text: false
- print_export: false
```

---

## 3. FormPlan Key Decisions

**Column layout:**
- Personal Information — 2-column grid (fullName full-width, then dateOfBirth / nidNumber side-by-side, phone / email side-by-side)
- Employment & Loan — 1-column (employmentType, then conditional companyName/monthlyIncome, then loanAmount, then loanPurpose full-width)

**Widget choices:**
| Field          | Widget          | Reason                                       |
|----------------|-----------------|----------------------------------------------|
| dateOfBirth    | date (native)   | Standard HTML date picker, no custom needed  |
| employmentType | select          | Enum — RJSF renders select by default        |
| loanPurpose    | textarea        | Multi-line text                              |
| nidNumber      | NidWidget       | Custom — needs async blur validation trigger |

**Customization Assessment:**
- `companyName` / `monthlyIncome` conditional visibility → handled by JSON Schema `if/then/else`; no custom component needed.
- `nidNumber` async blur validation → requires a custom widget (`NidWidget`) so the `onBlur` event can fire an API call and surface an `extraErrors` update.
- No custom template needed — MUI theme handles section grouping.

---

## 4. Generated `schema.ts`

```typescript
// src/forms/LoanApplication/schema.ts
import type { RJSFSchema } from '@rjsf/utils';

export const schema: RJSFSchema = {
  title: 'Loan Application',
  type: 'object',
  required: [
    'fullName',
    'dateOfBirth',
    'nidNumber',
    'phone',
    'email',
    'employmentType',
    'loanAmount',
    'loanPurpose',
  ],
  properties: {
    fullName: {
      type: 'string',
      title: 'Full Name',
      minLength: 2,
    },
    dateOfBirth: {
      type: 'string',
      title: 'Date of Birth',
      format: 'date',
    },
    nidNumber: {
      type: 'string',
      title: 'NID Number',
      minLength: 10,
      maxLength: 17,
      description: 'National Identity Document number',
    },
    phone: {
      type: 'string',
      title: 'Phone Number',
      minLength: 7,
    },
    email: {
      type: 'string',
      title: 'Email Address',
      format: 'email',
    },
    employmentType: {
      type: 'string',
      title: 'Employment Type',
      enum: ['employed', 'self-employed', 'unemployed'],
      enumNames: ['Employed', 'Self-Employed', 'Unemployed'],
    },
    loanAmount: {
      type: 'number',
      title: 'Loan Amount (NPR)',
      minimum: 1000,
      maximum: 5000000,
    },
    loanPurpose: {
      type: 'string',
      title: 'Loan Purpose',
      minLength: 10,
    },
  },

  // Conditional: show companyName + monthlyIncome when employed
  if: {
    properties: {
      employmentType: { const: 'employed' },
    },
    required: ['employmentType'],
  },
  then: {
    properties: {
      companyName: {
        type: 'string',
        title: 'Company Name',
        minLength: 2,
      },
      monthlyIncome: {
        type: 'number',
        title: 'Monthly Income (NPR)',
        minimum: 0,
      },
    },
    required: ['companyName', 'monthlyIncome'],
  },
  else: {
    // Show monthlyIncome for self-employed but not companyName
    if: {
      properties: {
        employmentType: { const: 'self-employed' },
      },
      required: ['employmentType'],
    },
    then: {
      properties: {
        monthlyIncome: {
          type: 'number',
          title: 'Monthly Income (NPR)',
          minimum: 0,
        },
      },
      required: ['monthlyIncome'],
    },
  },
};
```

---

## 5. Generated `uiSchema.ts`

```typescript
// src/forms/LoanApplication/uiSchema.ts
import type { UiSchema } from '@rjsf/utils';

export const uiSchema: UiSchema = {
  'ui:order': [
    'fullName',
    'dateOfBirth',
    'nidNumber',
    'phone',
    'email',
    'employmentType',
    'companyName',
    'monthlyIncome',
    'loanAmount',
    'loanPurpose',
    '*',
  ],

  fullName: {
    'ui:autofocus': true,
    'ui:placeholder': 'Enter your full legal name',
  },
  dateOfBirth: {
    'ui:help': 'Must be 18 years or older to apply',
  },
  nidNumber: {
    'ui:widget': 'NidWidget',
    'ui:placeholder': 'e.g. 12345678901234567',
    'ui:help': 'Your 10–17 digit National Identity Document number',
  },
  phone: {
    'ui:placeholder': '+977 98XXXXXXXX',
  },
  email: {
    'ui:placeholder': 'you@example.com',
  },
  employmentType: {
    'ui:placeholder': 'Select employment status',
  },
  companyName: {
    'ui:placeholder': 'Legal company name',
  },
  monthlyIncome: {
    'ui:help': 'Your average net monthly income after tax',
  },
  loanAmount: {
    'ui:help': 'Minimum NPR 1,000 — maximum NPR 50,00,000',
  },
  loanPurpose: {
    'ui:widget': 'textarea',
    'ui:options': { rows: 4 },
    'ui:placeholder': 'Describe the purpose of the loan in at least 10 characters',
  },
};
```

---

## 6. Generated `index.tsx`

```tsx
// src/forms/LoanApplication/index.tsx
import React, { useState } from 'react';
import Form from '@rjsf/mui';
import { ErrorSchema, WidgetProps } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { schema } from './schema';
import { uiSchema } from './uiSchema';
import type { LoanApplicationData } from './types';

// ─── NID async-validation widget ─────────────────────────────────────────────

const NidWidget: React.FC<WidgetProps> = ({
  id,
  value,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
}) => {
  const [checking, setChecking] = useState(false);

  const handleBlur = async () => {
    if (!value) return;
    setChecking(true);
    try {
      const res = await fetch('/api/validate-nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nid: value }),
      });
      const { valid, message } = await res.json();
      // Signal blur to RJSF (id, value) — parent reads extraErrors for the
      // async result; here we fire the standard onBlur so RJSF marks touched.
      onBlur(id, value);
      if (!valid) {
        // Dispatch a CustomEvent the parent Form wrapper listens to, or use
        // the setExtraErrors callback injected via formContext (see index.tsx).
        const event = new CustomEvent('nid-validation-result', {
          detail: { valid, message },
        });
        document.dispatchEvent(event);
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <input
        id={id}
        type="text"
        value={(value as string) ?? ''}
        required={required}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        onBlur={handleBlur}
        aria-label="NID Number"
        style={{ width: '100%' }}
      />
      {checking && (
        <span style={{ fontSize: 12, color: '#666' }} aria-live="polite">
          Validating…
        </span>
      )}
    </div>
  );
};

// ─── Server error helper ──────────────────────────────────────────────────────

function mapServerErrors(serverErrors: Record<string, string>): ErrorSchema {
  const out: ErrorSchema = {};
  for (const [path, message] of Object.entries(serverErrors)) {
    const parts = path.split('.');
    let node: Record<string, unknown> = out;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]] as Record<string, unknown>;
    }
    const last = parts[parts.length - 1];
    (node as Record<string, { __errors: string[] }>)[last] = { __errors: [message] };
  }
  return out;
}

// ─── Form component ───────────────────────────────────────────────────────────

interface LoanApplicationFormProps {
  onSubmit: (data: LoanApplicationData) => Promise<void>;
  onError?: (errors: unknown) => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function LoanApplicationForm({
  onSubmit,
  onError,
}: LoanApplicationFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [extraErrors, setExtraErrors] = useState<ErrorSchema>({});

  // Listen for NID async validation result from the widget
  React.useEffect(() => {
    const handler = (e: Event) => {
      const { valid, message } = (e as CustomEvent<{ valid: boolean; message: string }>).detail;
      if (!valid) {
        setExtraErrors((prev) => ({
          ...prev,
          nidNumber: { __errors: [message] },
        }));
      } else {
        setExtraErrors((prev) => {
          const next = { ...prev };
          delete next.nidNumber;
          return next;
        });
      }
    };
    document.addEventListener('nid-validation-result', handler);
    return () => document.removeEventListener('nid-validation-result', handler);
  }, []);

  const handleSubmit = async ({ formData }: { formData: LoanApplicationData }) => {
    setSubmitState('submitting');
    setExtraErrors({});
    try {
      await onSubmit(formData);
      setSubmitState('success');
    } catch (err: unknown) {
      setSubmitState('error');
      const fieldErrors =
        err && typeof err === 'object' && 'fields' in err
          ? (err as { fields: Record<string, string> }).fields
          : {};
      if (Object.keys(fieldErrors).length > 0) {
        setExtraErrors(mapServerErrors(fieldErrors));
      }
      onError?.(err);
    }
  };

  return (
    <div>
      {submitState === 'success' && (
        <div role="alert" style={{ color: 'green', marginBottom: 16 }}>
          Your loan application has been submitted successfully.
        </div>
      )}
      <Form
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        widgets={{ NidWidget }}
        extraErrors={extraErrors}
        onSubmit={handleSubmit}
        disabled={submitState === 'submitting'}
      >
        <button type="submit" disabled={submitState === 'submitting'}>
          {submitState === 'submitting' ? 'Submitting…' : 'Submit Application'}
        </button>
      </Form>
    </div>
  );
}
```

---

## 7. Key Test Cases

```tsx
// src/forms/LoanApplication/LoanApplication.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import LoanApplicationForm from './index';

// ── Test 1: companyName appears only when employmentType = "employed" ─────────

test('shows companyName when employment type is employed, hides it otherwise', async () => {
  render(<LoanApplicationForm onSubmit={vi.fn()} />);

  // companyName is not visible initially (no employmentType selected)
  expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();

  // Select "Employed"
  const select = screen.getByLabelText(/employment type/i);
  await userEvent.selectOptions(select, 'employed');

  expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();

  // Switch to "Unemployed" — companyName should disappear
  await userEvent.selectOptions(select, 'unemployed');
  expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
});

// ── Test 2: async NID validation surfaces field-level error ───────────────────

test('shows NID validation error when API returns invalid', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ valid: false, message: 'NID not found in registry' }),
  } as unknown as Response);

  render(<LoanApplicationForm onSubmit={vi.fn()} />);

  const nidInput = screen.getByLabelText(/nid number/i);
  await userEvent.type(nidInput, '12345678901');
  fireEvent.blur(nidInput);

  await waitFor(() => {
    expect(screen.getByText('NID not found in registry')).toBeInTheDocument();
  });
});

// ── Test 3: server error mapping puts errors on the correct fields ────────────

test('maps server field errors to inline field messages', async () => {
  const onSubmit = vi.fn().mockRejectedValue({
    fields: {
      nidNumber: 'NID already used in another application',
      loanAmount: 'Exceeds your credit limit',
    },
  });

  render(<LoanApplicationForm onSubmit={onSubmit} />);

  // Fill required fields minimally
  await userEvent.type(screen.getByLabelText(/full name/i), 'Ram Bahadur');
  await userEvent.type(screen.getByLabelText(/date of birth/i), '1990-01-15');
  await userEvent.type(screen.getByLabelText(/nid number/i), '12345678901');
  await userEvent.type(screen.getByLabelText(/phone/i), '9841000000');
  await userEvent.type(screen.getByLabelText(/email/i), 'ram@example.com');
  await userEvent.selectOptions(screen.getByLabelText(/employment type/i), 'unemployed');
  await userEvent.type(screen.getByLabelText(/loan amount/i), '50000');
  await userEvent.type(screen.getByLabelText(/loan purpose/i), 'Home renovation project');

  fireEvent.submit(screen.getByRole('form') ?? document.querySelector('form')!);

  await waitFor(() => {
    expect(screen.getByText('NID already used in another application')).toBeInTheDocument();
    expect(screen.getByText('Exceeds your credit limit')).toBeInTheDocument();
  });
});

// ── Test 4: required fields show errors on empty submit ───────────────────────

test('shows required field errors when form is submitted empty', async () => {
  render(<LoanApplicationForm onSubmit={vi.fn()} />);

  fireEvent.submit(document.querySelector('form')!);

  await waitFor(() => {
    expect(screen.getByText(/full name/i)).toBeInTheDocument();
    // RJSF renders "is a required property" messages for each required field
    const errors = screen.getAllByText(/required property/i);
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });
});
```
