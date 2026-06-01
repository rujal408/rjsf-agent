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

Inline styles cannot respond to screen width. Always use a class-based approach.

**CSS Modules / plain CSS variant (mobile-first):**

```tsx
// ObjectFieldTemplate with responsive grid — CSS Modules
import styles from './FormGrid.module.css';

const TwoColumnTemplate: React.FC<ObjectFieldTemplateProps> = ({
  title,
  properties,
  uiSchema,
}) => {
  const fullWidthFields: string[] = uiSchema?.["ui:options"]?.fullWidthFields ?? [];

  return (
    <div>
      {title && <h3>{title}</h3>}
      <div className={styles.grid2}>
        {properties.map((prop) => (
          <div
            key={prop.name}
            className={fullWidthFields.includes(prop.name) ? styles.colFull : undefined}
          >
            {prop.content}
          </div>
        ))}
      </div>
    </div>
  );
};
```

```css
/* FormGrid.module.css — mobile-first */
.grid1 { display: grid; grid-template-columns: 1fr; gap: 16px 24px; }
.grid2 { display: grid; grid-template-columns: 1fr; gap: 16px 24px; }
.grid3 { display: grid; grid-template-columns: 1fr; gap: 16px 24px; }
.grid4 { display: grid; grid-template-columns: 1fr; gap: 16px 24px; }
.colFull { grid-column: 1 / -1; }

@media (min-width: 640px) {
  .grid2 { grid-template-columns: repeat(2, 1fr); }
  .grid3 { grid-template-columns: repeat(2, 1fr); }
  .grid4 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid3 { grid-template-columns: repeat(3, 1fr); }
  .grid4 { grid-template-columns: repeat(4, 1fr); }
}
```

**Tailwind variant (mobile-first):**

```tsx
// Column class map — apply based on FormPlan column count
const colClass: Record<number, string> = {
  1: 'grid grid-cols-1',
  2: 'grid grid-cols-1 sm:grid-cols-2',
  3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

// Usage in template:
<div className={`${colClass[columns]} gap-4`}>
  {properties.map((prop) => (
    <div key={prop.name} className={fullWidthFields.includes(prop.name) ? 'col-span-full' : ''}>
      {prop.content}
    </div>
  ))}
</div>
```

**Bare (no stylesheet) variant — use `auto-fit` so the browser collapses naturally:**

```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 24px' }}>
```

> Note: `auto-fit minmax(280px, 1fr)` does not require media queries — it collapses to 1-column automatically when the container is narrower than 280px × column-count. Use this only for the `bare` styling approach where no stylesheet is available.

---

## 1b. Desktop Multi-Column Enforcement (MANDATORY)

**A section with 3+ short fields rendered in a single column on desktop is a layout bug.** This is the most common aesthetic failure in generated forms — it wastes horizontal space and makes the form look like a mobile layout stretched to fill a wide screen.

### Hard rules

1. **If a section has 3 or more `half`-width fields, the desktop column count MUST be ≥ 2.** No exceptions.
2. **If a section has 5 or more `half`-width fields, the desktop column count SHOULD be 3** (unless the form is a simple contact form or survey).
3. **`full`-width fields do not count** toward the field threshold — they always span all columns regardless.
4. **A section with only `full`-width fields** (e.g., all textareas) MAY remain single-column.
5. **After assigning columns, verify:** scan every section in the FormPlan. If any section violates rules 1–2, fix it before saving the plan.

### Verification checklist (run mentally before saving FormPlan)

```
For each section in FormPlan:
  count_half = number of fields with width = "half" or "quarter"
  if count_half >= 3 AND desktop_columns == 1:
    → BUG: set desktop_columns = 2 (or 3 if count_half >= 5)
  if count_half >= 5 AND desktop_columns == 2:
    → CONSIDER: set desktop_columns = 3
```

---

## 2. Field Width by Type

Every field in the FormPlan MUST have a `width` value: `full`, `half`, or `quarter`. This drives column spanning in both the prototype and React output.

