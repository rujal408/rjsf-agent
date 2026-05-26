# Edge Cases

Each section covers one edge case: what it is, when you need it, how to tell the agent, what gets generated, and the essential code pattern.

---

## 1. async_options

**What it is:** A select or multi-select whose options are loaded from an API endpoint rather than being hardcoded in the schema.

**When you need it:** Any time the list of options is dynamic — insurance providers, countries and provinces, product categories, user roles, or any lookup table that changes without a code deploy.

**How to tell the agent:**
```
insurance provider (select, required, options from GET /api/insurance-providers — returns [{id, name}])
```
Or in a requirements file:
```
- [ ] Async dropdown options (field: insuranceProvider, endpoint: GET /api/insurance-providers)
```

**What gets generated:**
- `widgets/AsyncSelectWidget.tsx` — a widget that calls the endpoint on mount and populates options
- `uiSchema.ts` updated with `"ui:widget": "AsyncSelectWidget"` and `"ui:options": { "optionsUrl": "/api/insurance-providers" }`
- Test cases using `vi.mock` / `jest.mock` to stub the fetch and assert that options render

**Key code pattern:**
```tsx
const AsyncSelectWidget: React.FC<WidgetProps> = ({ id, value, onChange, options }) => {
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const url = options.optionsUrl as string;

  useEffect(() => {
    fetch(url)
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error);
  }, [url]);

  return (
    <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">-- Select --</option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>{item.name}</option>
      ))}
    </select>
  );
};
```

---

## 2. async_field_validation

**What it is:** A field that validates against an API on blur — for example, checking whether a username or email is already taken before the form is submitted.

**When you need it:** Username uniqueness checks, email availability, coupon code validation, product SKU lookup, or any case where the server knows something the client cannot check locally.

**How to tell the agent:**
```
username (text, required, check availability at POST /api/check-username on blur — returns { available: boolean, message: string })
```

**What gets generated:**
- An async validation function added to `index.tsx`
- An `extraErrors` state variable to hold the result
- An `onBlur` handler that fires the API call and sets field-level errors via `extraErrors`
- Test cases covering the available and unavailable paths

**Key code pattern:**
```tsx
const [extraErrors, setExtraErrors] = useState<ErrorSchema>({});

const handleBlur = async (id: string, value: unknown) => {
  if (id !== 'root_username' || !value) return;
  const res = await fetch('/api/check-username', {
    method: 'POST',
    body: JSON.stringify({ username: value }),
    headers: { 'Content-Type': 'application/json' },
  });
  const { available, message } = await res.json();
  if (!available) {
    setExtraErrors({ username: { __errors: [message] } });
  } else {
    setExtraErrors({});
  }
};

<Form ... extraErrors={extraErrors} onBlur={handleBlur} />
```

---

## 3. server_error_mapping

**What it is:** Maps field-keyed validation errors returned by the server after submission onto the corresponding form fields, so errors appear inline rather than in a generic message box.

**When you need it:** Any form that submits to a backend that can reject individual field values — email already registered, username taken, credit card declined with a specific field error, address not found in postal database.

**How to tell the agent:**
```
[x] Server error mapping (backend returns { "email": "Already registered", "address.city": "Unknown city" })
```

**What gets generated:**
- A `mapServerErrors` utility function in `index.tsx` that converts `Record<string, string>` with dot-notation keys to RJSF's nested `ErrorSchema` format
- `extraErrors` state wired to the `Form` component
- The `onSubmit` handler wraps the API call in a try/catch and calls `mapServerErrors` on the error body
- Test cases asserting that server errors land on the correct field

**Key code pattern:**
```tsx
function mapServerErrors(serverErrors: Record<string, string>): ErrorSchema {
  const out: ErrorSchema = {};
  for (const [path, message] of Object.entries(serverErrors)) {
    const parts = path.split('.');
    let node: any = out;
    for (let i = 0; i < parts.length - 1; i++) {
      node[parts[i]] ??= {};
      node = node[parts[i]];
    }
    const last = parts[parts.length - 1];
    node[last] = { __errors: [message] };
  }
  return out;
}

// In onSubmit:
try {
  await submitToServer(formData);
} catch (err: any) {
  setExtraErrors(mapServerErrors(err.fields ?? {}));
}
```

