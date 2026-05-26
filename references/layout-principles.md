# Layout Principles Reference

Guidance for choosing column counts, field widths, section groupings, and widget selection when generating RJSF forms.

---

## 1. Column Layout Heuristics

| Field Count in Section | Recommended Column Count | Notes |
|---|---|---|
| 1–2 fields | 1 column | Keep it simple; avoid empty columns |
| 3–4 fields | 2 columns | Natural pairing (e.g., first + last name) |
| 5–8 fields | 2–3 columns | 2-col preferred; 3-col for dense data-entry forms |
| 9+ fields | 3–4 columns | Only for expert/admin forms; consider sub-sections |
| Mixed types (text + textarea + file) | 2 columns with full-width spans | Short fields 50%, long fields 100% |

### Grid Implementation Pattern

```tsx
// ObjectFieldTemplate with 2-column grid and full-width exceptions
const TwoColumnTemplate: React.FC<ObjectFieldTemplateProps> = ({
  title,
  properties,
  uiSchema,
}) => {
  const fullWidthFields: string[] = uiSchema?.["ui:options"]?.fullWidthFields ?? [];

  return (
    <div>
      {title && <h3>{title}</h3>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
        {properties.map((prop) => (
          <div
            key={prop.name}
            style={{
              gridColumn: fullWidthFields.includes(prop.name) ? "1 / -1" : undefined,
            }}
          >
            {prop.content}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 2. Field Width by Type

| Field Type | Recommended Width | Rationale |
|---|---|---|
| Full name (single field) | Full width | Name can be long; avoid truncation |
| Street address | Full width | Addresses vary in length |
| Description / notes | Full width | Needs space for meaningful input |
| First name | Half width | Pair with last name |
| Last name | Half width | Pair with first name |
| Email address | Half width | Predictable length |
| Phone number | Half width | Consistent format |
| Date (start or end) | Half width | Pair start + end dates side by side |
| Number / integer | Half width | Short numeric values |
| Textarea | Full width | Multi-line content needs full width |
| Rich text editor | Full width | Editor chrome needs horizontal space |
| File upload | Full width | Drop zone / button needs clear area |
| Select (single) | Half to full | Half for short lists, full for long labels |
| Multi-select | Half to full | Depends on option label length |
| Checkbox | Full width | Label reads left to right; do not crowd |
| Radio group | Full width | Options stack vertically or inline |
| ZIP code / postal code | Quarter width | Short, fixed-format value |
| Country code (prefix) | Quarter width | Short "+" code beside phone number |

---

## 3. Section Grouping Rules

1. **Related fields together.** Group fields that conceptually belong together into named sub-objects (e.g., all address fields under `address`, all payment fields under `payment`). Each sub-object renders as its own section with a title.

2. **Identifying fields first.** Fields that identify the record (name, ID, title) come before detail fields. The user's eye goes to the top-left first.

3. **Conditional/dependent fields last within a section.** Fields that appear only when another field has a specific value should appear after the field that controls them, and after unconditional fields in the same section. Never put a conditional field before its controlling field.

4. **Destructive or irreversible fields last.** Checkboxes like "Delete account" or "Archive all records" should be in their own section at the bottom, separated visually from normal fields. Add a `ui:description` warning.

5. **File uploads and signatures at the end.** File inputs and signature pads are heavy UI elements. Place them in the final section or at the bottom of their section so they do not interrupt the text-input flow.

---

## 4. Layout Patterns by Form Type

| Form Type | Recommended Layout | Section Structure |
|---|---|---|
| Simple contact form | 1 column | Single section: name, email, message |
| User registration | 2 columns | Section 1: account (email, password, confirm); Section 2: profile (first, last, phone) |
| Job application | 2–3 columns | Section 1: personal info; Section 2: address; Section 3: experience (array); Section 4: documents (files) |
| Settings / preferences | 2 columns | Group by category (notifications, security, appearance); each category is a sub-section |
| Data entry (admin) | 3 columns | Dense grid; full-width for text areas; array sections below main fields |
| Survey / questionnaire | 1 column | One question per row; use wizard/steps for 10+ questions |

---

## 5. Widget Selection by Context

| Context / Constraint | Recommended Widget | Avoid |
|---|---|---|
| 2–4 mutually exclusive options | Radio buttons (`ui:widget: "radio"`) | Dropdown (overhead for small lists) |
| 5+ mutually exclusive options | Dropdown select | Radio (too many stacked options) |
| Search / filter with many options | Autocomplete (custom widget) | Plain select with 50+ options |
| Binary true/false (agree, enable) | Checkbox | Radio yes/no (more clicks) |
| Date in the past (birthday, event) | Date picker with max = today | Free text (format errors) |
| Date in the future (appointment, deadline) | Date picker with min = today | Free text |
| Long unstructured text | Textarea (`ui:widget: "textarea"`) | Single-line text input |
| Formatted text (markdown, HTML) | Rich text editor (custom widget) | Textarea (no formatting) |
| Sensitive text (password, PIN) | Password input (`ui:widget: "password"`) | Plain text |
| Numeric range (price, quantity, rating) | Number input with `minimum`/`maximum` | Slider for non-visual contexts |
| Phone number with country code | Custom PhoneWidget | Plain text (ambiguous format) |
| Color value | Custom ColorPicker widget | Text input for color hex |
| Star rating (1–5) | Custom StarRating widget | Number input (poor UX) |
