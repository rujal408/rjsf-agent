# RJSF Schema Patterns Reference

## 1. Field Type → JSON Schema Mapping

| Field Type | JSON Schema `type` | Format / Keyword | Notes |
|---|---|---|---|
| text | `"string"` | — | Default string input |
| email | `"string"` | `"format": "email"` | Browser validates format |
| password | `"string"` | — | Set `"ui:widget": "password"` in uiSchema |
| textarea | `"string"` | — | Set `"ui:widget": "textarea"` in uiSchema |
| date | `"string"` | `"format": "date"` | ISO 8601 (YYYY-MM-DD) |
| datetime | `"string"` | `"format": "date-time"` | ISO 8601 with time |
| number | `"number"` | — | Float; use `minimum`/`maximum` for range |
| integer | `"integer"` | — | Whole number only |
| checkbox (boolean) | `"boolean"` | — | Renders as checkbox by default |
| select (enum) | `"string"` | `"enum": [...]` | Renders as `<select>`. **Prefer `oneOf` below for human-readable labels.** |
| select (oneOf labels) | `"string"` | `"oneOf": [{ "const": ..., "title": ... }]` | **PREFERRED** — labeled select options with human-readable display text |
| radio | `"string"` | `"oneOf": [{ "const": ..., "title": ... }]` | Set `"ui:widget": "radio"` in uiSchema. **Always use `oneOf` with `title` for radio buttons** — raw `enum` shows ugly snake_case values. Add `"ui:options": { "inline": true }` for ≤5 options. |
| multiselect checkboxes | `"array"` | `"items": { "enum": [...] }, "uniqueItems": true` | Set `"ui:widget": "checkboxes"` |
| multiselect dropdown | `"array"` | `"items": { "enum": [...] }, "uniqueItems": true` | Default renders as multi-select |
| file (base64) | `"string"` | `"format": "data-url"` | Single file, encoded as data URL |
| file (multiple) | `"array"` | `"items": { "type": "string", "format": "data-url" }` | Multiple files |
| richtext | `"string"` | — | Use custom widget (e.g., TipTap, Quill) |
| masked input | `"string"` | — | Use custom widget with mask library |

---

## 2. Conditional Fields (if / then / else)

Show or hide fields based on the value of another field. Uses JSON Schema's `if`/`then`/`else` keywords.

```json
{
  "type": "object",
  "properties": {
    "employmentType": {
      "type": "string",
      "title": "Employment Type",
      "enum": ["employed", "self-employed", "unemployed", "student"]
    }
  },
  "required": ["employmentType"],
  "if": {
    "properties": {
      "employmentType": { "const": "employed" }
    }
  },
  "then": {
    "properties": {
      "companyName": {
        "type": "string",
        "title": "Company Name"
      },
      "jobTitle": {
        "type": "string",
        "title": "Job Title"
      },
      "annualSalary": {
        "type": "number",
        "title": "Annual Salary",
        "minimum": 0
      }
    },
    "required": ["companyName", "jobTitle"]
  },
  "else": {
    "if": {
      "properties": {
        "employmentType": { "const": "self-employed" }
      }
    },
    "then": {
      "properties": {
        "businessName": {
          "type": "string",
          "title": "Business Name"
        },
        "industry": {
          "type": "string",
          "title": "Industry"
        }
      },
      "required": ["businessName"]
    }
  }
}
```

Note: RJSF evaluates `if`/`then`/`else` live — fields appear and disappear as the controlling field changes. Fields removed from view have their values cleared from `formData`.

---

## 3. Cascading Select (dependencies + oneOf)

Show a second select whose options depend on the first select's value.

```json
{
  "type": "object",
  "properties": {
    "country": {
      "type": "string",
      "title": "Country",
      "enum": ["CA", "US", "AU"]
    }
  },
  "required": ["country"],
  "dependencies": {
    "country": {
      "oneOf": [
        {
          "properties": {
            "country": { "const": "CA" },
            "province": {
              "type": "string",
              "title": "Province",
              "enum": ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK"]
            }
          },
          "required": ["province"]
        },
        {
          "properties": {
            "country": { "const": "US" },
            "province": {
              "type": "string",
              "title": "State",
              "enum": ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA"]
            }
          },
          "required": ["province"]
        },
        {
          "properties": {
            "country": { "const": "AU" },
            "province": {
              "type": "string",
              "title": "State/Territory",
              "enum": ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]
            }
          },
          "required": ["province"]
        }
      ]
    }
  }
}
```

Note: `dependencies` with `oneOf` is the RJSF v4/v5 pattern for cascading selects. The controlled field (`province`) must be declared only inside the `oneOf` branches, not in the top-level `properties`, to avoid it always rendering.

---

## 4. Array of Objects

Array with item validation and length constraints.