---

## 4. cross_field_validation

**What it is:** A validation rule that spans two or more fields — the schema cannot express it on any single field, so it runs as a custom function after the schema is validated.

**When you need it:** End date must be after start date. Password and confirm-password must match. Discount amount cannot exceed the order total. At least one of phone or email must be provided.

**How to tell the agent:**
```
end date must be after start date
confirmPassword must match password
```

**What gets generated:**
- A `customValidate` function added to `index.tsx`
- The function is typed with `CustomValidator<FormData>` from `@rjsf/utils`
- Wired to `Form` via the `customValidate` prop
- Test cases covering the valid case and each invalid case

**Key code pattern:**
```tsx
import { CustomValidator } from '@rjsf/utils';

const customValidate: CustomValidator<ProjectFormData> = (formData, errors) => {
  if (
    formData.startDate &&
    formData.endDate &&
    formData.endDate <= formData.startDate
  ) {
    errors.endDate!.addError('End date must be after start date');
  }
  return errors;
};

<Form ... customValidate={customValidate} />
```

---

## 5. multi_step

**What it is:** A wizard that breaks the form into numbered steps, showing one section at a time with Back/Next navigation and a step indicator.

**When you need it:** Forms with 10+ fields, forms with sections that build on each other (later sections make more sense after earlier ones are filled), or forms where progress should be visible to reduce abandonment.

**How to tell the agent:**
```
Build as a multi-step wizard with steps: 1) Personal Information, 2) Employment, 3) Documents
```

**What gets generated:**
- `templates/WizardTemplate.tsx` — the step-aware `ObjectFieldTemplate`
- `uiSchema.ts` updated with `"ui:options": { "steps": ["Personal Information", "Employment", "Documents"] }`
- `index.tsx` registers the template
- Test cases for Back/Next navigation, per-step validation, and that field values persist when navigating back

**Key code pattern:**
```tsx
const WizardTemplate: React.FC<ObjectFieldTemplateProps> = ({ properties, uiSchema }) => {
  const steps = uiSchema?.['ui:options']?.steps as string[] ?? [];
  const [step, setStep] = useState(0);
  const stepProps = properties.filter((p) => p.name === steps[step]);

  return (
    <>
      <StepIndicator steps={steps} current={step} />
      {stepProps.map((p) => <div key={p.name}>{p.content}</div>)}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button type="button" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</button>
        {step < steps.length - 1
          ? <button type="button" onClick={() => setStep(s => s + 1)}>Next</button>
          : <button type="submit">Submit</button>}
      </div>
    </>
  );
};
```

---

## 6. edit_mode

**What it is:** The form accepts a `formData` prop that pre-populates all fields from an existing record, enabling update workflows.

**When you need it:** Any CRUD interface where a user edits an existing entity — edit profile, update order, modify settings.

**How to tell the agent:**
```
[x] Edit mode (form pre-populates from existing record)
```

**What gets generated:**
- The generated component accepts `formData?: Partial<FormData>` as a prop
- RJSF's built-in `formData` prop is passed through — RJSF handles pre-population automatically
- Test cases asserting that the component renders with the provided values visible in the inputs

**Key code pattern:**
```tsx
interface EditFormProps {
  formData?: Partial<ApplicationFormData>;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
}

export default function ApplicationForm({ formData, onSubmit }: EditFormProps) {
  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      formData={formData}
      onSubmit={({ formData: data }) => onSubmit(data)}
    />
  );
}
```

---

## 7. role_based

**What it is:** Fields or sections that are hidden, disabled, or made read-only based on the current user's role.

**When you need it:** Admin forms where some fields are only visible to administrators. Onboarding forms where HR staff see fields that employees do not. Any form where access rules differ by persona.

**How to tell the agent:**
```
salary field: visible only to users with role = admin or hr
department field: read-only for employees, editable for managers
```

