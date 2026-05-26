# Layout Guide

Explains the decisions the agent makes automatically when planning form layout, and how to override any of them.

---

## Column Heuristics

The agent decides how many columns to use in each section based on field count and form type:

| Fields in section | Default columns | Notes |
|---|---|---|
| 1–2 fields | 1 column | Avoid empty columns; a 2-col layout with one field looks wrong |
| 3–4 fields | 2 columns | Natural for side-by-side pairs like first + last name |
| 5–8 fields | 2–3 columns | 2-col preferred; 3-col for dense data-entry or admin forms |
| 9+ fields | 3–4 columns | Consider sub-sections to avoid cognitive overload |
| Mixed types (text + textarea + file) | 2 col with full-width spans | Short fields at 50%, long fields at 100% |

### Examples

A personal info section with 4 fields (first name, last name, email, phone) → 2 columns:
```
[ First Name ]  [ Last Name ]
[ Email      ]  [ Phone     ]
```

A settings section with 2 fields (notification frequency, email digest) → 1 column:
```
[ Notification Frequency ]
[ Email Digest           ]
```

A data entry section with 6 fields (invoice #, date, due date, amount, currency, status) → 3 columns:
```
[ Invoice #  ]  [ Date      ]  [ Due Date  ]
[ Amount     ]  [ Currency  ]  [ Status    ]
```

---

## Field Width by Type

Within a multi-column grid, individual fields span either full width, half width, or quarter width:

| Field type | Default width | Reason |
|---|---|---|
| Full name (single field) | Full width | Name can be long; avoid truncation |
| Street address | Full width | Addresses vary in length |
| Description, notes, bio | Full width | Textarea needs horizontal space |
| First name | Half width | Pair with last name |
| Last name | Half width | Pair with first name |
| Email address | Half width | Predictable, moderate length |
| Phone number | Half width | Consistent format |
| Start date or end date | Half width | Pair start + end side by side |
| Number or integer | Half width | Short numeric values |
| Textarea | Full width | Multi-line content needs space |
| Rich text editor | Full width | Editor chrome needs horizontal space |
| File upload | Full width | Drop zone needs clear area |
| Single select (short list) | Half width | Short option labels |
| Single select (long labels) | Full width | Prevent label truncation |
| Checkbox (boolean) | Full width | Label reads left-to-right; do not crowd |
| Radio group | Full width | Options stack or inline; need room |
| ZIP code / postal code | Quarter width | Short, fixed-format value |
| Country code prefix | Quarter width | Short "+N" value beside phone input |

---

## Section Grouping Rules

The agent applies four rules when deciding how to group fields into sections:

**1. Related fields together.** Fields that conceptually belong together become a named sub-object in the schema. All address fields under `address`, all payment fields under `payment`. Each sub-object renders with its own section title.

**2. Identifying fields first.** Name, ID, title — fields that identify the record — appear at the top-left. The eye goes to the top of the form first.

**3. Conditional fields last within a section.** A field that appears only when another field has a specific value is placed after the field that controls it, and after all unconditional fields in the same section. A conditional field that appears before its trigger field is confusing.

**4. Destructive or irreversible fields last.** Checkboxes like "Permanently delete account" or "Archive all records" go in their own section at the bottom with a `ui:description` warning. File uploads and signature pads are placed at the end of their section because they are visually heavy.

---

## Widget Selection by Context

The agent selects the input widget based on field type and option count:

| Context | Widget chosen |
|---|---|
| Boolean (yes/no) | Checkbox |
| 2–4 options, all visible at once | Radio group |
| 5–10 options | Select dropdown |
| 11+ options | Select dropdown (consider adding search) |
| 11+ options where users know what they want | Autocomplete / combobox |
| Multi-select, few options (2–6) | Checkboxes |
| Multi-select, many options | Multi-select dropdown |
| Long string, single line | Text input |
| Long string, multi-line | Textarea |
| Date only | Date picker (`type="date"`) |
| Date and time | Datetime picker (`type="datetime-local"`) |
| Numeric, bounded range | Number input (with min/max from schema) |
| Sensitive text (password, SSN) | Password input or masked widget |
| Options from API | Async select (see [edge-cases.md](edge-cases.md)) |

---

## How to Override Layout

You have three opportunities to change layout decisions:

### 1. In your requirements text (before Phase 2)

The most reliable place. State your preferences explicitly:

```
Personal Information section: 3 columns
Address section: full-width fields only
phone number: full width, not half width
ZIP code: standard half width (not quarter)
```

The agent reads these instructions during Phase 2 and plans accordingly.

### 2. During `/rjsf-plan` approval (after Phase 2, before Phase 3)

After the agent shows you the FormPlan, review the column layout table. Before approving, say:

```
"Change the Insurance section to 3 columns. Move 'preferred contact method' to be full-width."
```

The agent revises the plan and shows you the updated version before continuing.

### 3. After generation with `/rjsf-iterate`

The fastest way to adjust layout after code is already written:

```
/rjsf-iterate "change the address section to 3 columns"
/rjsf-iterate "make the email field full-width in the contact section"
/rjsf-iterate "move the phone field to the second column next to email"
```

Layout changes only affect `uiSchema.ts` (and possibly a template component if columns are customized). The agent shows a diff before writing.

---

## Multi-Step Wizard vs. Tab Layout

Both patterns break a long form into named sections. The difference is in navigation:

**Multi-step wizard:**
- Shows one section at a time
- Linear progression: Back / Next buttons
- Submit button only appears on the last step
- Each step can be validated independently before proceeding
- Use when the form has a natural flow where later sections depend on earlier answers
- Use for long forms where seeing everything at once is overwhelming (10+ fields)

**Tab layout:**
- Shows all section tabs at once, user can click any tab
- No forced sequence — the user can fill sections in any order
- Submit button is always visible
- All sections are validated together on submit
- Use when sections are independent of each other
- Use for settings pages and forms where expert users want to jump to specific sections

Tell the agent which you want in your requirements:

```
"Build as a multi-step wizard with 3 steps: Personal Info, Employment, Documents"
"Use a tab layout — all sections accessible at once"
```

---

## `ui:order` and Field Ordering

`ui:order` is a JSON Schema concept that controls the display order of fields within a section, independently of the order they appear in `properties`. RJSF renders fields in the `ui:order` sequence.

The generated `uiSchema.ts` always includes `ui:order` at every level:

```typescript
export const uiSchema: UiSchema = {
  'ui:order': ['personalInfo', 'employment', 'documents'],

  personalInfo: {
    'ui:order': ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'],
  },

  employment: {
    'ui:order': ['employmentType', 'companyName', 'jobTitle', 'monthlyIncome'],
  },
};
```

The `*` wildcard at the end catches any fields not explicitly listed:
```typescript
'ui:order': ['firstName', 'lastName', '*']
```

To reorder fields after generation, either edit `uiSchema.ts` directly (safe, layout-only change) or use:
```
/rjsf-iterate "move dateOfBirth before email in the personal info section"
```

The agent updates the `ui:order` array and shows you the diff.
