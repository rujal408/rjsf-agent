# Example: User Registration Form

A two-section registration form demonstrating cascading country → province selects using the
`dependencies` + `oneOf` pattern, cross-field password confirmation validation, and edit mode
for updating an existing account.

---

## 1. Requirements

The natural language string passed to `/rjsf-build`:

```
Build a user registration form with two sections.

Account Details section:
- Username (text, required, minLength 3, maxLength 30)
- Email (email, required)
- Password (password, required, minLength 8)
- Confirm password (password, required — must match password)

Profile section:
- First name (text, required)
- Last name (text, required)
- Country (select: CA / US / AU, required)
- Province / State (select, required — options depend on country:
    CA → AB, BC, MB, NB, NL, NS, ON, PE, QC, SK
    US → AL, AK, AZ, AR, CA, CO, CT, DE, FL, GA
    AU → ACT, NSW, NT, QLD, SA, TAS, VIC, WA)
- Bio (textarea, optional, maxLength 300)

[x] Cross-field validation: confirmPassword must match password
[x] Edit mode (form pre-populates from existing record)
Use @rjsf/mui theme.
Single-page form.
```

---

## 2. RequirementsBrief

What Phase 1 produces:

```markdown
# Requirements Brief: User Registration Form

## Purpose
New users fill this form to create an account; existing users use it to update their profile.

## RJSF Theme
@rjsf/mui

## Sections & Fields

### Account Details
| Field           | Type     | Required | Validation              | Notes                         |
|-----------------|----------|----------|-------------------------|-------------------------------|
| username        | string   | Yes      | minLength: 3, maxLength: 30 | —                         |
| email           | string   | Yes      | format: email           | —                             |
| password        | string   | Yes      | minLength: 8            | widget: password              |
| confirmPassword | string   | Yes      | minLength: 8            | widget: password; must equal password |

### Profile
| Field     | Type   | Required | Validation     | Notes                                  |
|-----------|--------|----------|----------------|----------------------------------------|
| firstName | string | Yes      | minLength: 1   | —                                      |
| lastName  | string | Yes      | minLength: 1   | —                                      |
| country   | string | Yes      | enum: CA/US/AU | Drives province/state options          |
| province  | string | Yes      | enum (dynamic) | Options depend on country; via dependencies |
| bio       | string | No       | maxLength: 300 | textarea widget                        |

## Conditional Logic
- Show `province` with CA options when `country` equals `"CA"`
- Show `province` with US state options when `country` equals `"US"`
- Show `province` with AU territory options when `country` equals `"AU"`

## Layout Intent
- Form type: single-page
- Account Details section: 1-column (password fields are sensitive — stacked is clearer)
- Profile section: 2-column (firstName/lastName side-by-side, country/province side-by-side)

## Edge Case Flags
- async_options: false
- cross_field_validation: true — confirmPassword must match password
- multi_step: false
- edit_mode: true
- role_based: false
- draft_save: false
- async_field_validation: false
- server_error_mapping: false
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

**2-column layout for Profile section:**
The planner identifies `firstName`/`lastName` and `country`/`province` as natural pairs. These are
placed in CSS Grid `1fr 1fr` columns via `classNames` in uiSchema.

**Cascading select identified:**
`province` options differ by `country` value. The `dependencies` + `oneOf` pattern in JSON Schema
(Draft-07) is the correct RJSF mechanism — no custom component needed. `province` is declared
only inside the `oneOf` branches, not in top-level `properties`, so it only renders once a
`country` is chosen.

**Custom component assessment:**
- Cascading select → `dependencies` + `oneOf` in schema only; no custom widget.
- Cross-field validation → `customValidate` prop on the `Form` component; no custom widget.
- Edit mode → RJSF's built-in `formData` prop; no custom component.

---

## 4. Generated `schema.ts`

```typescript
// src/forms/RegistrationForm/schema.ts
import type { RJSFSchema } from '@rjsf/utils';

