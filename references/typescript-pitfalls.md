# RJSF TypeScript Pitfalls & Fixes

Common TypeScript build errors and runtime crashes in generated RJSF code. Phase 4 (rjsf-execute) MUST avoid every pattern in the "Bad" column.

---

## 0a. CSS Overrides Breaking MUI/Antd/Bootstrap Inputs (CRITICAL — Fields Unclickable)

When using `@rjsf/mui`, `@rjsf/antd`, or `@rjsf/bootstrap`, raw CSS selectors targeting `input`, `select`, `textarea` inside `.rjsf` will **break field interactions** (can't click, can't type, selects don't open).

```css
/* ❌ BAD — breaks MUI/Antd/Bootstrap: raw element selectors override styled wrappers */
.rjsf input { padding: 10px; border: 1px solid #ccc; border-radius: 8px; }
.rjsf select { appearance: none; background: #fafafa; }
.rjsf input:focus { outline: none; box-shadow: 0 0 0 3px blue; }

/* ✅ GOOD for @rjsf/core (renders plain HTML elements) */
.rjsf input:not([type="checkbox"]):not([type="radio"]) { padding: 10px; }

/* ✅ GOOD for @rjsf/mui — use MUI class selectors only */
.rjsf .MuiOutlinedInput-root { background-color: #fafbfc; border-radius: 8px; }
.rjsf .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-width: 2px; }
```

**Rule:** The scaffold generator (`generateOverridesCSS`) conditionally generates CSS based on theme. When `isMui`/`isAntd`/`isBootstrap` is true, raw element selectors are SKIPPED entirely. Only MUI/Antd/Bootstrap class selectors are used. When writing custom CSS for MUI forms manually (Step 6/7), NEVER target raw `input`/`select` — always use `.Mui*` class selectors.

---

## 0b. SectionTemplate idSchema.$id (CRITICAL — Runtime Crash)

`ObjectFieldTemplate` is called for EVERY object in the schema including the root. The `idSchema` or `idSchema.$id` can be `undefined` at the root level, causing `Cannot read properties of undefined (reading '$id')`.

```typescript
// ❌ BAD — crashes when idSchema is undefined or $id is missing
const sectionKey = idSchema.$id?.replace('root_', '') ?? '';
if (sectionKey === '' || sectionKey === 'root') { ... }

// ✅ GOOD — defensive access, handles undefined idSchema and root
const rawId = idSchema?.$id ?? 'root';
const sectionKey = rawId.replace('root_', '').replace('root', '');
if (!sectionKey) {
  // Root level — render children without section wrapper
  return <>{properties.map((p) => p.content)}</>;
}
```

**Rule:** ALWAYS use `idSchema?.$id ?? 'root'` (optional chain on `idSchema` itself, not just `$id`). ALWAYS strip both `root_` prefix and bare `root` string. Check `!sectionKey` not `=== 'root'`.

---

## 1. Form onSubmit / onChange Handler Typing

```typescript
// ❌ BAD — TS error: Property 'formData' does not exist on type 'IChangeEvent'
// (Also: formData could be undefined, causing runtime crash)
const handleSubmit = ({ formData: data }: { formData: FormData }) => {
  onSubmit(data);
};

// ❌ BAD — bare destructuring loses type safety
const handleSubmit = ({ formData }: any) => { ... };

// ✅ GOOD — properly typed with null check
import type { IChangeEvent } from '@rjsf/utils';

const handleSubmit = (data: IChangeEvent<MyFormData>) => {
  if (!data.formData) return;
  onSubmit(data.formData);
};

// ✅ GOOD — onChange handler
const handleChange = (data: IChangeEvent<MyFormData>, id?: string) => {
  if (data.formData) setFormData(data.formData);
};
```

**Error prevented:** `TS2339: Property 'formData' does not exist`, runtime `Cannot read property of undefined`

---

## 2. Form Component Generic

```tsx
// ❌ BAD — no generic, formData/onSubmit types default to `any`
<Form
  schema={schema}
  validator={validator}
  onSubmit={handleSubmit}
/>

// ✅ GOOD — generic parameter provides type safety
<Form<MyFormData>
  schema={schema}
  validator={validator}
  onSubmit={handleSubmit}
/>
```

**Error prevented:** `TS2345: Argument of type ... is not assignable to parameter of type`

---

## 3. Schema as const / satisfies for Strict Typing

```typescript
// ❌ BAD — schema.properties types widen to `string`, loses literal types
export const schema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['active', 'inactive'] }
  }
};
// typeof schema.properties.status.enum = string[] (not ['active', 'inactive'])

// ✅ GOOD — use `satisfies RJSFSchema` to keep inference + validate shape
import type { RJSFSchema } from '@rjsf/utils';

export const schema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['active', 'inactive'] }
  },
  required: ['status'],
} satisfies RJSFSchema;

// ✅ ALSO GOOD — explicit type annotation (simpler, always safe)
export const schema: RJSFSchema = { ... };
```

**Error prevented:** `TS2322: Type 'string' is not assignable to type '"active" | "inactive"'` in downstream code

---

## 4. UiSchema Typed with FormData

```typescript
// ❌ BAD — allows invalid field keys that don't exist in schema
import type { UiSchema } from '@rjsf/utils';
export const uiSchema: UiSchema = {
  nonExistentField: { 'ui:widget': 'textarea' }, // No error, but wrong
};

// ✅ GOOD — typed UiSchema catches invalid keys
export const uiSchema: UiSchema<MyFormData> = {
  firstName: { 'ui:autofocus': true },
};
```

**Error prevented:** Silently including UI config for fields that don't exist

---

## 5. extraErrors / ErrorSchema Typing

```typescript
// ❌ BAD — too loose, allows anything
const [serverErrors, setServerErrors] = useState<Record<string, unknown>>({});

// ❌ BAD — ErrorSchema without generic loses nested type safety
const [serverErrors, setServerErrors] = useState<ErrorSchema>({});

// ✅ GOOD — typed ErrorSchema
import type { ErrorSchema } from '@rjsf/utils';
const [serverErrors, setServerErrors] = useState<ErrorSchema<MyFormData>>({});
```

**Error prevented:** `TS2322: Type 'Record<string, unknown>' is not assignable to type 'ErrorSchema<MyFormData>'`

---

## 6. CustomValidator Signature

```typescript
// ❌ BAD — wrong error parameter type (ErrorSchema has no .addError())
import type { ErrorSchema } from '@rjsf/utils';
const validate = (formData: MyFormData, errors: ErrorSchema<MyFormData>) => {
  errors.email.__errors.push('Already taken');  // Wrong API
  return errors;
};

// ❌ BAD — untyped
const validate = (formData: any, errors: any) => { ... };

// ✅ GOOD — CustomValidator<T> with FormValidation<T> errors parameter
import type { CustomValidator } from '@rjsf/utils';

const customValidate: CustomValidator<MyFormData> = (formData, errors) => {
  // `errors` is FormValidation<MyFormData>, has .addError() method
  if (formData?.password !== formData?.confirmPassword) {
    errors.confirmPassword!.addError('Passwords do not match');
  }
  return errors;
};
```

**Error prevented:** `TS2339: Property 'addError' does not exist on type 'ErrorSchema'`, `TS2345: Argument not assignable to CustomValidator`

---

## 7. Custom Widget / Field / Template Props

```typescript
// ❌ BAD — bare props without generic, `value` is `any`, no type checking
import type { WidgetProps } from '@rjsf/utils';
const MyWidget: React.FC<WidgetProps> = (props) => { ... };

// ❌ BAD — React.FC has issues with generics and children
const MyWidget: React.FC<WidgetProps<MyFormData>> = (props) => { ... };

// ✅ GOOD — function declaration with typed props
import type { WidgetProps } from '@rjsf/utils';

export function MyWidget(props: WidgetProps<MyFormData>) {
  const { id, value, onChange, onBlur, onFocus, disabled, readonly, required, rawErrors } = props;
  // ...
}

// ✅ GOOD — Field with sub-data type
import type { FieldProps } from '@rjsf/utils';

interface DateRange { start: string; end: string; }

export function DateRangeField(props: FieldProps<DateRange>) {
  const { formData = { start: '', end: '' }, onChange, idSchema } = props;
  // ...
}

// ✅ GOOD — Template with form data type
import type { ObjectFieldTemplateProps } from '@rjsf/utils';

export function SectionTemplate(props: ObjectFieldTemplateProps<MyFormData>) {
  const { title, properties, idSchema } = props;
  // ...
}
```

**Error prevented:** `TS2339: Property does not exist on type 'any'`, loss of type safety on widget value/formData

---

## 8. Form Ref Typing

```typescript
// ❌ BAD — wrong ref type
const formRef = useRef<HTMLFormElement>(null);

// ❌ BAD — InstanceType without typeof
const formRef = useRef<InstanceType<Form>>(null);

// ✅ GOOD — correct Form ref typing
import Form from '@rjsf/mui';
const formRef = useRef<React.ElementRef<typeof Form>>(null);

// ✅ ALSO GOOD — InstanceType of typeof
const formRef = useRef<InstanceType<typeof Form>>(null);

// Usage: formRef.current?.submit() or formRef.current?.validateForm()
```

**Error prevented:** `TS2339: Property 'validateForm' does not exist on type 'HTMLFormElement'`

---

## 9. Types.ts — Schema ↔ Interface Mismatch

```typescript
// ❌ BAD — interface doesn't match schema
// Schema: { age: { type: 'integer' } }
// Interface:
export interface FormData {
  age: string;  // WRONG — integer maps to number, not string
}

// ❌ BAD — missing optional marker on conditional field
// Schema has if/then/else showing companyName only when employed
export interface FormData {
  companyName: string;  // WRONG — should be optional
}

// ❌ BAD — enum field as plain string
// Schema: { status: { type: 'string', enum: ['active', 'inactive'] } }
export interface FormData {
  status: string;  // WRONG — should be union type
}

// ✅ GOOD — all match schema exactly
export interface FormData {
  age: number;                          // integer/number → number
  companyName?: string;                 // conditional → optional
  status: 'active' | 'inactive';       // enum → string union
  contacts: ContactItem[];             // array of objects → interface[]
}

export interface ContactItem {
  firstName: string;
  email: string;
  phone?: string;  // not in required array → optional
}
```

**Errors prevented:** `TS2322: Type 'number' is not assignable to type 'string'`, runtime type mismatches

---

## 10. Draft Save onChange Handler

```typescript
// ❌ BAD — wrong type for onChange data parameter
const handleChange = ({ formData: data }: { formData: unknown }) => {
  setLocalFormData(data as Partial<FormData>); // unsafe cast
};

// ✅ GOOD — use IChangeEvent
import type { IChangeEvent } from '@rjsf/utils';

const handleChange = (data: IChangeEvent<MyFormData>) => {
  if (data.formData) {
    setLocalFormData(data.formData);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data.formData));
    } catch { /* quota handling */ }
  }
};
```

**Error prevented:** `TS2345: Argument of type 'unknown' is not assignable`

---

## 11. Computed Fields onChange Handler

```typescript
// ❌ BAD — bare destructuring with wrong type
const handleChange = ({ formData: data }: { formData: MyFormData }) => { ... };

// ✅ GOOD — IChangeEvent with null check
const handleChange = (data: IChangeEvent<MyFormData>) => {
  if (!data.formData) return;
  const updated = { ...data.formData };
  if (typeof updated.quantity === 'number' && typeof updated.unitPrice === 'number') {
    updated.total = updated.quantity * updated.unitPrice;
  }
  setCurrentFormData(updated);
};
```

---

## 12. Widget Options Casting

```typescript
// ❌ BAD — unsafe cast that could crash
const opts = options as MaskedWidgetOptions;

// ✅ GOOD — safe extraction with defaults
interface MaskedWidgetOptions {
  mask?: string;
  placeholder?: string;
}

const opts: MaskedWidgetOptions = {
  mask: typeof options.mask === 'string' ? options.mask : undefined,
  placeholder: typeof options.placeholder === 'string' ? options.placeholder : undefined,
};

// ✅ ALSO ACCEPTABLE — cast with explicit interface (when options shape is known)
const opts = options as unknown as MaskedWidgetOptions;
```

---

## 13. Server Error Mapping Function

```typescript
// ❌ BAD — returns untyped object
function mapServerErrors(errors: Record<string, string>): Record<string, any> { ... }

// ✅ GOOD — returns properly typed ErrorSchema
import type { ErrorSchema } from '@rjsf/utils';

function mapServerErrors<T = Record<string, unknown>>(
  serverErrors: Record<string, string>
): ErrorSchema<T> {
  const errorSchema: Record<string, unknown> = {};
  for (const [path, message] of Object.entries(serverErrors)) {
    const parts = path.split('.');
    let node: Record<string, unknown> = errorSchema;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]] as Record<string, unknown>;
    }
    const lastKey = parts[parts.length - 1];
    node[lastKey] = { __errors: [message] };
  }
  return errorSchema as ErrorSchema<T>;
}
```

---

## 14. Multi-Step Wizard — Step Schema Typing

```typescript
// ❌ BAD — loses type safety on step data
const handleChange = ({ formData: stepData }: { formData: unknown }) => {
  setAllData(prev => ({ ...prev, ...(stepData as Partial<FormData>) }));
};

// ✅ GOOD — typed IChangeEvent
const handleChange = (data: IChangeEvent<Partial<MyFormData>>) => {
  if (data.formData) {
    setAllData(prev => ({ ...prev, ...data.formData }));
  }
};
```

---

## 15. Missing Peer Dependencies

These packages MUST be in the project's `package.json` for RJSF to compile:

```json
{
  "dependencies": {
    "@rjsf/core": "^5.x",
    "@rjsf/utils": "^5.x",
    "@rjsf/validator-ajv8": "^5.x",
    "@rjsf/mui": "^5.x"
  }
}
```

**All `@rjsf/*` packages MUST be the same major.minor version.** Mismatched versions cause:
- `TS2345: Argument of type 'ValidatorType<...>' is not assignable`
- `TS2322: Types of property 'registry' are incompatible`

---

## 16. Import Style — `import type` vs `import`

```typescript
// ❌ BAD — value import for types (increases bundle size, can cause circular deps)
import { WidgetProps, FieldProps, RJSFSchema } from '@rjsf/utils';

// ✅ GOOD — type-only import (erased at compile time)
import type { WidgetProps, FieldProps, RJSFSchema } from '@rjsf/utils';

// ✅ Value imports only for things used at runtime
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/mui';
```

**Error prevented:** Bundler warnings, potential circular dependency issues

---

## 17. React Import — Modern JSX Transform

```typescript
// ❌ BAD — React 17+ with Vite/Next.js doesn't need this
import React from 'react';
import React, { useState } from 'react';

// ✅ GOOD — import only what you use as values
import { useState } from 'react';
import { useRef, useCallback } from 'react';

// ✅ GOOD — only import React if you explicitly use React.xxx
import React from 'react';  // Only if using React.createElement, React.Fragment, etc.
```

**Error prevented:** `'React' is defined but never used`, `Module 'react' has no default export` (with `verbatimModuleSyntax`)

---

## 18. Optional Chaining — When To Use and Not Use

```typescript
// ❌ BAD — optional chaining on non-nullable type (TS error: "Object is possibly undefined" won't help)
const name: string = user?.name;  // ERROR if `user` is not nullable

// ❌ BAD — non-null assertion on array index (fails with noUncheckedIndexedAccess)
const key = parts[i]!;

// ✅ GOOD — check before access
const key = parts[i];
if (key === undefined) continue;

// ✅ GOOD — nullish coalescing for defaults
const sectionKey = parts[0] ?? 'root';

// ✅ GOOD — optional chaining only when type IS nullable
const errors = rawErrors?.map((e) => e.message);  // rawErrors is string[] | undefined
```

**Error prevented:** `TS18048: 'x' is possibly 'undefined'`, `TS2532: Object is possibly 'undefined'`, ESLint `no-non-null-assertion`

---

## 19. Array Index Access Safety

```typescript
// ❌ BAD — with noUncheckedIndexedAccess, parts[0] is string | undefined
const first = parts[0].toUpperCase();  // TS error!
const last = parts[parts.length - 1]!;  // Non-null assertion — lint error

// ✅ GOOD — safe access patterns
const first = parts[0];
if (first === undefined) throw new Error('Expected at least one part');
first.toUpperCase();  // OK — narrowed to string

// ✅ GOOD — nullish coalescing
const sectionKey = parts[0] ?? 'default';
```

---

## Quick Reference: JSON Schema → TypeScript Type Map

| JSON Schema | TypeScript | Notes |
|---|---|---|
| `type: 'string'` | `string` | |
| `type: 'string', enum: [...]` | `'a' \| 'b' \| 'c'` | String literal union |
| `type: 'string', format: 'date'` | `string` | ISO date string |
| `type: 'number'` | `number` | |
| `type: 'integer'` | `number` | Same TS type as number |
| `type: 'boolean'` | `boolean` | |
| `type: 'array', items: { type: 'string' }` | `string[]` | |
| `type: 'array', items: { type: 'object' }` | `ItemInterface[]` | Needs dedicated interface |
| `type: 'object'` | `SectionInterface` | Needs dedicated interface |
| `type: 'null'` | `null` | |
| Field in `required` array | Non-optional property | `name: string` |
| Field NOT in `required` | Optional property | `name?: string` |
| Field in `if/then/else` | Always optional | `companyName?: string` |
| `readOnly: true` | `readonly` modifier | `readonly total: number` |
