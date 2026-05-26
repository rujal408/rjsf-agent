# Example: Dynamic Survey Form

A survey builder demonstrating an array of question objects with drag-to-reorder via `@dnd-kit`,
and conditional sub-fields (`scale_max` appears only when the question type is `"scale"`).

---

## 1. Requirements

The natural language string passed to `/rjsf-build`:

```
Build a dynamic survey form.

Survey settings:
- Survey title (text, required, maxLength 120)
- Survey description (textarea, optional)

Questions section:
- questions (array, minItems 1, maxItems 30, drag-to-reorder enabled)
  Each question has:
  - question_text (text, required, minLength 3)
  - question_type (select: text / multiple_choice / scale, required)
  - scale_max (integer, min 2, max 10, required only when question_type = "scale",
    label: "Scale maximum")

Use @rjsf/core theme.
Single-page form.
```

---

## 2. RequirementsBrief

What Phase 1 produces:

```markdown
# Requirements Brief: Dynamic Survey

## Purpose
Survey authors fill this form to define a titled survey with an ordered list of typed questions.

## RJSF Theme
@rjsf/core

## Sections & Fields

### Survey Settings
| Field             | Type   | Required | Validation      | Notes             |
|-------------------|--------|----------|-----------------|-------------------|
| surveyTitle       | string | Yes      | maxLength: 120  | —                 |
| surveyDescription | string | No       | —               | textarea widget   |

### Questions (Array)
| Field         | Type    | Required          | Validation          | Notes                                       |
|---------------|---------|-------------------|---------------------|---------------------------------------------|
| question_text | string  | Yes               | minLength: 3        | —                                           |
| question_type | string  | Yes               | enum                | text / multiple_choice / scale              |
| scale_max     | integer | Yes (if scale)    | min: 2, max: 10     | Shown only when question_type = "scale"     |

## Conditional Logic
- Show `scale_max` when `question_type` equals `"scale"`

## Layout Intent
- Form type: single-page
- `questions` array: drag-to-reorder enabled (drag handle per row)

## Edge Case Flags
- async_options: false
- cross_field_validation: false
- multi_step: false
- edit_mode: false
- role_based: false
- draft_save: false
- async_field_validation: false
- server_error_mapping: false
- nested_arrays: false
- computed_fields: false
- array_reorder: true — questions array
- file_upload_server: false
- view_mode: false
- tab_layout: false
- i18n: false
- masked_input: false
- rich_text: false
- print_export: false
```

---

## 3. FormPlan Key Decisions

**SortableArrayTemplate identified in Customization Assessment:**
The `questions` array requires drag-to-reorder behavior. RJSF's built-in orderable array renders
up/down arrow buttons — the requirements ask for drag handles. The planner identifies that a
`SortableArrayTemplate` using `@dnd-kit/core` + `@dnd-kit/sortable` must be generated.

**Template wiring:**
- `SortableArrayTemplate.tsx` is registered on the `Form` component via the `templates` prop.
- `uiSchema.questions["ui:ArrayFieldTemplate"]` is set to `"SortableArrayTemplate"` (the string
  key used in the templates registry).

**Conditional sub-field (scale_max):**
- Each array item object has its own `if/then` block in `items.if/then`.
- RJSF evaluates per-item conditions independently — no custom widget needed.

**Column layout:**
- `question_text` — full-width
- `question_type` and `scale_max` — side-by-side when `scale_max` is visible

---

## 4. Generated `schema.ts`

```typescript
// src/forms/DynamicSurvey/schema.ts
import type { RJSFSchema } from '@rjsf/utils';

export const schema: RJSFSchema = {
  title: 'Dynamic Survey',
  type: 'object',
  required: ['surveyTitle', 'questions'],
  properties: {
    surveyTitle: {
      type: 'string',
      title: 'Survey Title',
      maxLength: 120,
    },
    surveyDescription: {
      type: 'string',
      title: 'Survey Description',
    },
    questions: {
      type: 'array',
      title: 'Questions',
      minItems: 1,
      maxItems: 30,
      items: {
        type: 'object',
        title: 'Question',
        required: ['question_text', 'question_type'],
        properties: {
          question_text: {
            type: 'string',
            title: 'Question Text',
            minLength: 3,
          },
          question_type: {
            type: 'string',
            title: 'Question Type',
            enum: ['text', 'multiple_choice', 'scale'],
            enumNames: ['Free Text', 'Multiple Choice', 'Scale (1–N)'],
          },
        },
        // Per-item conditional: show scale_max only for scale questions
        if: {
          properties: {
            question_type: { const: 'scale' },
          },
          required: ['question_type'],
        },
        then: {
          properties: {
            scale_max: {
              type: 'integer',
              title: 'Scale Maximum',
              minimum: 2,
              maximum: 10,
              default: 5,
            },
          },
          required: ['scale_max'],
        },
      },
    },
  },
};
```

---

## 5. Generated `uiSchema.ts`

```typescript
// src/forms/DynamicSurvey/uiSchema.ts
import type { UiSchema } from '@rjsf/utils';

export const uiSchema: UiSchema = {
  'ui:order': ['surveyTitle', 'surveyDescription', 'questions', '*'],

  surveyTitle: {
    'ui:autofocus': true,
    'ui:placeholder': 'e.g. Customer Satisfaction Survey Q3',
  },
  surveyDescription: {
    'ui:widget': 'textarea',
    'ui:options': { rows: 3 },
    'ui:placeholder': 'Optional: describe what this survey is for',
  },
  questions: {
    // Register the sortable template for this array
    'ui:ArrayFieldTemplate': 'SortableArrayTemplate',
    'ui:options': {
      orderable: false,  // native RJSF order buttons are replaced by dnd-kit
      removable: true,
      addable: true,
      addButtonProps: { children: '+ Add Question' },
    },
    items: {
      'ui:order': ['question_text', 'question_type', 'scale_max', '*'],
      question_text: {
        'ui:placeholder': 'Enter your question',
      },
      question_type: {
        'ui:placeholder': 'Select question type',
      },
      scale_max: {
        'ui:help': 'Respondents will choose a number between 1 and this value',
      },
    },
  },
};
```

