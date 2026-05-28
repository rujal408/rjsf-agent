# RJSF v5 Type Contracts

Canonical type reference for code generation. Every generated file MUST conform to these signatures. Violating any contract listed here will cause TypeScript build errors.

**Target version:** `@rjsf/utils@^5.x`, `@rjsf/core@^5.x`, `@rjsf/validator-ajv8@^5.x`

---

## 1. The Three Generic Parameters

RJSF v5 uses three type parameters consistently across ALL component props, utility types, and the Form component:

```typescript
T = any              // Form data shape (your FormData interface)
S extends StrictRJSFSchema = RJSFSchema  // JSON Schema type
F extends FormContextType = any          // FormContext shape
```

**Rule:** When generating custom widgets, fields, or templates, ALWAYS include at least `T` in the generic. Including all three (`T, S, F`) is preferred for full type safety.

```typescript
// ✅ CORRECT — full generics
const MyWidget: React.FC<WidgetProps<MyFormData, RJSFSchema, MyFormContext>> = (props) => { ... };

// ✅ ACCEPTABLE — T only (S and F default safely)
const MyWidget: React.FC<WidgetProps<MyFormData>> = (props) => { ... };

// ❌ WRONG — no generics, value is `any`, no type checking
const MyWidget: React.FC<WidgetProps> = (props) => { ... };
```

---

## 2. Required Imports

All type imports come from `@rjsf/utils`. Never import types from `@rjsf/core` or theme packages.

```typescript
// Schema & Form types
import type {
  RJSFSchema,
  StrictRJSFSchema,
  UiSchema,
  FormContextType,
} from '@rjsf/utils';

// Component prop types
import type {
  WidgetProps,
  FieldProps,
  FieldTemplateProps,
  ObjectFieldTemplateProps,
  ArrayFieldTemplateProps,
  ArrayFieldTemplateItemType,
  TitleFieldProps,
  DescriptionFieldProps,
  BaseInputTemplateProps,
  SubmitButtonProps,
  IconButtonProps,
} from '@rjsf/utils';

// Validation types
import type {
  CustomValidator,
  ErrorTransformer,
  ErrorSchema,
  RJSFValidationError,
  ValidationData,
  FormValidation,
} from '@rjsf/utils';

// Registry types
import type {
  Registry,
  RegistryWidgetsType,
  RegistryFieldsType,
  TemplatesType,
} from '@rjsf/utils';

// ID & path types
import type {
  IdSchema,
  PathSchema,
} from '@rjsf/utils';

// Form event types
import type {
  IChangeEvent,
} from '@rjsf/utils';
```

---

## 3. Form Component Props

The `<Form>` component accepts these props. `schema` and `validator` are **required**.

```typescript
import type { FormProps } from '@rjsf/core';

// FormProps<T, S, F> — key props:
interface FormProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  // REQUIRED
  schema: S;
  validator: ValidatorType<T, S, F>;

  // Optional — form data & state
  formData?: T;
  uiSchema?: UiSchema<T, S, F>;
  formContext?: F;
  extraErrors?: ErrorSchema<T>;
  extraErrorsBlockSubmit?: boolean;

  // Optional — behavior
  liveValidate?: boolean;
  noHtml5Validate?: boolean;
  omitExtraData?: boolean;
  liveOmit?: boolean;
  showErrorList?: false | 'top' | 'bottom';
  focusOnFirstError?: boolean | ((error: RJSFValidationError) => void);

  // Optional — custom components
  widgets?: RegistryWidgetsType<T, S, F>;
  fields?: RegistryFieldsType<T, S, F>;
  templates?: Partial<TemplatesType<T, S, F>>;

  // Optional — callbacks
  onChange?: (data: IChangeEvent<T, S, F>, id?: string) => void;
  onSubmit?: (data: IChangeEvent<T, S, F>, event: React.FormEvent<any>) => void;
  onError?: (errors: RJSFValidationError[]) => void;
  onBlur?: (id: string, value: any) => void;
  onFocus?: (id: string, value: any) => void;

  // Optional — validation
  customValidate?: CustomValidator<T, S, F>;
  transformErrors?: ErrorTransformer<T, S, F>;

  // Optional — experimental
  experimental_defaultFormStateBehavior?: Experimental_DefaultFormStateBehavior;
}
```

### Generated Form component — correct pattern:

