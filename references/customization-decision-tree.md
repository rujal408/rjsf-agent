# RJSF Customization Decision Tree

Use this document to decide which RJSF extension point to implement for a given requirement.

---

## Decision Flow

```
Does the requirement involve a SINGLE input control?
├── YES → Does the standard HTML input type cover it?
│         ├── YES → No customization needed (use uiSchema widget override)
│         │         Examples: text, email, password, number, date,
│         │                   checkbox, select/radio via enum
│         │
│         └── NO  → Custom WIDGET
│                   Examples: phone + country code, star rating, color picker,
│                             masked input, autocomplete/search-as-you-type,
│                             rich text editor, signature pad,
│                             file upload with preview, slider/range
│
└── NO → Does it involve MULTIPLE inputs that share one label/error?
          ├── YES → Custom FIELD
          │         Examples: date range (start + end), address (street + city + country),
          │                   currency (amount + currency selector),
          │                   name (prefix + first + last),
          │                   geolocation (lat + lng), card (number + expiry + CVV)
          │
          └── NO → Does it affect the LAYOUT of a group of fields?
                    ├── YES → Custom TEMPLATE
                    │         Examples: multi-step wizard, tab layout, accordion,
                    │                   2/3/4-column grid, custom array add/remove/reorder,
                    │                   collapsible sections, sticky header on long forms
                    │
                    └── NO → No customization needed
```

---

## Quick Reference Table

| Requirement | Customization Type | Interface |
|---|---|---|
| PhoneWidget (country code + number) | Widget | `WidgetProps` |
| StarRating | Widget | `WidgetProps` |
| ColorPicker | Widget | `WidgetProps` |
| MaskedInput (SSN, credit card, etc.) | Widget | `WidgetProps` |
| RichText / WYSIWYG editor | Widget | `WidgetProps` |
| Autocomplete / search-as-you-type | Widget | `WidgetProps` |
| FileUploadServer (upload + return URL) | Widget | `WidgetProps` |
| DateRange (start + end dates) | Field | `FieldProps` |
| Address (street + city + state + country) | Field | `FieldProps` |
| Currency (amount + currency selector) | Field | `FieldProps` |
| MultiStepWizard (paginated form) | Template | `ObjectFieldTemplateProps` |
| TabLayout (fields in tabs) | Template | `ObjectFieldTemplateProps` |
| Accordion (collapsible sections) | Template | `ObjectFieldTemplateProps` |
| DragReorderArray | Template | `ArrayFieldTemplateProps` |
| CustomAddRemove (array controls) | Template | `ArrayFieldTemplateProps` |
| CustomLabelLayout (label above/beside) | Template | `FieldTemplateProps` |

---

## Choosing the Right Template

When the answer is "Custom Template", pick the specific template based on scope:

| Template | Controls | Use When |
|---|---|---|
| `FieldTemplate` | Wraps a single field (label + input + error + help) | You want to change how every field's chrome is rendered |
| `ObjectFieldTemplate` | Wraps all fields in an object/section | You want a grid, wizard, tabs, or accordion layout |
| `ArrayFieldTemplate` | Wraps the entire array (items + add button) | You want custom add/remove/reorder controls or drag-and-drop |
| `TitleFieldTemplate` | Renders section/object titles | You want styled headings |
| `DescriptionFieldTemplate` | Renders field/section descriptions | You want styled help text |

---

## Nested Array Rule

**Problem:** Arrays inside arrays (e.g., `contacts[].emails[]`) create deeply nested UIs that are difficult to use.

**Rule:** When a schema has an array nested inside another array, generate a custom `ArrayFieldTemplate` for the inner array that renders as a tag-input or comma-separated text input rather than a full nested array UI.

**Implementation pattern:**

```tsx
// Inner array rendered as comma-separated tags
const TagArrayTemplate: React.FC<ArrayFieldTemplateProps> = ({
  items,
  canAdd,
  onAddClick,
  formData,
}) => {
  // Render each string item as a removable tag chip
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {items.map((item) => (
        <span
          key={item.key}
          style={{
            background: "#e0e7ff",
            borderRadius: 12,
            padding: "2px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {/* Access the string value via item.children for display */}
          {(formData as string[])[item.index]}
          {item.hasRemove && (
            <button
              onClick={item.onDropIndexClick(item.index)}
              style={{ background: "none", border: "none", cursor: "pointer" }}
              aria-label="Remove"
            >
              ×
            </button>
          )}
        </span>
      ))}
      {canAdd && (
        <button onClick={onAddClick} style={{ borderRadius: 12 }}>
          + Add
        </button>
      )}
    </div>
  );
};
```

Apply this template only to the inner array by scoping it via `uiSchema`:

```json
{
  "contacts": {
    "items": {
      "emails": {
        "ui:ArrayFieldTemplate": "tagArray"
      }
    }
  }
}
```

Or register it globally when the schema pattern is detected during generation.

---

## Extension Point Summary

| Extension Point | Registered Via | Scope |
|---|---|---|
| Widget | `widgets` prop on Form | Single input field |
| Field | `fields` prop on Form | Single schema property (any type) |
| FieldTemplate | `templates.FieldTemplate` | Every field's wrapper (label, error, help) |
| ObjectFieldTemplate | `templates.ObjectFieldTemplate` | Every object-type schema |
| ArrayFieldTemplate | `templates.ArrayFieldTemplate` | Every array-type schema |
| TitleFieldTemplate | `templates.TitleFieldTemplate` | Every title rendering |
| DescriptionFieldTemplate | `templates.DescriptionFieldTemplate` | Every description rendering |
| customValidate | `customValidate` prop on Form | Cross-field form-level validation |
| extraErrors | `extraErrors` prop on Form | Server-side / async validation errors |
