# RJSF Customization API Reference

> Practical examples for custom widget, field, and template implementation. For TypeScript rules, see `references/typescript-pitfalls.md`.

## 1. Custom Widget — WidgetProps

A custom widget replaces a single HTML input control. It receives props from RJSF and must call `onChange` to update form state.

### Full TypeScript Interface

**IMPORTANT:** Always specify at least the `T` generic parameter when using `WidgetProps<T>`. Using bare `WidgetProps` without generics creates implicit `any` types and bypasses type checking.

```typescript
import type { WidgetProps, RJSFSchema, StrictRJSFSchema, FormContextType } from "@rjsf/utils";

// Full signature (T = form data type, S = schema type, F = form context type):
interface WidgetProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  id: string;                  // Unique field ID (e.g. "root_phoneNumber")
  name: string;                // Field name attribute
  value: any;                  // Current field value (may be undefined)
  required?: boolean;          // Whether the field is required
  disabled?: boolean;          // Whether the field is disabled
  readonly?: boolean;          // Whether the field is read-only
  autofocus?: boolean;         // Whether this field should autofocus
  placeholder?: string;        // Placeholder text from uiSchema["ui:placeholder"]
  label: string;               // Human-readable field label
  schema: S;                   // JSON Schema for this field
  uiSchema?: UiSchema<T, S, F>; // uiSchema for this field
  options: UIOptionsType<T, S, F> & { enumOptions?: EnumOptionsType<S>[] };
  formContext?: F;             // Typed context passed to the Form
  registry: Registry<T, S, F>; // RJSF registry (widgets, fields, templates, rootSchema)
  onChange: (value: any, es?: ErrorSchema<T>, id?: string) => void;
  onBlur: (id: string, value: any) => void;
  onFocus: (id: string, value: any) => void;
  rawErrors?: string[];        // Validation errors for this field
}
```

### Minimal Working Example — PhoneWidget

