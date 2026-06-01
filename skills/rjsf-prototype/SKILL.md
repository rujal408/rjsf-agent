---
name: rjsf-prototype
description: Phase 3 — generate a self-contained HTML prototype for client sign-off before any React code is written
allowed-tools: [Read, Write, Glob, Bash]
---

# RJSF Prototype Generation — Phase 3

**Trigger:** `/rjsf-prototype` — or invoked automatically by `/rjsf-build` as Phase 3.

---

## Step 1 — Read Session & Artifacts

1. Resolve the active session path (see `references/session-pattern.md` Section 0). Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.
2. **Read `{sessionDir}/form-plan.md`** (FormPlan from Phase 2). This is the primary input — use its column layout decisions, widget assignments, step map, and customization assessment to generate the prototype. The prototype must visually reflect the planned layout (column counts, full-width fields, step structure).
3. Read `{sessionDir}/requirements-brief.md` (or `{sessionDir}/enhanced-brief.md` if Phase 1.5 completed) for field details.
4. If `phases["2.5"]` exists and is `"completed"`, read `{sessionDir}/technical-choices.md` for styling decisions (formWrapper, gridGap, colorPalette, touchTargetSize). Apply these to the prototype's CSS.
5. If `phases["2"].status` is not `"completed"`, stop and tell the user:
   > "Phase 2 (Planning) must be completed first. Run `/rjsf-plan`."
6. If `phases["3"].status` is `"awaiting_client_approval"` or `"completed"`:
  - Tell the user: "A prototype already exists at `{sessionDir}/prototype.html`. Regenerate it (overwrites existing file), or open the existing one for review?"
  - Wait for the user's choice. Only proceed to Step 2 if they choose to regenerate.

---

## Step 2 — Generate `{sessionDir}/prototype.html`

Create the session directory if it does not exist, then write `{sessionDir}/prototype.html`.

The file MUST be **completely self-contained**: no external CSS, no external JS, no CDN links. It must open and function correctly when double-clicked from the filesystem (i.e. `file://` origin).

### Full HTML template structure

Write a single `.html` file with the following sections in order:

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Form Title] — Prototype</title>
  <style>
    /* --- inline CSS (see spec below) --- */
  </style>
</head>
<body>
  <!-- Prototype limitations notice (always first) -->
  <!-- Form title -->
  <!-- Step indicator (if multi-step) -->
  <!-- Step/section panels -->
  <!-- Step navigation (if multi-step) -->
  <!-- Data summary div -->
  <script>
    /* --- inline JS (see spec below) --- */
  </script>
</body>
</html>
```

---

### Inline CSS specification

Include ALL of the following rules inside `<style>`:

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  color: #1a1a1a;
}

.form-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 24px; }

.section {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; }

/* Column grids — mobile-first: all default to 1 column */
.grid-1,
.grid-2,
.grid-3,
.grid-4 { display: grid; grid-template-columns: 1fr; gap: 16px; }
.col-full { grid-column: 1 / -1; }

/* Tablet: ≥640px */
@media (min-width: 640px) {
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: ≥1024px */
@media (min-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Fields */
.field { display: flex; flex-direction: column; gap: 4px; }

label { font-size: 0.875rem; font-weight: 500; color: #374151; }
.required { color: #dc2626; margin-left: 2px; }

input, select, textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  background: #fff;
  min-height: 44px; /* touch target — WCAG 2.5.5 */
}
input:focus, select:focus, textarea:focus {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
  border-color: transparent;
}
textarea { resize: vertical; }

.help { font-size: 0.75rem; color: #6b7280; }

/* Visibility */
.hidden { display: none !important; }

/* Multi-step */
.step { display: none; }
.step.active { display: block; }

.step-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
}

.step-indicator {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 24px;
}
.step-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #d1d5db;
}
.step-dot.active  { background: #2563eb; }
.step-dot.done    { background: #16a34a; }

/* Buttons */
button {
  padding: 9px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  min-height: 44px; /* touch target — WCAG 2.5.5 */
}
button[type="submit"], .btn-primary {
  background: #2563eb;
  color: #fff;
}
button[type="submit"]:hover, .btn-primary:hover { background: #1d4ed8; }
.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}
.btn-secondary:hover { background: #d1d5db; }

/* Data summary */
.data-summary {
  display: none;
  background: #dcfce7;
  border: 1px solid #16a34a;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
}
.data-summary h3 { margin-bottom: 8px; color: #15803d; }
.data-summary pre { font-size: 0.8rem; white-space: pre-wrap; word-break: break-all; }

/* Limitations notice */
.limitations {
  background: #fefce8;
  border: 1px solid #ca8a04;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 28px;
}
.limitations h3 { margin-bottom: 8px; font-size: 1rem; }
.limitations p  { font-size: 0.85rem; margin-top: 6px; line-height: 1.5; }
```