```json
{
  "type": "object",
  "properties": {
    "contacts": {
      "type": "array",
      "title": "Contacts",
      "description": "Add between 1 and 5 contacts",
      "minItems": 1,
      "maxItems": 5,
      "items": {
        "type": "object",
        "title": "Contact",
        "required": ["firstName", "email"],
        "properties": {
          "firstName": {
            "type": "string",
            "title": "First Name",
            "minLength": 1
          },
          "lastName": {
            "type": "string",
            "title": "Last Name"
          },
          "email": {
            "type": "string",
            "title": "Email",
            "format": "email"
          },
          "phone": {
            "type": "string",
            "title": "Phone"
          },
          "isPrimary": {
            "type": "boolean",
            "title": "Primary Contact",
            "default": false
          }
        }
      }
    }
  }
}
```

Corresponding uiSchema for the array:

```json
{
  "contacts": {
    "ui:options": {
      "orderable": true,
      "removable": true,
      "addable": true
    },
    "items": {
      "firstName": { "ui:placeholder": "Enter first name" },
      "email": { "ui:placeholder": "name@example.com" },
      "isPrimary": { "ui:help": "Only one contact should be primary" }
    }
  }
}
```

---

## 5. uiSchema Common Patterns

### Field Ordering

```json
{
  "ui:order": ["firstName", "lastName", "email", "phone", "*"]
}
```

The `"*"` wildcard collects all fields not explicitly listed and places them at that position.

### Placeholder

```json
{
  "email": { "ui:placeholder": "you@example.com" },
  "phone": { "ui:placeholder": "+1 (555) 000-0000" }
}
```

### Autofocus

```json
{
  "firstName": { "ui:autofocus": true }
}
```

Only one field should have `ui:autofocus: true`.

### Textarea Widget

```json
{
  "description": {
    "ui:widget": "textarea",
    "ui:options": {
      "rows": 5
    }
  }
}
```

### Radio Widget

```json
{
  "gender": {
    "ui:widget": "radio",
    "ui:options": {
      "inline": true
    }
  }
}
```

### Disabled Enum Options

```json
{
  "status": {
    "ui:enumDisabled": ["archived", "deleted"]
  }
}
```

### File Upload with Accept Filter

```json
{
  "resume": {
    "ui:widget": "file",
    "ui:options": {
      "accept": ".pdf,.doc,.docx"
    }
  }
}
```

### Nested Section uiSchema

For an object property `address` with sub-fields:

```json
{
  "address": {
    "ui:title": "Mailing Address",
    "ui:description": "Enter your current mailing address",
    "street": { "ui:placeholder": "123 Main St" },
    "city": { "ui:placeholder": "City" },
    "postalCode": { "ui:placeholder": "A1A 1A1" },
    "country": { "ui:widget": "select" }
  }
}
```

---

## 6. Multi-Step Schema Shape

Multi-step (wizard) forms split a single logical schema into an ordered array of steps, each with its own schema and uiSchema slice.

### TypeScript Steps Array Type

```typescript
interface FormStep {
  key: string;        // Unique step identifier, e.g. "personalInfo"
  title: string;      // Step display title, e.g. "Personal Information"
  schema: RJSFSchema; // JSON Schema for fields in this step
  uiSchema: UiSchema; // uiSchema for fields in this step
}

const steps: FormStep[] = [
  {
    key: "personalInfo",
    title: "Personal Information",
    schema: {
      type: "object",
      required: ["firstName", "lastName", "email"],
      properties: {
        firstName: { type: "string", title: "First Name" },
        lastName: { type: "string", title: "Last Name" },
        email: { type: "string", title: "Email", format: "email" },
      },
    },
    uiSchema: {
      firstName: { "ui:autofocus": true },
      email: { "ui:placeholder": "you@example.com" },
    },
  },
  {
    key: "addressInfo",
    title: "Address",
    schema: {
      type: "object",
      required: ["street", "city", "country"],
      properties: {
        street: { type: "string", title: "Street Address" },
        city: { type: "string", title: "City" },
        postalCode: { type: "string", title: "Postal Code" },
        country: { type: "string", title: "Country", enum: ["CA", "US", "AU"] },
      },
    },
    uiSchema: {
      country: { "ui:widget": "select" },
    },
  },
  {
    key: "review",
    title: "Review & Submit",
    schema: {
      type: "object",
      properties: {
        agreeToTerms: {
          type: "boolean",
          title: "I agree to the terms and conditions",
        },
      },
      required: ["agreeToTerms"],
    },
    uiSchema: {},
  },
];
```

### Multi-Step State Pattern

```typescript
interface MultiStepFormState {
  currentStep: number;           // 0-based index into steps array
  formData: Record<string, any>; // Accumulated data from all steps
}

// Merge step data into accumulated formData on each step completion
const handleStepSubmit = ({ formData: stepData }: { formData: any }) => {
  setFormState((prev) => ({
    formData: { ...prev.formData, ...stepData },
    currentStep: prev.currentStep + 1,
  }));
};
```