**What gets generated:**
- A `formContext` prop added to `index.tsx` — an object that carries `{ userRole: string }` to the Form
- A custom `FieldTemplate` in `templates/RoleGatedFieldTemplate.tsx` that reads `formContext.userRole` and applies `hidden`, `disabled`, or `readonly` behavior
- `uiSchema.ts` entries with `"ui:options": { "roles": ["admin", "hr"] }` on gated fields
- Test cases for each role scenario

**Key code pattern:**
```tsx
const RoleGatedFieldTemplate: React.FC<FieldTemplateProps> = ({
  id, children, uiSchema, formContext
}) => {
  const allowedRoles = uiSchema?.['ui:options']?.roles as string[] | undefined;
  const userRole: string = formContext?.userRole ?? 'employee';

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return null; // hide the field entirely
  }
  return <div id={id}>{children}</div>;
};

<Form ... formContext={{ userRole: currentUser.role }}
  templates={{ FieldTemplate: RoleGatedFieldTemplate }} />
```

---

## 8. draft_save

**What it is:** Auto-saves the current form values to `localStorage` on every change, and restores them when the page loads, so users do not lose progress if they close the tab.

**When you need it:** Long forms, forms on public-facing pages (job applications, insurance quotes), or any form where losing half-filled data would be painful for the user.

**How to tell the agent:**
```
[x] Draft save (auto-save to localStorage)
```

**What gets generated:**
- A `useDraftSave` hook in `hooks/useDraftSave.ts` — reads from and writes to `localStorage` under a key derived from the form name
- `index.tsx` uses `useDraftSave` to initialize `formData` state and save on every `onChange`
- A "Clear draft" button rendered below the form
- Test cases verifying that values survive a remount (simulating a page reload)

**Key code pattern:**
```tsx
const DRAFT_KEY = 'rjsf_draft_ContactForm';

function useDraftSave<T>(initial?: Partial<T>) {
  const [formData, setFormData] = useState<Partial<T>>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : (initial ?? {});
    } catch {
      return initial ?? {};
    }
  });

  const handleChange = useCallback(({ formData: data }: { formData: Partial<T> }) => {
    setFormData(data);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData(initial ?? {});
  }, [initial]);

  return { formData, handleChange, clearDraft };
}
```

---

## 9. nested_arrays

**What it is:** An array field (repeating rows) where each row itself contains another array field — for example, a work history array where each job has a skills array.

**When you need it:** Work history with a skills list per job, order items with modifiers per item, a contacts list where each contact has multiple email addresses.

**How to tell the agent:**
```
work history (array):
  - employer (text, required)
  - job title (text, required)
  - skills (array of strings) — render as tag input, not nested rows
```

**What gets generated:**
- Schema with `array > items > array` nesting
- `templates/TagArrayTemplate.tsx` — renders the inner array as removable chip tags rather than a nested RJSF array UI (which would be unusable)
- `uiSchema.ts` sets `"ui:ArrayFieldTemplate": "TagArrayTemplate"` on the inner array
- Test cases for adding and removing items at both levels

**Key code pattern:**
```tsx
const TagArrayTemplate: React.FC<ArrayFieldTemplateProps> = ({
  items, canAdd, onAddClick
}) => (
  <div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {items.map((item) => (
        <span key={item.key} style={{ background: '#e0e7ff', padding: '2px 8px', borderRadius: 12 }}>
          {item.children}
          <button type="button" onClick={item.onDropIndexClick(item.index)}> ×</button>
        </span>
      ))}
    </div>
    {canAdd && <button type="button" onClick={onAddClick}>+ Add</button>}
  </div>
);
```

---

## 10. computed_fields

**What it is:** A read-only field whose value is derived from other field values — for example, a line total that updates as the user changes quantity and unit price.

**When you need it:** Invoice line items (quantity × price = total), BMI calculators, tax calculations, discount summaries, age from date of birth.

**How to tell the agent:**
```
total (number, read-only, computed: quantity × unitPrice — update on every change)
```

**What gets generated:**
- The schema includes the computed field with `"readOnly": true`
- `index.tsx` manages `formData` in state and recalculates on every `onChange` call
- The computed field's value is injected into `formData` before it is passed to the `Form`
- Test cases asserting the computed value updates when dependent fields change