```tsx
import React from "react";
import type { WidgetProps } from "@rjsf/utils";

const COUNTRY_CODES = [
  { code: "+1", label: "US/CA" },
  { code: "+44", label: "UK" },
  { code: "+91", label: "IN" },
  { code: "+61", label: "AU" },
];

// In generated code, always use WidgetProps<YourFormData> instead of bare WidgetProps.
// Example: export function PhoneWidget(props: WidgetProps<PatientIntakeFormData>) { ... }
export function PhoneWidget({
  id,
  value,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
  onFocus,
  rawErrors,
}: WidgetProps) {
  // value is stored as "countryCode|localNumber", e.g. "+1|4155552671"
  const [countryCode, localNumber] = value
    ? (value as string).split("|")
    : ["+1", ""];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${e.target.value}|${localNumber}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${countryCode}|${e.target.value}`);
  };

  const hasError = rawErrors && rawErrors.length > 0;

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select
        value={countryCode}
        disabled={disabled || readonly}
        onChange={handleCountryChange}
        style={{ width: 90 }}
      >
        {COUNTRY_CODES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label} {code}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        value={localNumber}
        required={required}
        disabled={disabled || readonly}
        placeholder="e.g. 4155552671"
        onChange={handleNumberChange}
        onBlur={(e) => onBlur(id, e.target.value)}
        onFocus={(e) => onFocus(id, e.target.value)}
        style={{
          flex: 1,
          borderColor: hasError ? "red" : undefined,
        }}
      />
      {hasError && (
        <ul style={{ color: "red", margin: 0 }}>
          {rawErrors!.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Registering a Custom Widget

Pass a `widgets` map to the `<Form>` component. Keys must match the value used in `uiSchema["ui:widget"]`.

```tsx
import Form from "@rjsf/core"; // or @rjsf/mui, @rjsf/antd, etc.
import validator from "@rjsf/validator-ajv8";
import PhoneWidget from "./PhoneWidget";

const schema = {
  type: "object",
  properties: {
    phoneNumber: { type: "string", title: "Phone Number" },
  },
};

const uiSchema = {
  phoneNumber: { "ui:widget": "phone" },
};

<Form
  schema={schema}
  uiSchema={uiSchema}
  validator={validator}
  widgets={{ phone: PhoneWidget }}
  onSubmit={({ formData }) => console.log(formData)}
/>;
```

---

## 2. Custom Field — FieldProps

A custom field controls a group of related inputs that map to a single schema property. Use when you need multiple HTML inputs for one logical value or when you need cross-field coordination within a sub-object.

### Full TypeScript Interface

```typescript
import type { FieldProps, RJSFSchema, StrictRJSFSchema, FormContextType } from "@rjsf/utils";

// Full signature with three generic parameters:
interface FieldProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  schema: S;                              // REQUIRED — JSON Schema for this field
  uiSchema?: UiSchema<T, S, F>;          // uiSchema for this field
  idSchema: IdSchema<T>;                  // REQUIRED — Nested ID schema
  formData?: T;                           // Current value of this field
  errorSchema?: ErrorSchema<T>;           // Nested error schema for sub-fields
  onChange: (newFormData: T | undefined, es?: ErrorSchema<T>, id?: string) => any;  // REQUIRED
  onBlur: (id: string, value: any) => void;   // REQUIRED
  onFocus: (id: string, value: any) => void;  // REQUIRED
  registry: Registry<T, S, F>;               // REQUIRED — RJSF registry
  name: string;                               // REQUIRED — Field name
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  autofocus?: boolean;
  formContext?: F;                            // Typed context from Form
}
```

### Minimal Working Example — DateRangeField

Handles `{ start: string; end: string }` and validates end > start.

```tsx
import React from "react";
import { FieldProps } from "@rjsf/utils";

interface DateRange {
  start: string;
  end: string;
}

const DateRangeField: React.FC<FieldProps<DateRange>> = ({
  idSchema,
  formData = {},
  disabled,
  readonly,
  onChange,
  errorSchema,
}) => {
  const { start = "", end = "" } = formData;

  const handleChange = (field: "start" | "end", val: string) => {
    const next = { start, end, [field]: val };
    const errors: Record<string, string[]> = {};

    if (next.start && next.end && next.end <= next.start) {
      errors.end = ["End date must be after start date"];
    }

    onChange(
      next,
      Object.keys(errors).length
        ? { end: { __errors: errors.end } }
        : undefined
    );
  };

  const endError = errorSchema?.end?.__errors;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor={idSchema.start.$id}>Start Date</label>
          <input
            id={idSchema.start.$id}
            type="date"
            value={start}
            disabled={disabled || readonly}
            onChange={(e) => handleChange("start", e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor={idSchema.end.$id}>End Date</label>
          <input
            id={idSchema.end.$id}
            type="date"
            value={end}
            disabled={disabled || readonly}
            style={{ borderColor: endError ? "red" : undefined }}
            onChange={(e) => handleChange("end", e.target.value)}
          />
          {endError && (
            <p style={{ color: "red", margin: 0 }}>{endError[0]}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateRangeField;
```

### Registering a Custom Field

```tsx
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import DateRangeField from "./DateRangeField";

const schema = {
  type: "object",
  properties: {
    eventDates: {
      type: "object",
      title: "Event Dates",
      properties: {
        start: { type: "string", format: "date" },
        end: { type: "string", format: "date" },
      },
    },
  },
};

const uiSchema = {
  eventDates: { "ui:field": "dateRange" },
};

<Form
  schema={schema}
  uiSchema={uiSchema}
  validator={validator}
  fields={{ dateRange: DateRangeField }}
  onSubmit={({ formData }) => console.log(formData)}
/>;
```

---

## 3. Custom Templates

Templates control how RJSF renders the chrome around fields (labels, errors, help text) and how groups of fields are laid out.

### FieldTemplateProps — Wraps a Single Field

```typescript
import type { FieldTemplateProps, RJSFSchema, StrictRJSFSchema, FormContextType } from "@rjsf/utils";

interface FieldTemplateProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  id: string;                        // REQUIRED
  label: string;                     // REQUIRED
  children: React.ReactElement;      // REQUIRED — The actual input element
  schema: S;                         // REQUIRED
  uiSchema?: UiSchema<T, S, F>;
  registry: Registry<T, S, F>;      // REQUIRED
  readonly: boolean;                 // REQUIRED
  disabled: boolean;                 // REQUIRED
  classNames?: string;
  style?: React.CSSProperties;
  description?: React.ReactElement;
  rawDescription?: string;
  errors?: React.ReactElement;
  rawErrors?: string[];
  help?: React.ReactElement;
  rawHelp?: string;
  hidden?: boolean;
  required?: boolean;
  displayLabel?: boolean;
  formContext?: F;
  onKeyChange?: (value: string) => void;
  onDropPropertyClick?: (key: string) => () => void;
}
```

### ObjectFieldTemplateProps — Wraps an Object/Section

```typescript
import type { ObjectFieldTemplateProps, RJSFSchema, StrictRJSFSchema, FormContextType } from "@rjsf/utils";

interface ObjectFieldTemplateProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  title: string;                                        // REQUIRED
  description?: string;
  properties: ObjectFieldTemplatePropertyType[];        // REQUIRED
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  uiSchema?: UiSchema<T, S, F>;
  schema: S;                                            // REQUIRED
  formData?: T;
  formContext?: F;
  idSchema: IdSchema<T>;                                // REQUIRED
  registry: Registry<T, S, F>;                          // REQUIRED
  onAddClick: (schema: S) => () => void;                // REQUIRED
}

interface ObjectFieldTemplatePropertyType {
  content: React.ReactElement;
  name: string;
  disabled: boolean;
  readonly: boolean;
  hidden: boolean;
}
```

### ArrayFieldTemplateProps — Wraps an Array

```typescript
import type { ArrayFieldTemplateProps, ArrayFieldTemplateItemType, RJSFSchema, StrictRJSFSchema, FormContextType } from "@rjsf/utils";

interface ArrayFieldTemplateProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  title: string;                                          // REQUIRED
  description?: string;
  items: ArrayFieldTemplateItemType<T, S, F>[];           // REQUIRED
  canAdd?: boolean;
  onAddClick: (event?: any) => void;                      // REQUIRED
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  uiSchema?: UiSchema<T, S, F>;
  schema: S;                                              // REQUIRED
  formData?: T[];
  formContext?: F;
  idSchema: IdSchema<T>;                                  // REQUIRED
  registry: Registry<T, S, F>;                            // REQUIRED
}

// Each array item — note: hasCopy and onCopyIndexClick added in RJSF v5
interface ArrayFieldTemplateItemType<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  children: React.ReactElement;
  index: number;
  key: string;
  hasMoveUp: boolean;
  hasMoveDown: boolean;
  hasRemove: boolean;
  hasCopy: boolean;
  disabled: boolean;
  readonly: boolean;
  onReorderClick: (index: number, newIndex: number) => (event?: any) => void;
  onDropIndexClick: (index: number) => (event?: any) => void;
  onCopyIndexClick: (index: number) => (event?: any) => void;
  uiSchema: UiSchema<T, S, F>;
  registry: Registry<T, S, F>;
}
```

### TitleFieldTemplateProps and DescriptionFieldTemplateProps

```typescript
import type { TitleFieldProps, DescriptionFieldProps } from "@rjsf/utils";

interface TitleFieldProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  id: string;
  title: string;
  required?: boolean;
  schema: S;
  uiSchema?: UiSchema<T, S, F>;
  registry: Registry<T, S, F>;
}

interface DescriptionFieldProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  id: string;
  description: string | React.ReactElement;
  schema: S;
  uiSchema?: UiSchema<T, S, F>;
  registry: Registry<T, S, F>;
}
```

### Registering All Templates via the templates Prop

```tsx
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

// Example: Two-column ObjectFieldTemplate
const TwoColumnObjectTemplate: React.FC<ObjectFieldTemplateProps> = ({
  title,
  description,
  properties,
}) => (
  <fieldset>
    {title && <legend>{title}</legend>}
    {description && <p>{description}</p>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {properties.map((prop) =>
        prop.hidden ? null : (
          <div key={prop.name}>{prop.content}</div>
        )
      )}
    </div>
  </fieldset>
);

// Example: Custom ArrayFieldTemplate with styled add/remove
const CustomArrayTemplate: React.FC<ArrayFieldTemplateProps> = ({
  title,
  items,
  canAdd,
  onAddClick,
}) => (
  <div>
    {title && <h4>{title}</h4>}
    {items.map((item) => (
      <div key={item.key} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>{item.children}</div>
        {item.hasMoveUp && (
          <button onClick={item.onReorderClick(item.index, item.index - 1)}>
            Up
          </button>
        )}
        {item.hasMoveDown && (
          <button onClick={item.onReorderClick(item.index, item.index + 1)}>
            Down
          </button>
        )}
        {item.hasRemove && (
          <button onClick={item.onDropIndexClick(item.index)}>Remove</button>
        )}
      </div>
    ))}
    {canAdd && <button onClick={onAddClick}>+ Add Item</button>}
  </div>
);

// Example: Custom TitleFieldTemplate
const CustomTitleTemplate: React.FC<TitleFieldTemplateProps> = ({
  title,
  required,
}) => (
  <h3 style={{ borderBottom: "2px solid #4f46e5", paddingBottom: 4 }}>
    {title}
    {required && <span style={{ color: "red", marginLeft: 4 }}>*</span>}
  </h3>
);

// Wire all templates to Form
<Form
  schema={schema}
  uiSchema={uiSchema}
  validator={validator}
  templates={{
    FieldTemplate: MyFieldTemplate,
    ObjectFieldTemplate: TwoColumnObjectTemplate,
    ArrayFieldTemplate: CustomArrayTemplate,
    TitleFieldTemplate: CustomTitleTemplate,
    DescriptionFieldTemplate: MyDescriptionTemplate,
    // ButtonTemplates: { SubmitButton: MySubmitButton }
  }}
/>;
```

---

## 4. Per-Theme Import Differences

Custom widgets, fields, and templates are **theme-agnostic** — you write them once and use them with any theme. Only the `Form` component and validator import paths change.

| Theme Package | Form Import | Validator Import |
|---|---|---|
| `@rjsf/core` | `import Form from "@rjsf/core"` | `import validator from "@rjsf/validator-ajv8"` |
| `@rjsf/mui` | `import Form from "@rjsf/mui"` | `import validator from "@rjsf/validator-ajv8"` |
| `@rjsf/antd` | `import Form from "@rjsf/antd"` | `import validator from "@rjsf/validator-ajv8"` |
| `@rjsf/bootstrap` | `import Form from "@rjsf/bootstrap"` | `import validator from "@rjsf/validator-ajv8"` |

Note: `@rjsf/validator-ajv8` is the recommended validator for all themes. The older `@rjsf/validator-ajv6` is deprecated.

All type imports (`WidgetProps`, `FieldProps`, `FieldTemplateProps`, etc.) always come from `@rjsf/utils`, regardless of theme:

```typescript
import { WidgetProps, FieldProps, FieldTemplateProps } from "@rjsf/utils";
```

---

## 5. customValidate — Cross-Field Validation

Use `customValidate` for validation rules that span multiple fields (e.g., password confirmation, date range). It runs after JSON Schema validation.

### Complete Working Example

```tsx
import type { CustomValidator, FormValidation } from "@rjsf/utils";

interface RegistrationFormData {
  password: string;
  confirmPassword: string;
  startDate: string;
  endDate: string;
}

// CustomValidator<T> signature: (formData: T | undefined, errors: FormValidation<T>, uiSchema?) => FormValidation<T>
// The `errors` parameter is FormValidation<T>, NOT ErrorSchema. It has .addError() methods.
const customValidate: CustomValidator<RegistrationFormData> = (
  formData,
  errors
) => {
  // Password confirmation check
  if (
    formData.password &&
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword
  ) {
    errors.confirmPassword!.addError("Passwords do not match");
  }

  // Date range check
  if (
    formData.startDate &&
    formData.endDate &&
    formData.endDate <= formData.startDate
  ) {
    errors.endDate!.addError("End date must be after start date");
  }

  return errors;
};

// Wire to Form via customValidate prop
<Form
  schema={schema}
  uiSchema={uiSchema}
  validator={validator}
  customValidate={customValidate}
  onSubmit={({ formData }) => console.log(formData)}
/>;
```

### How It Works

- `errors` is a nested proxy object mirroring `formData`'s structure.
- Call `errors.<fieldName>.addError("message")` to attach an error.
- For nested fields: `errors.address!.city!.addError("Invalid city")`.
- Return `errors` at the end — this is required.
- `customValidate` runs on every submit and on every change if `liveValidate` is `true`.

---

## 6. Server-Side Error Mapping

Map backend validation errors (returned as a flat `Record<string, string>`) to RJSF's `ErrorSchema` format and pass them via the `extraErrors` prop.

### Complete handleServerErrors Function

```tsx
import { useState } from "react";
import { ErrorSchema } from "@rjsf/utils";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

/**
 * Converts a flat dot-notation error map to an RJSF ErrorSchema.
 *
 * Input:  { "address.city": "Invalid city", "email": "Already taken" }
 * Output: { address: { city: { __errors: ["Invalid city"] } }, email: { __errors: ["Already taken"] } }
 */
function mapServerErrors(
  serverErrors: Record<string, string>
): ErrorSchema {
  const errorSchema: ErrorSchema = {};

  for (const [path, message] of Object.entries(serverErrors)) {
    const parts = path.split(".");
    let node: any = errorSchema;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) {
        node[parts[i]] = {};
      }
      node = node[parts[i]];
    }

    const lastKey = parts[parts.length - 1];
    if (!node[lastKey]) {
      node[lastKey] = { __errors: [] };
    }
    (node[lastKey].__errors as string[]).push(message);
  }

  return errorSchema;
}

// Component usage with useState<ErrorSchema> pattern
const MyForm: React.FC = () => {
  const [extraErrors, setExtraErrors] = useState<ErrorSchema>({});

  const handleSubmit = async ({ formData }: { formData: any }) => {
    try {
      await submitToServer(formData);
    } catch (serverResponse: any) {
      // serverResponse.errors is Record<string, string>
      // e.g. { "email": "Already registered", "address.city": "Unknown city" }
      const mapped = mapServerErrors(serverResponse.errors);
      setExtraErrors(mapped);
    }
  };

  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      extraErrors={extraErrors}
      onSubmit={handleSubmit}
    />
  );
};
```

### extraErrors Behavior

- `extraErrors` are displayed alongside JSON Schema validation errors.
- They are cleared automatically on the next validation cycle when fields change, if `liveValidate` is enabled.
- For array items, use numeric keys: `{ contacts: { 0: { email: { __errors: ["Invalid"] } } } }`.
- If the server returns a single top-level error message, use `{ "": { __errors: ["Server error message"] } }` and render it separately, or display it outside the form.