```tsx
// ✅ CORRECT — typed Form with generic parameter
import Form from '@rjsf/mui';
import type { IChangeEvent } from '@rjsf/utils';

export function PatientIntakeForm({ formData, onSubmit }: PatientIntakeFormProps) {
  const handleSubmit = (data: IChangeEvent<PatientIntakeFormData>) => {
    if (data.formData) {
      onSubmit(data.formData);
    }
  };

  return (
    <Form<PatientIntakeFormData>
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      formData={formData}
      onSubmit={handleSubmit}
    />
  );
}
```

```tsx
// ❌ WRONG — untyped destructuring, data.formData is `any`
const handleSubmit = ({ formData: data }: { formData: PatientIntakeFormData }) => {
  onSubmit(data);
};
```

---

## 4. Widget Props Contract

```typescript
interface WidgetProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  id: string;                    // REQUIRED
  name: string;                  // REQUIRED
  schema: S;                     // REQUIRED
  value: any;                    // REQUIRED (may be undefined)
  options: UIOptionsType<T, S, F> & { enumOptions?: EnumOptionsType<S>[] };
  onChange: (value: any, es?: ErrorSchema<T>, id?: string) => void;  // REQUIRED
  onBlur: (id: string, value: any) => void;   // REQUIRED
  onFocus: (id: string, value: any) => void;  // REQUIRED
  registry: Registry<T, S, F>;               // REQUIRED
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autofocus?: boolean;
  rawErrors?: string[];
  formContext?: F;
  uiSchema?: UiSchema<T, S, F>;
}
```

### Generated widget — correct pattern:

```tsx
import type { WidgetProps, RJSFSchema, FormContextType } from '@rjsf/utils';
import type { PatientIntakeFormData } from '../types';

export function PhoneWidget(props: WidgetProps<PatientIntakeFormData>) {
  const { id, value, onChange, onBlur, onFocus, disabled, readonly, required, rawErrors } = props;
  // ...
}
```

---

## 5. Field Props Contract

```typescript
interface FieldProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  schema: S;                              // REQUIRED
  uiSchema?: UiSchema<T, S, F>;
  idSchema: IdSchema<T>;                  // REQUIRED
  formData?: T;
  errorSchema?: ErrorSchema<T>;
  onChange: (newFormData: T | undefined, es?: ErrorSchema<T>, id?: string) => any;  // REQUIRED
  onBlur: (id: string, value: any) => void;   // REQUIRED
  onFocus: (id: string, value: any) => void;  // REQUIRED
  registry: Registry<T, S, F>;                // REQUIRED
  name: string;                               // REQUIRED
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  autofocus?: boolean;
  formContext?: F;
}
```

### Generated field — correct pattern:

```tsx
import type { FieldProps } from '@rjsf/utils';

interface DateRange {
  start: string;
  end: string;
}

export function DateRangeField(props: FieldProps<DateRange>) {
  const { idSchema, formData = { start: '', end: '' }, onChange, errorSchema } = props;
  // ...
}
```

---

## 6. Template Props Contracts

### FieldTemplateProps

```typescript
interface FieldTemplateProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  id: string;                        // REQUIRED
  label: string;                     // REQUIRED
  children: React.ReactElement;      // REQUIRED — the actual input
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
  onKeyChange?: (value: string) => void;
  onDropPropertyClick?: (key: string) => () => void;
}
```

### ObjectFieldTemplateProps

```typescript
interface ObjectFieldTemplateProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  title: string;                                         // REQUIRED
  description?: string;
  properties: ObjectFieldTemplatePropertyType[];         // REQUIRED
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  uiSchema?: UiSchema<T, S, F>;
  schema: S;                                             // REQUIRED
  formData?: T;
  formContext?: F;
  idSchema: IdSchema<T>;                                 // REQUIRED
  registry: Registry<T, S, F>;                           // REQUIRED
  onAddClick: (schema: S) => () => void;                 // REQUIRED
}

// Property type within ObjectFieldTemplate
interface ObjectFieldTemplatePropertyType {
  content: React.ReactElement;
  name: string;
  disabled: boolean;
  readonly: boolean;
  hidden: boolean;
}
```

### ArrayFieldTemplateProps

```typescript
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

// Each array item
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

### TitleFieldProps and DescriptionFieldProps

```typescript
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

### SubmitButtonProps