**Key code pattern:**
```tsx
const [formData, setFormData] = useState<Partial<InvoiceFormData>>({});

const handleChange = ({ formData: data }: { formData: Partial<InvoiceFormData> }) => {
  const qty = data.quantity ?? 0;
  const price = data.unitPrice ?? 0;
  setFormData({ ...data, total: qty * price });
};

<Form ... formData={formData} onChange={handleChange} />
```

---

## 11. array_reorder

**What it is:** Array items that can be reordered by dragging, powered by `@dnd-kit/core`.

**When you need it:** Priority-ordered lists, ranked preferences, task lists where order matters, any array where the user needs to physically rearrange items.

**How to tell the agent:**
```
tasks (array, drag-to-reorder enabled):
  - title (text, required)
  - priority (select: low / medium / high)
```

**What gets generated:**
- `templates/DragReorderArrayTemplate.tsx` — wraps array items in `@dnd-kit/core`'s `DndContext` and `SortableContext`
- Each item is wrapped in a `useSortable` hook with a drag handle
- The template's `onReorderClick` callbacks are replaced by the dnd-kit drag-end handler
- Test cases using `@dnd-kit/core`'s test utilities to simulate reorder

**Key code pattern:**
```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';

const DragReorderArrayTemplate: React.FC<ArrayFieldTemplateProps> = ({ items, canAdd, onAddClick }) => {
  const ids = items.map((item) => item.key);
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={({ active, over }) => {
      if (!over || active.id === over.id) return;
      const from = ids.indexOf(active.id as string);
      const to = ids.indexOf(over.id as string);
      items[from].onReorderClick(from, to)();
    }}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {items.map((item) => <SortableItem key={item.key} item={item} />)}
      </SortableContext>
      {canAdd && <button type="button" onClick={onAddClick}>+ Add</button>}
    </DndContext>
  );
};
```

---

## 12. file_upload_server

**What it is:** A file input that POSTs the selected file to a server endpoint and stores the returned URL as the field value, rather than storing the file as a base64 data URL.

**When you need it:** When files should be stored in S3, Azure Blob Storage, or any CDN. When forms have file size limits that make base64 encoding impractical. When the URL needs to be accessible to other systems.

**How to tell the agent:**
```
resume (file upload, POST to /api/upload, accept: .pdf/.doc/.docx, max 5MB, store returned URL)
```

**What gets generated:**
- `widgets/FileUploadServerWidget.tsx` — handles the POST, shows upload progress, stores the URL on success
- Schema field type is `string` (stores the URL), not `format: data-url`
- `uiSchema.ts` sets `"ui:widget": "FileUploadServerWidget"` with `"ui:options": { "uploadUrl": "/api/upload", "accept": ".pdf,.doc,.docx", "maxSizeMB": 5 }`
- Test cases mocking the upload endpoint

**Key code pattern:**
```tsx
const FileUploadServerWidget: React.FC<WidgetProps> = ({ id, onChange, options }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(options.uploadUrl as string, { method: 'POST', body: form });
    const { url } = await res.json();
    onChange(url);
    setUploading(false);
  };

  return (
    <div>
      <input id={id} type="file" accept={options.accept as string} onChange={handleFileChange} />
      {uploading && <span>Uploading...</span>}
    </div>
  );
};
```

---

## 13. view_mode

**What it is:** A read-only companion component that renders the same form data in a display-only layout — no inputs, just labeled values.

**When you need it:** Review pages before submission, record detail pages, print-ready summaries, or anywhere the data should be visible but not editable.

**How to tell the agent:**
```
[x] View mode (read-only companion component)
```

**What gets generated:**
- `<FormName>View.tsx` — a separate component that receives `formData` and renders each field as a label + value pair
- Does not import RJSF; it reads from `types.ts` and renders plain HTML
- Shares the same `types.ts` interface as the form component
- Test cases asserting each field value is visible in the rendered output