| Field Type | Width Class | CSS Behavior | Rationale |
|---|---|---|---|
| Full name (single field) | `full` | `grid-column: 1 / -1` | Name can be long; avoid truncation |
| Street address | `full` | `grid-column: 1 / -1` | Addresses vary in length |
| Description / notes | `full` | `grid-column: 1 / -1` | Needs space for meaningful input |
| First name | `half` | Default (no span) | Pair with last name |
| Last name | `half` | Default (no span) | Pair with first name |
| Email address | `half` | Default (no span) | Predictable length |
| Phone number | `half` | Default (no span) | Consistent format |
| Date (start or end) | `half` | Default (no span) | Pair start + end dates side by side |
| Number / integer | `half` | Default (no span) | Short numeric values |
| Textarea | `full` | `grid-column: 1 / -1` | Multi-line content needs full width |
| Rich text editor | `full` | `grid-column: 1 / -1` | Editor chrome needs horizontal space |
| File upload | `full` | `grid-column: 1 / -1` | Drop zone / button needs clear area |
| Select (single, ≤10 options) | `half` | Default (no span) | Short option lists fit in half width |
| Select (single, 10+ options or long labels) | `full` | `grid-column: 1 / -1` | Long labels need space |
| Multi-select | `full` | `grid-column: 1 / -1` | Tag display needs horizontal space |
| Checkbox (single boolean) | `half` | Default (no span) | Short label, compact |
| Checkbox group (multiple) | `full` | `grid-column: 1 / -1` | Options list needs full row |
| Radio group (≤4 short options, inline) | `half` | Default (no span) | Fits in half width when inline |
| Radio group (5+ options or stacked) | `full` | `grid-column: 1 / -1` | Options stack vertically |
| ZIP code / postal code | `quarter` | Narrower (in 3+ col grids) | Short, fixed-format value |
| Country code (prefix) | `quarter` | Narrower (in 3+ col grids) | Short "+" code beside phone number |

### Width class → CSS mapping

| Width class | In `grid-2` | In `grid-3` | In `grid-4` |
|---|---|---|---|
| `full` | `col-full` (spans 2) | `col-full` (spans 3) | `col-full` (spans 4) |
| `half` | Default (1 of 2) | Default (1 of 3) | Default (1 of 4) |
| `quarter` | Default (1 of 2) | Default (1 of 3) | Default (1 of 4) |

> **`quarter` fields** only get visually narrower in 3+ column grids where they naturally occupy less space. In 2-column grids, they take one column like `half` fields.

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

---

## 6. Responsive Breakpoints

All generated grid layouts are **mobile-first**: the default (no media query) is 1-column. Breakpoints add columns progressively.

| Breakpoint | Min-width | Columns unlocked |
|---|---|---|
| Mobile (default) | — | 1 column always |
| Tablet | `640px` | Up to 2 columns |
| Desktop | `1024px` | Up to 3–4 columns |

### Per styling approach

All approaches use mobile-first column collapse. The breakpoint tokens differ by system — see the mapping column.

| Approach | Mobile default | Tablet breakpoint | Desktop breakpoint | Notes |
|---|---|---|---|---|
| `css-modules` | `grid-template-columns: 1fr` | `@media (min-width: 640px)` | `@media (min-width: 1024px)` | See `FormGrid.module.css` pattern in Section 1 |
| `scss` | Same as css-modules | Same | Same | Use SCSS nesting (`@media` inside rule block); file is `.module.scss` |
| `tailwind` | `grid-cols-1` | `sm:grid-cols-2` (≥640px) | `lg:grid-cols-3` (≥1024px) | No stylesheet needed; all in className |
| `plain-css` | Same as css-modules | Same | Same | Single `.css` file imported in `index.tsx` |
| `bare` | `auto-fit minmax(280px, 1fr)` inline | — | — | No media queries; browser collapses automatically |
| `mui-grid` | `xs: '1fr'` | `sm: 'repeat(2, 1fr)'` (≥600px) | `lg: 'repeat(3, 1fr)'` (≥1200px) | MUI `Box sx` breakpoint object; auto-selected when theme is `@rjsf/mui` |
| `antd-grid` | `xs={24}` | `sm={12}` (≥576px) | `lg={8}` (≥992px) | Ant Design `Row`/`Col` span (out of 24); auto-selected when theme is `@rjsf/antd` |
| `bootstrap-grid` | `col-12` | `col-sm-6` (≥576px) | `col-lg-4` (≥992px) | Bootstrap responsive classes; auto-selected when theme is `@rjsf/bootstrap` |
| `chakra` | `base: 1` | `md: 2` (≥768px) | `lg: 3` (≥992px) | Chakra `SimpleGrid columns`; only when Chakra UI is a confirmed project dependency |

> **Library-native breakpoints differ from the 640px/1024px defaults.** When `rjsfTheme` is MUI, Ant Design, or Bootstrap, use the library's own breakpoint tokens (listed above) — do not apply 640px/1024px `@media` queries on top of the library grid.

### Touch targets

On mobile, interactive elements must be at least **44px tall** (WCAG 2.5.5). For generated form elements:
- Set `min-height: 44px` on all `input`, `select`, and `button` elements in the form stylesheet.
- For Tailwind: add `min-h-[44px]` to input/button classes.
- Do not rely on browser defaults — most render inputs at ~32–36px by default.