export const schema: RJSFSchema = {
  title: 'User Registration',
  type: 'object',
  required: ['username', 'email', 'password', 'confirmPassword', 'firstName', 'lastName', 'country'],
  properties: {
    // ── Account Details ───────────────────────────────────────────────────────
    username: {
      type: 'string',
      title: 'Username',
      minLength: 3,
      maxLength: 30,
    },
    email: {
      type: 'string',
      title: 'Email Address',
      format: 'email',
    },
    password: {
      type: 'string',
      title: 'Password',
      minLength: 8,
    },
    confirmPassword: {
      type: 'string',
      title: 'Confirm Password',
      minLength: 8,
    },

    // ── Profile ───────────────────────────────────────────────────────────────
    firstName: {
      type: 'string',
      title: 'First Name',
      minLength: 1,
    },
    lastName: {
      type: 'string',
      title: 'Last Name',
      minLength: 1,
    },
    country: {
      type: 'string',
      title: 'Country',
      enum: ['CA', 'US', 'AU'],
      enumNames: ['Canada', 'United States', 'Australia'],
    },
    bio: {
      type: 'string',
      title: 'Bio',
      maxLength: 300,
    },
  },

  // Cascading select: province options depend on country
  dependencies: {
    country: {
      oneOf: [
        {
          properties: {
            country: { const: 'CA' },
            province: {
              type: 'string',
              title: 'Province',
              enum: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'],
              enumNames: [
                'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
                'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
                'Prince Edward Island', 'Quebec', 'Saskatchewan',
              ],
            },
          },
          required: ['province'],
        },
        {
          properties: {
            country: { const: 'US' },
            province: {
              type: 'string',
              title: 'State',
              enum: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA'],
              enumNames: [
                'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
                'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
              ],
            },
          },
          required: ['province'],
        },
        {
          properties: {
            country: { const: 'AU' },
            province: {
              type: 'string',
              title: 'State / Territory',
              enum: ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'],
              enumNames: [
                'Australian Capital Territory', 'New South Wales', 'Northern Territory',
                'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia',
              ],
            },
          },
          required: ['province'],
        },
      ],
    },
  },
};
```

---

## 5. Generated `uiSchema.ts`

```typescript
// src/forms/RegistrationForm/uiSchema.ts
import type { UiSchema } from '@rjsf/utils';