---

## 6. `SortableArrayTemplate.tsx` — Key Parts

```tsx
// src/forms/DynamicSurvey/templates/SortableArrayTemplate.tsx
import React from 'react';
import type { ArrayFieldTemplateProps } from '@rjsf/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Single sortable item ─────────────────────────────────────────────────────

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
  canRemove: boolean;
}

function SortableItem({ id, children, onRemove, canRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '12px 8px',
    marginBottom: 8,
    background: isDragging ? '#f0f4ff' : '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          background: 'none',
          border: 'none',
          padding: '4px 6px',
          color: '#9ca3af',
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        ⠿
      </button>

      {/* Item content (rendered by RJSF) */}
      <div style={{ flex: 1 }}>{children}</div>

      {/* Remove button */}
      {canRemove && (
        <button
          type="button"
          aria-label="Remove question"
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '4px 6px',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ─── Template ─────────────────────────────────────────────────────────────────

const SortableArrayTemplate: React.FC<ArrayFieldTemplateProps> = ({
  items,
  canAdd,
  onAddClick,
  title,
  schema: arraySchema,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = items.map((item) => item.key);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = ids.indexOf(active.id as string);
    const toIndex = ids.indexOf(over.id as string);

    if (fromIndex !== -1 && toIndex !== -1) {
      // Use RJSF's built-in reorder callback
      items[fromIndex].onReorderClick(fromIndex, toIndex)();
    }
  };

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      {title && <legend style={{ fontWeight: 600, marginBottom: 12 }}>{title}</legend>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem
              key={item.key}
              id={item.key}
              canRemove={item.hasRemove}
              onRemove={item.onDropIndexClick(item.index)}
            >
              {item.children}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {canAdd && (
        <button
          type="button"
          onClick={onAddClick}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          + Add Question
        </button>
      )}

      {arraySchema.minItems !== undefined && items.length === 0 && (
        <p style={{ color: '#ef4444', fontSize: 13 }}>
          At least {arraySchema.minItems} question is required.
        </p>
      )}
    </fieldset>
  );
};

export default SortableArrayTemplate;
```

---

## 7. Key Test Cases

```tsx
// src/forms/DynamicSurvey/DynamicSurvey.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import DynamicSurveyForm from './index';

// ── Test 1: Drag handle renders for each question item ────────────────────────

test('renders a drag handle for each question row', async () => {
  render(<DynamicSurveyForm onSubmit={vi.fn()} />);

  // Add two questions
  const addButton = screen.getByRole('button', { name: /add question/i });
  await userEvent.click(addButton);
  await userEvent.click(addButton);

  const handles = screen.getAllByLabelText(/drag to reorder/i);
  // Default has 1 item + we added 2 more = 3 total, each with a drag handle
  expect(handles.length).toBeGreaterThanOrEqual(2);
});

// ── Test 2: scale_max appears only when question_type = "scale" ───────────────

test('shows scale_max field only when question type is scale', async () => {
  render(<DynamicSurveyForm onSubmit={vi.fn()} />);

  // The first default question row should be present
  const typeSelect = screen.getByLabelText(/question type/i);

  // Initially (no type selected) scale_max should not be visible
  expect(screen.queryByLabelText(/scale maximum/i)).not.toBeInTheDocument();

  // Select "Multiple Choice" — scale_max should remain hidden
  await userEvent.selectOptions(typeSelect, 'multiple_choice');
  expect(screen.queryByLabelText(/scale maximum/i)).not.toBeInTheDocument();

  // Select "Scale" — scale_max should appear
  await userEvent.selectOptions(typeSelect, 'scale');
  expect(await screen.findByLabelText(/scale maximum/i)).toBeInTheDocument();

  // Switch back to "Free Text" — scale_max should disappear again
  await userEvent.selectOptions(typeSelect, 'text');
  expect(screen.queryByLabelText(/scale maximum/i)).not.toBeInTheDocument();
});

// ── Test 3: Remove button deletes a question row ──────────────────────────────

test('removes a question row when remove button is clicked', async () => {
  render(<DynamicSurveyForm onSubmit={vi.fn()} />);

  // Add a second question
  await userEvent.click(screen.getByRole('button', { name: /add question/i }));

  const rows = screen.getAllByLabelText(/remove question/i);
  expect(rows.length).toBe(2);

  await userEvent.click(rows[1]);

  await waitFor(() => {
    expect(screen.getAllByLabelText(/remove question/i).length).toBe(1);
  });
});

// ── Test 4: scale_max validation — required and in range when type = scale ────

test('validates scale_max is required and within 2–10 when type is scale', async () => {
  render(<DynamicSurveyForm onSubmit={vi.fn()} />);

  await userEvent.type(screen.getByLabelText(/survey title/i), 'My Survey');
  await userEvent.type(screen.getByLabelText(/question text/i), 'How satisfied are you?');
  await userEvent.selectOptions(screen.getByLabelText(/question type/i), 'scale');

  // Attempt to submit without filling scale_max
  fireEvent.submit(document.querySelector('form')!);

  await waitFor(() => {
    // RJSF should report scale_max as required
    expect(
      screen.getByText(/scale maximum.*required|required.*scale maximum/i) ||
      screen.getAllByText(/required property/i).length > 0,
    ).toBeTruthy();
  });
});
```