```typescript
interface SubmitButtonProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  uiSchema?: UiSchema<T, S, F>;
  registry: Registry<T, S, F>;
}
```

---

## 7. Validation Type Contracts

### CustomValidator

```typescript
type CustomValidator<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> = (
  formData: T | undefined,
  errors: FormValidation<T>,
  uiSchema?: UiSchema<T, S, F>
) => FormValidation<T>;
```

**The `errors` parameter is `FormValidation<T>`**, NOT `ErrorSchema`. `FormValidation<T>` is a proxy object where each property has an `.addError(message: string)` method.

```typescript
// ✅ CORRECT
const validate: CustomValidator<MyFormData> = (formData, errors) => {
  if (formData?.endDate && formData?.startDate && formData.endDate <= formData.startDate) {
    errors.endDate!.addError('End date must be after start date');
  }
  return errors;
};

// ❌ WRONG — using ErrorSchema methods (no .addError)
const validate = (formData: any, errors: ErrorSchema) => {
  errors.endDate.__errors.push('...');  // This is NOT how FormValidation works
};
```

### ErrorTransformer

```typescript
type ErrorTransformer<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> = (
  errors: RJSFValidationError[],
  uiSchema?: UiSchema<T, S, F>
) => RJSFValidationError[];
```

### ErrorSchema (for extraErrors prop)

```typescript
type ErrorSchema<T = any> = {
  __errors?: string[];
} & {
  [key in keyof T]?: ErrorSchema<T[key]>;
};
```

### RJSFValidationError

```typescript
interface RJSFValidationError {
  name?: string;
  message?: string;
  params?: any;
  property?: string;      // e.g., ".firstName" or "['address']['city']"
  schemaPath?: string;
  stack: string;
}
```

---

## 8. IChangeEvent (onSubmit / onChange callback)

```typescript
interface IChangeEvent<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> {
  formData?: T;
  schema: S;
  uiSchema: UiSchema<T, S, F>;
  idSchema: IdSchema<T>;
  edit: boolean;
  errors: RJSFValidationError[];
  errorSchema: ErrorSchema<T>;
  status?: 'submitted';  // Only present in onSubmit
}
```

**Critical:** `formData` is optional (`T | undefined`) in `IChangeEvent`. Always null-check before using.

```typescript
// ✅ CORRECT
const handleSubmit = (data: IChangeEvent<MyFormData>) => {
  if (data.formData) {
    onSubmit(data.formData);
  }
};

// ❌ WRONG — assumes formData is always present
const handleSubmit = ({ formData }: { formData: MyFormData }) => {
  onSubmit(formData);  // formData could be undefined!
};
```

---

## 9. Schema ↔ TypeScript Type Mapping

When generating `types.ts`, each JSON Schema type MUST map to the correct TypeScript type:

| JSON Schema `type` | JSON Schema `format` | TypeScript Type |
|---|---|---|
| `"string"` | — | `string` |
| `"string"` | `"email"` | `string` |
| `"string"` | `"date"` | `string` |
| `"string"` | `"date-time"` | `string` |
| `"string"` | `"uri"` | `string` |
| `"string"` | `"data-url"` | `string` |
| `"string"` with `enum` | — | string union: `'opt1' \| 'opt2'` |
| `"number"` | — | `number` |
| `"integer"` | — | `number` |
| `"boolean"` | — | `boolean` |
| `"array"` | `items: { enum }` | `string[]` (or the enum union array) |
| `"array"` | `items: { type: 'object' }` | `ItemInterface[]` |
| `"object"` | — | dedicated interface |
| `"null"` | — | `null` |

### Conditional fields → optional properties

Fields that appear only inside `if/then/else` or `dependencies` blocks MUST be marked optional (`?`) in the TypeScript interface, because they may not be present in the form data depending on the condition.

```typescript
// Schema has: if employmentType === 'employed' then show companyName (required)
// TypeScript MUST be:
interface FormData {
  employmentType: 'employed' | 'self-employed' | 'unemployed';
  companyName?: string;   // Optional in TS — conditionally required in schema
  businessName?: string;  // Optional in TS — conditionally required in schema
}
```

### Array items → dedicated interface

Every `items: { type: 'object', properties: {...} }` MUST have a corresponding TypeScript interface:

```typescript
// Schema: contacts: { type: 'array', items: { type: 'object', properties: { firstName, email } } }
// types.ts MUST include:
export interface Contact {
  firstName: string;
  email: string;
  phone?: string;
}

export interface FormData {
  contacts: Contact[];
}
```

---

## 10. types.ts Generation Rules

1. **Derive from schema, not independently.** Every property in `types.ts` must correspond 1:1 to a property in `schema.ts`. Never add properties that don't exist in the schema or omit properties that do.

2. **Use `readonly` for computed fields.** If a field has `readOnly: true` in the schema, mark it `readonly` in the TypeScript interface.

3. **Export the root interface and all sub-interfaces.** Don't use inline types for nested objects.

4. **Match `required` arrays.** Fields listed in schema `required` arrays are non-optional in the interface. Fields NOT in `required` get `?`.

5. **Enum fields → string literal unions.** Never use plain `string` when the schema has `enum`.

```typescript
// ✅ CORRECT
export interface PatientIntakeFormData {
  firstName: string;                                    // required in schema
  lastName: string;                                     // required in schema
  email?: string;                                       // not required
  biologicalSex: 'male' | 'female' | 'intersex' | 'prefer_not_to_say';  // enum
  insurance?: InsuranceInfo;                             // conditional section
}

export interface InsuranceInfo {
  provider: string;
  memberId: string;
  groupNumber?: string;
}

// ❌ WRONG
export interface PatientIntakeFormData {
  firstName: string;
  biologicalSex: string;        // Should be string union from enum
  insurance: InsuranceInfo;     // Should be optional (conditional)
}
```

---

## 11. UiSchema Type Contract

```typescript
import type { UiSchema } from '@rjsf/utils';
import type { MyFormData } from './types';

// ✅ CORRECT — typed UiSchema
export const uiSchema: UiSchema<MyFormData> = {
  'ui:order': ['firstName', 'lastName', '*'],
  firstName: { 'ui:autofocus': true },
};

// ❌ WRONG — untyped, allows invalid field keys
export const uiSchema: UiSchema = { ... };
```

---

## 12. Validator Import Contracts

```typescript
// AJV8 (default, recommended)
import validator from '@rjsf/validator-ajv8';

// AJV8 with custom options
import { customizeValidator } from '@rjsf/validator-ajv8';
const validator = customizeValidator({
  ajvOptionsOverrides: { /* AJV options */ },
  ajvFormatOptions: { /* format options */ },
});

// Yup (alternative)
import { customizeValidator } from '@rjsf/validator-yup';
const validator = customizeValidator();
```

---

## 13. Theme-Specific Exports

All themes export the same shape. The Form component is the default export.

```typescript
// Any theme — correct import pattern
import Form from '@rjsf/mui';          // or @rjsf/core, @rjsf/antd, @rjsf/bootstrap-4
import { Theme } from '@rjsf/mui';     // ThemeProps object (rarely needed)
import { Templates } from '@rjsf/mui'; // Theme's default templates
import { Widgets } from '@rjsf/mui';   // Theme's default widgets
```

---

## 14. Strict Type Checklist (for Phase 4 code generation)

Before writing any generated file, verify:

- [ ] `schema.ts` exports `const schema: RJSFSchema`
- [ ] `uiSchema.ts` exports `const uiSchema: UiSchema<FormDataType>`
- [ ] `types.ts` interfaces match schema properties 1:1 (type, optionality, enums)
- [ ] `index.tsx` uses `Form<FormDataType>` generic on the JSX element
- [ ] `index.tsx` uses `IChangeEvent<FormDataType>` for onSubmit/onChange handlers
- [ ] All custom widgets use `WidgetProps<FormDataType>` (not bare `WidgetProps`)
- [ ] All custom fields use `FieldProps<FieldDataType>` with the correct sub-type
- [ ] All custom templates use their respective `*Props<FormDataType>` with generics
- [ ] `CustomValidator<FormDataType>` is used (not bare `CustomValidator`) when present
- [ ] `ErrorSchema<FormDataType>` is used for extraErrors state (not `Record<string, unknown>`)
- [ ] `formData` from `IChangeEvent` is null-checked before use
- [ ] Conditional fields are marked optional (`?`) in TypeScript interfaces
- [ ] Array item objects have dedicated exported interfaces
- [ ] Enum fields use string literal union types, not bare `string`
- [ ] No `as` type assertions except where RJSF's own types require them (e.g., `formRef.current`)