export const uiSchema: UiSchema = {
  'ui:order': [
    'username',
    'email',
    'password',
    'confirmPassword',
    'firstName',
    'lastName',
    'country',
    'province',
    'bio',
    '*',
  ],

  username: {
    'ui:autofocus': true,
    'ui:placeholder': 'Choose a unique username',
    'ui:help': '3–30 characters, letters and numbers only',
  },
  email: {
    'ui:placeholder': 'you@example.com',
  },
  password: {
    'ui:widget': 'password',
    'ui:placeholder': 'At least 8 characters',
  },
  confirmPassword: {
    'ui:widget': 'password',
    'ui:placeholder': 'Re-enter your password',
  },
  firstName: {
    'ui:placeholder': 'First name',
  },
  lastName: {
    'ui:placeholder': 'Last name',
  },
  country: {
    'ui:placeholder': 'Select country',
  },
  province: {
    'ui:placeholder': 'Select province / state',
  },
  bio: {
    'ui:widget': 'textarea',
    'ui:options': { rows: 4 },
    'ui:placeholder': 'Tell us a little about yourself (optional)',
  },
};
```

---

## 6. Cross-Field Validation Snippet

The `customValidate` function is added to `index.tsx` and wired to the `Form` component.

```tsx
// src/forms/RegistrationForm/index.tsx (excerpt)
import React, { useState } from 'react';
import Form from '@rjsf/mui';
import { CustomValidator, ErrorSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { schema } from './schema';
import { uiSchema } from './uiSchema';
import type { RegistrationFormData } from './types';

const customValidate: CustomValidator<RegistrationFormData> = (formData, errors) => {
  if (
    formData.password &&
    formData.confirmPassword &&
    formData.confirmPassword !== formData.password
  ) {
    errors.confirmPassword!.addError('Passwords do not match');
  }
  return errors;
};

interface RegistrationFormProps {
  /** Pre-populate for edit mode */
  formData?: Partial<RegistrationFormData>;
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  onError?: (errors: unknown) => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function RegistrationForm({
  formData: initialData,
  onSubmit,
  onError,
}: RegistrationFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [extraErrors, setExtraErrors] = useState<ErrorSchema>({});

  const handleSubmit = async ({ formData }: { formData: RegistrationFormData }) => {
    setSubmitState('submitting');
    setExtraErrors({});
    try {
      await onSubmit(formData);
      setSubmitState('success');
    } catch (err: unknown) {
      setSubmitState('error');
      onError?.(err);
    }
  };

  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      customValidate={customValidate}
      formData={initialData}
      extraErrors={extraErrors}
      onSubmit={handleSubmit}
      disabled={submitState === 'submitting'}
    >
      <button type="submit" disabled={submitState === 'submitting'}>
        {initialData ? 'Save Changes' : 'Create Account'}
      </button>
    </Form>
  );
}
```

---

## 7. Key Test Cases

```tsx
// src/forms/RegistrationForm/RegistrationForm.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RegistrationForm from './index';

// ── Test 1: Cascading select — province options update when country changes ───

test('province options change based on selected country', async () => {
  render(<RegistrationForm onSubmit={vi.fn()} />);

  const countrySelect = screen.getByLabelText(/country/i);

  // Select Canada — province select should appear with Canadian provinces
  await userEvent.selectOptions(countrySelect, 'CA');
  const provinceSelectCA = await screen.findByLabelText(/province/i);
  expect(provinceSelectCA).toBeInTheDocument();

  // Ontario should be a valid option for Canada
  await userEvent.selectOptions(provinceSelectCA, 'ON');
  expect((screen.getByRole('option', { name: 'Ontario' }) as HTMLOptionElement).selected).toBe(true);

  // Switch to Australia — province options should change
  await userEvent.selectOptions(countrySelect, 'AU');
  const provinceSelectAU = await screen.findByLabelText(/state \/ territory/i);
  expect(screen.queryByRole('option', { name: 'Ontario' })).not.toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Victoria' })).toBeInTheDocument();
});

// ── Test 2: Cross-field validation — mismatched passwords show error ──────────

test('shows error when confirmPassword does not match password', async () => {
  render(<RegistrationForm onSubmit={vi.fn()} />);

  await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass1');
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'DifferentPass');

  // Submit to trigger customValidate
  await userEvent.click(screen.getByRole('button', { name: /create account/i }));

  await waitFor(() => {
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });
});

// ── Test 3: Edit mode — form pre-populates with provided formData ─────────────

test('pre-populates fields in edit mode', async () => {
  const existingData = {
    username: 'jdoe',
    email: 'jane@example.com',
    password: 'ExistingPass1',
    confirmPassword: 'ExistingPass1',
    firstName: 'Jane',
    lastName: 'Doe',
    country: 'CA',
    province: 'ON',
    bio: 'Software developer',
  };

  render(<RegistrationForm formData={existingData} onSubmit={vi.fn()} />);

  expect((screen.getByLabelText(/username/i) as HTMLInputElement).value).toBe('jdoe');
  expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe('jane@example.com');
  expect((screen.getByLabelText(/first name/i) as HTMLInputElement).value).toBe('Jane');
  // Button should say "Save Changes" in edit mode, not "Create Account"
  expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
});

// ── Test 4: Matching passwords pass validation and call onSubmit ──────────────

test('calls onSubmit with correct data when passwords match', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<RegistrationForm onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText(/username/i), 'newuser');
  await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'ValidPass99');
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'ValidPass99');
  await userEvent.type(screen.getByLabelText(/first name/i), 'Alice');
  await userEvent.type(screen.getByLabelText(/last name/i), 'Smith');
  await userEvent.selectOptions(screen.getByLabelText(/country/i), 'US');
  const stateSelect = await screen.findByLabelText(/state/i);
  await userEvent.selectOptions(stateSelect, 'CA');

  await userEvent.click(screen.getByRole('button', { name: /create account/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.username).toBe('newuser');
    expect(submitted.country).toBe('US');
    expect(submitted.province).toBe('CA');
  });

  expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
});
```