---

### Prototype Limitations Notice HTML

Always render this as the **first element inside `<body>`**, before the form title:

```html
<div class="limitations">
  <h3>&#9888; Prototype — For Client Review Only</h3>
  <p><strong>This prototype accurately shows:</strong> layout, field types, section structure, conditional show/hide, step flow.</p>
  <p><strong>Simplified for prototype purposes:</strong> async option loading (static placeholder options shown), complex cross-field validation (not enforced), role-based field visibility (all fields shown), file upload (UI only, no actual upload).</p>
</div>
```

---

### Field type → HTML element mapping

Use this table to decide which HTML element to render for each field in the FormPlan:

| Field type | HTML element |
|---|---|
| text | `<input type="text">` |
| email | `<input type="email">` |
| password | `<input type="password">` |
| date | `<input type="date">` |
| number | `<input type="number">` |
| textarea / rich text | `<textarea rows="4">` |
| select (single) | `<select>` with `<option>` per enum value |
| select (multi) | `<select multiple>` |
| radio | `<input type="radio">` group (wrap each in a `<label>`) |
| checkbox (single) | `<input type="checkbox">` |
| checkbox group | Multiple `<input type="checkbox">` (one per option) |
| file | `<input type="file">` |
| masked input | `<input type="text" placeholder="e.g. +977-98XXXXXXXX">` |
| async options | `<select>` with 2–3 static placeholder `<option>` values + a disabled `<option>` reading "(dynamic options in final form)" |
| nested array | `<div class="col-full"><p class="help">(Array items shown as a simplified list in prototype — full UI in React implementation)</p></div>` |
| computed field | `<input type="text" disabled placeholder="(calculated automatically)">` |
| array with reorder | `<div class="col-full"><p class="help">(Drag-and-drop reordering shown as static list in prototype)</p></div>` |

For any field with `required: true`, add `<span class="required">*</span>` after the label text.

For any field with a `helpText` / `description`, render a `<p class="help">…</p>` below the input.

For async option fields, also add a `<p class="help">(Options loaded dynamically in final form)</p>`.

---

### Column layout

Read the `columns` value from each section in `form-plan.md`. Apply the corresponding CSS class (`grid-1`, `grid-2`, `grid-3`, or `grid-4`) to the `<div>` that wraps all `.field` elements inside that section. If a field should span the full width (e.g. a textarea or a section heading), add `col-full` to its `.field` wrapper.

---

### Conditional show/hide (vanilla JS)

For every conditional rule in the FormPlan, emit a JS snippet following this pattern:

```js
document.getElementById('TRIGGER_FIELD_ID').addEventListener('change', function() {
  var val = this.value;
  var target = document.getElementById('TARGET_FIELD_ID');
  if (val === 'CONDITION_VALUE') {
    target.classList.remove('hidden');
  } else {
    target.classList.add('hidden');
  }
});
```

- For checkbox triggers use `this.checked` instead of `this.value`.
- Extract each handler into a named function so it can be called directly for initialization:

```js
function handle_TRIGGER_FIELD_ID() {
  var val = document.getElementById('TRIGGER_FIELD_ID').value;
  var target = document.getElementById('TARGET_FIELD_ID');
  if (val === 'CONDITION_VALUE') {
    target.classList.remove('hidden');
  } else {
    target.classList.add('hidden');
  }
}
document.getElementById('TRIGGER_FIELD_ID').addEventListener('change', handle_TRIGGER_FIELD_ID);
// Initialize on page load:
handle_TRIGGER_FIELD_ID();
```

Call each handler function once at the bottom of the script block, after all `addEventListener` registrations, to set the correct initial visibility state.

---

### Multi-step navigation (vanilla JS)

If the form has more than one step, include:

```js
var currentStep = 0;
var steps = document.querySelectorAll('.step');
var dots  = document.querySelectorAll('.step-dot');

function showStep(n) {
  steps.forEach(function(s, i) {
    s.classList.toggle('active', i === n);
  });
  dots.forEach(function(d, i) {
    d.classList.remove('active', 'done');
    if (i === n) d.classList.add('active');
    if (i < n)  d.classList.add('done');
  });
  document.getElementById('btn-back').classList.toggle('hidden', n === 0);
  document.getElementById('btn-next').classList.toggle('hidden', n === steps.length - 1);
  document.getElementById('btn-submit').classList.toggle('hidden', n !== steps.length - 1);
}

document.getElementById('btn-next').addEventListener('click', function() {
  // Validate all required fields in the current step before advancing.
  // This mirrors the production behaviour (formRef.current.validateForm()) so client
  // sign-off on the prototype matches the final form's validation UX.
  var activeStep = document.querySelector('.step.active');
  var hasErrors = false;
  var firstInvalid = null;
  activeStep.querySelectorAll('[required]').forEach(function(input) {
    var empty = !input.value || !input.value.trim();
    if (empty) {
      input.style.borderColor = '#dc2626';
      input.style.outline = '2px solid #fca5a5';
      hasErrors = true;
      if (!firstInvalid) firstInvalid = input;
    } else {
      input.style.borderColor = '';
      input.style.outline = '';
    }
  });
  if (hasErrors) {
    if (firstInvalid) firstInvalid.focus();
    return; // do not advance — errors are visible on the current step
  }
  if (currentStep < steps.length - 1) { currentStep++; showStep(currentStep); }
});
document.getElementById('btn-back').addEventListener('click', function() {
  if (currentStep > 0) { currentStep--; showStep(currentStep); }
});

showStep(0);
```

Each step panel uses `<div class="step" id="step-N">…</div>`.

For single-page (non-step) forms, omit step navigation and render all sections directly.

---

### Submit handler (vanilla JS)

```js
document.getElementById('prototype-form').addEventListener('submit', function(e) {
  e.preventDefault();
  var data = {};
  var fd = new FormData(this);
  fd.forEach(function(val, key) { data[key] = val; });
  var summary = document.getElementById('data-summary');
  summary.querySelector('pre').textContent = JSON.stringify(data, null, 2);
  summary.style.display = 'block';
  summary.scrollIntoView({ behavior: 'smooth' });
});
```

Place the `.data-summary` div after the `</form>` tag:

```html
<div class="data-summary" id="data-summary">
  <h3>Form Data (prototype preview)</h3>
  <pre></pre>
</div>
```

---

## Step 3 — Write File & Update Session

1. Write the fully rendered HTML to `{sessionDir}/prototype.html` (create directory if needed).
2. Update `{sessionDir}/session.json`:
   - `phases["3"].status = "awaiting_client_approval"`
   - `phases["3"].artifactPath = "prototype.html"`
   - Write the full session.json object (not a partial merge).
3. Print the file path in chat so the user can find it:
   > Written: `{sessionDir}/prototype.html`

---

## Step 4 — End-of-Phase Prompt

After writing the file, output exactly this message:

> Prototype written to `{sessionDir}/prototype.html`. Open it in any browser to preview.
>
> **Share this file with your client.** Once they confirm the layout and fields are correct, come back and run `/rjsf-build` (or just say 'client approved') to proceed to implementation.
>
> The prototype limitations are noted at the top of the file so your client understands what's simplified.
