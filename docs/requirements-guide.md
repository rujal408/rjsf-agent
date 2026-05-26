# Writing Good Requirements

The quality of the generated form depends entirely on the quality of the requirements you provide. This guide explains how to write requirements the agent can parse accurately — and how to avoid the common mistakes that lead to extra clarifying questions or mismatched output.

---

## Tips for Natural Language Input

### Be specific about field types

The agent maps your description to a JSON Schema type and an HTML input widget. Vague descriptions force it to guess.

| Instead of this | Write this |
|---|---|
| "a date field" | "date of birth (date picker, required)" |
| "contact info" | "email address (required), phone number (optional)" |
| "employment details" | "employment type (select: full-time / part-time / contractor / self-employed)" |
| "how many" | "quantity (integer, minimum 1, maximum 999)" |
| "their message" | "message (textarea, required, maximum 500 characters)" |

### State required vs. optional for every field

If you do not say, the agent will ask. State it explicitly:

```
full name (required)
middle name (optional)
company (optional)
```

### Include all validation rules upfront

Do not wait for the agent to ask. Specify:
- String length: `(minimum 2 characters, maximum 100 characters)`
- Number range: `(integer, minimum 0, maximum 1000)`
- Format: `(email format)`, `(must match pattern: +1-XXX-XXX-XXXX)`
- Custom: `(must be a future date)`, `(must be 18 or older)`

### Describe conditional logic explicitly

The agent handles `if/then/else` conditions in JSON Schema, but only if you describe them. Name both the trigger and the consequence:

```
employment type (select: employed / self-employed / unemployed)
company name (text, required only if employment type = employed)
business name (text, required only if employment type = self-employed)
```

If a whole section should appear conditionally, say so:

```
benefits section: appears only if contract type = full-time
```

### Name your sections

Group related fields under a named section. This controls how the agent structures the schema (as nested objects) and how labels appear in the form:

```
Section 1: Personal Information — first name, last name, email, phone
Section 2: Address — street, city, state, ZIP, country
Section 3: Employment — ...
```

---

## Requirements File Template

When your form is complex enough to warrant a file, use this template. Save it as a `.md` file and pass it to the agent with `/rjsf-build --from requirements.md`.

```markdown
# Form Requirements: <Form Name>

## Purpose
One or two sentences explaining what this form is for and who fills it out.

## Sections / Fields

### Section Name
- field name (type, required/optional, validation rules)
- field name (type, required/optional, options: option1 / option2 / option3)
- field name (textarea, optional, max 500 characters)

### Another Section Name
- ...

## Conditional Logic
- <field name> appears only when <other field> = <value>
- <section name> is hidden unless <field> is one of: <value1>, <value2>

## Layout
- Single-page form OR multi-step wizard (list steps if multi-step)
- Column preference per section (e.g., "Personal Info: 2 columns", "Address: 3 columns")
- Any full-width fields that should span all columns

## Special Requirements
- [ ] Async dropdown options (field name, endpoint: /api/path)
- [ ] Cross-field validation (describe the rule)
- [ ] Server error mapping (backend returns field-keyed errors)
- [ ] Edit mode (form pre-populates from existing record)
- [ ] Draft save (auto-save to localStorage)
- [ ] Role-based visibility (describe roles and rules)
- [ ] File upload (field name, accepted types, server endpoint)
- [ ] Masked input (field name, mask format)
- [ ] Multi-language support
```

---

## Worked Example: Patient Intake Form

Here is a complete requirements file for a realistic form. This example includes two sections, one conditional field, and one async dropdown.

```markdown
# Form Requirements: Patient Intake Form

## Purpose
Collects demographic and insurance information from new patients before their first appointment.
Filled out by the patient in a tablet kiosk at the front desk or via a web link sent by email.

## Sections / Fields

### Personal Information
- first name (text, required, minimum 1 character, maximum 50 characters)
- last name (text, required, minimum 1 character, maximum 50 characters)
- date of birth (date, required, must be in the past, patient must be at least 1 year old)
- biological sex (radio: Male / Female / Intersex / Prefer not to say, required)
- email address (email, optional)
- phone number (text, optional, format hint: (XXX) XXX-XXXX)
- preferred contact method (radio: Phone / Email, required only if email or phone provided)

### Insurance Information
- has insurance (checkbox: "I have health insurance coverage", optional, defaults to unchecked)
- insurance provider (select, required if has insurance = true)
  Options loaded from API: GET /api/insurance-providers — returns [{id, name}] list
- member ID (text, required if has insurance = true, maximum 30 characters)
- group number (text, optional, appears only if has insurance = true)
- primary insured (radio: Self / Spouse / Parent / Other, required if has insurance = true)
- primary insured name (text, required if primary insured is not Self)

## Conditional Logic
- The entire Insurance Information section's fields (insurance provider, member ID, group number,
  primary insured, primary insured name) appear only when has insurance = true.
- primary insured name appears only when primary insured is Spouse, Parent, or Other.

## Layout
- Single-page form, two sections as described above.
- Personal Information: 2-column layout (first name + last name side by side,
  date of birth + biological sex side by side, email + phone side by side,
  preferred contact method full-width).
- Insurance Information: 2-column layout (insurance provider full-width,
  member ID + group number side by side, primary insured full-width,
  primary insured name full-width).

## Special Requirements
- [x] Async dropdown options (insurance provider, endpoint: GET /api/insurance-providers)
- [ ] Cross-field validation
- [x] Server error mapping (backend returns { "memberId": "Not found in system" } style errors)
- [ ] Edit mode
- [ ] Draft save
```

---

## Common Mistakes to Avoid

### Vague field types

Saying "a field for their phone" does not tell the agent whether you want a plain text input, a masked input, a custom widget with a country code prefix, or an international format. Be explicit: "phone number (text, US format, optional)" or "phone number (PhoneWidget with country code prefix, optional)".

### Missing required/optional on every field

Omitting this is the single most common cause of extra clarifying questions. If you write a list of fields without tagging each one, the agent has to ask about every single one. A form with 15 fields where none are tagged will generate 15 clarifying questions.

### No section structure

A flat list of 20 fields with no section grouping makes it impossible for the agent to decide how to nest the schema or layout the form. Always group related fields under named sections, even if there is only one section. A single-section form is fine — but name it.

### Describing options without listing them

"A dropdown for country" forces the agent to choose between static enum values and an async API fetch. Say which: "country (select, static list: US / CA / UK / AU / other)" or "country (select, options from GET /api/countries)".

### Conditional logic described ambiguously

"Show the address section if the user is local" — local to what? The trigger must be unambiguous: "address section appears only when delivery method = Ship to address". Name the controlling field and the exact value that triggers the condition.

### Forgetting to specify the RJSF theme

If you do not mention it, the agent will ask. If your project uses `@rjsf/mui`, say so. This affects imports and styling assumptions in the generated component.