**Key code pattern:**
```tsx
// ContactFormView.tsx
import type { ContactFormData } from './types';

interface ContactFormViewProps {
  data: ContactFormData;
}

export function ContactFormView({ data }: ContactFormViewProps) {
  return (
    <dl>
      <dt>First Name</dt>  <dd>{data.firstName}</dd>
      <dt>Last Name</dt>   <dd>{data.lastName}</dd>
      <dt>Email</dt>       <dd>{data.email}</dd>
      {data.phone && <><dt>Phone</dt><dd>{data.phone}</dd></>}
    </dl>
  );
}
```

---

## 14. tab_layout

**What it is:** All form sections are shown as tabs, so the user can click between them freely. All sections are validated together on submit.

**When you need it:** Settings pages, admin configuration forms, profile editors — any form where sections are independent of each other and the user should be able to navigate freely.

**How to tell the agent:**
```
Use a tab layout — all sections accessible as tabs at once
```

**What gets generated:**
- `templates/TabTemplate.tsx` — an `ObjectFieldTemplate` with a tab bar at the top and a content panel
- `uiSchema.ts` sets `"ui:ObjectFieldTemplate": "TabTemplate"` and `"ui:options": { "tabs": ["Personal", "Employment", "Documents"] }`
- `index.tsx` registers the template
- Test cases asserting that all tab panels are present and that switching tabs does not clear values

**Key code pattern:**
```tsx
const TabTemplate: React.FC<ObjectFieldTemplateProps> = ({ properties, uiSchema }) => {
  const tabs = uiSchema?.['ui:options']?.tabs as string[] ?? [];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div role="tablist" style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            role="tab"
            type="button"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            style={{ padding: '8px 16px', fontWeight: i === active ? 600 : 400 }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div role="tabpanel" style={{ padding: 24 }}>
        {properties
          .filter((p) => p.name === tabs[active])
          .map((p) => <div key={p.name}>{p.content}</div>)}
      </div>
    </div>
  );
};
```

---

## 15. masked_input

**What it is:** A text input that enforces a visual format as the user types — for example, showing dashes and spaces in a phone number or credit card number.

**When you need it:** US phone numbers `(555) 867-5309`, credit cards `4111 1111 1111 1111`, SSNs `XXX-XX-XXXX`, dates `MM/DD/YYYY`, ZIP+4 codes `12345-6789`.

**How to tell the agent:**
```
phone number (text, masked format: (XXX) XXX-XXXX)
credit card (text, masked format: XXXX XXXX XXXX XXXX)
```

**What gets generated:**
- `widgets/MaskedInputWidget.tsx` — uses `react-imask` or `react-input-mask` to enforce the pattern
- The schema field remains `type: "string"` — the stored value is the raw digits (mask characters are stripped by the widget before calling `onChange`)
- `uiSchema.ts` sets `"ui:widget": "MaskedInputWidget"` with `"ui:options": { "mask": "(000) 000-0000" }`
- Test cases asserting the masked display and the raw stored value

**Key code pattern:**
```tsx
import { IMaskInput } from 'react-imask';
import { WidgetProps } from '@rjsf/utils';

const MaskedInputWidget: React.FC<WidgetProps> = ({ id, value, onChange, options, disabled, readonly }) => {
  const mask = options.mask as string;

  return (
    <IMaskInput
      id={id}
      mask={mask}
      value={(value as string) ?? ''}
      disabled={disabled || readonly}
      onAccept={(val: string) => onChange(val)}
    />
  );
};
```

---

## Less Common Edge Cases

These three edge cases are fully supported in Phase 4 but are less frequently needed. Tell the agent about them in your requirements if you need them.

**i18n (multi-language support):** The agent generates a `locales/` directory with translation JSON files for every field label, placeholder, help text, and validation message. The `Form` component accepts a `locale` prop. Tell the agent: `"support English and French"`.

**rich_text (WYSIWYG editor):** Integrates a TipTap or Quill editor as a custom widget. The stored value is an HTML string. Tell the agent: `"description (rich text editor, required)"`.

**print_export (print/PDF export):** Adds a `<FormName>Print.tsx` component with a print-specific CSS stylesheet, plus a "Download PDF" button powered by the browser's print-to-PDF feature. Tell the agent: `"[x] Print / PDF export"`.
