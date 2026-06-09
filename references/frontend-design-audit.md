# Frontend Design Audit Principles

Reference: [mistyhx/frontend-design-audit](https://github.com/mistyhx/frontend-design-audit) — a Claude Code plugin that audits UIs against 15 established usability and design principles.

Use these principles as a checklist when designing and generating RJSF forms. Each principle maps to concrete form design considerations.

---

## The 15 Design Principles

### 1. Visibility of System Status
The form should always keep users informed about what is going on.

**Form checklist:**
- Loading spinners during async validation or option fetching
- Submit button shows processing state (spinner + disabled)
- Progress indicator on multi-step forms (current step / total steps)
- Success/error feedback after submission (styled alerts, not silent)
- Character count indicators on length-limited fields
- File upload progress bars

### 2. Match Between System and Real World
The form should speak the user's language, with familiar words, phrases, and concepts.

**Form checklist:**
- Labels use domain language the target user understands (not internal/technical terms)
- Date formats match the user's locale expectations
- Currency and number formats match the user's locale
- Option lists are ordered in a way that makes sense to the user (not alphabetical if frequency matters)
- Placeholder text shows realistic example values (e.g., "john@example.com", not "enter email")
- Help text explains why a field is needed, not just what to enter

### 3. User Control and Freedom
Users need a clearly marked "emergency exit" to undo mistakes.

**Form checklist:**
- Clear/reset button available (but not too close to submit)
- "Back" navigation in multi-step wizards preserves entered data
- Ability to remove array items and undo deletions
- Draft save / auto-save so work isn't lost on accidental navigation
- Cancel button returns to previous state without data loss
- Confirmation dialog before destructive actions (e.g., clearing entire form)

### 4. Consistency and Standards
Follow platform conventions. Users shouldn't have to wonder whether different words or actions mean the same thing.

**Form checklist:**
- Required field indicators are consistent (all asterisks OR all "(optional)" tags — not mixed)
- Error messages follow a consistent format and tone
- Button styles match throughout (primary/secondary hierarchy)
- Field spacing and alignment are uniform across all sections
- Labels are consistently positioned (all top-aligned, all left-aligned, etc.)
- Color usage is consistent (same red for all errors, same blue for all links)

### 5. Error Prevention
Even better than good error messages is a careful design that prevents errors in the first place.

**Form checklist:**
- Input masks for formatted fields (phone, SSN, credit card, zip code)
- Constrained inputs where possible (dropdowns instead of free text for known options)
- Date pickers instead of free-text date entry
- Min/max constraints on numeric inputs with stepper controls
- Disabled submit button until required fields are filled
- Real-time format validation as user types (email, URL patterns)
- Confirmation field for critical inputs (password, email)

### 6. Recognition Over Recall
Minimize the user's memory load by making objects, actions, and options visible.

**Form checklist:**
- Placeholder text hints at expected format
- Help text visible near fields (not hidden behind clicks)
- Autocomplete/typeahead for fields with many options
- Previously entered values shown (edit mode pre-population)
- Section headings that describe what information is needed
- Inline examples or format hints (e.g., "MM/DD/YYYY")

### 7. Flexibility and Efficiency
Accelerators for expert users without confusing novices.

**Form checklist:**
- Keyboard navigation works (Tab order, Enter to submit)
- Copy-paste friendly inputs (no overly aggressive masking)
- "Fill from previous" or "Same as above" shortcuts for repeated data
- Autocomplete/autofill compatible (`name`, `email`, `tel` input attributes)
- Bulk operations for array fields (add multiple, import from CSV)
- Progressive disclosure — advanced fields hidden until needed

### 8. Aesthetic and Minimalist Design
Every extra unit of information competes with relevant information and diminishes visibility.

**Form checklist:**
- Only show fields that are needed (use conditional visibility)
- Group related fields into logical sections
- Use whitespace effectively — not cramped, not wastefully spread
- Avoid decorative elements that don't serve a function
- Help text is concise and scannable
- Error messages are specific and actionable (not "Invalid input")

### 9. Error Recovery
Help users recognize, diagnose, and recover from errors.

**Form checklist:**
- Error messages precisely identify the problem field
- Error messages suggest how to fix the issue (not just "Invalid")
- Inline errors appear next to the field, not just in a summary
- After submission failure, scroll to / focus the first error field
- Don't clear valid fields when the form has errors
- Server-side errors are mapped to specific fields where possible

### 10. Help and Documentation
Provide help and documentation that is easy to search and focused on the user's task.

**Form checklist:**
- Tooltip icons (?) for fields that need explanation
- Inline help text below complex fields
- Links to detailed documentation for complex requirements
- Contextual help that appears only when relevant
- Examples of valid input near the field

### 11. Affordances and Signifiers
Interactive elements should look interactive. Non-interactive elements should not.

**Form checklist:**
- Buttons look clickable (raised, colored, hover effects)
- Disabled fields are visually distinct (grayed out, cursor: not-allowed)
- Required field indicators are visible and consistent
- Drag handles are visible on reorderable array items
- File drop zones have clear visual boundaries and hover states
- Links are visually distinct from plain text

### 12. Structure
Information should be organized in meaningful and useful ways.

**Form checklist:**
- Related fields are grouped in labeled sections
- Sections follow a logical flow (personal info before professional, etc.)
- Multi-step forms have a visible step indicator
- Complex forms use visual hierarchy (headings, subheadings, dividers)
- Array items have clear boundaries (cards, borders)
- Long option lists are categorized or grouped

### 13. Accessibility
The form must be usable by people with diverse abilities.

**Form checklist:**
- All fields have associated `<label>` elements (not just placeholder text)
- ARIA attributes on custom widgets (`aria-required`, `aria-invalid`, `aria-describedby`)
- Color is not the only indicator of state (add icons or text to errors)
- Focus indicators are visible (not removed for aesthetics)
- Minimum touch target size: 44x44px
- Screen reader friendly error announcements (`aria-live` regions)
- Sufficient color contrast (WCAG AA: 4.5:1 for text, 3:1 for UI elements)
- Keyboard operable — all interactions reachable without a mouse

### 14. Perceptibility
Information should be presentable to users in ways they can perceive.

**Form checklist:**
- Text is legible (minimum 14px body, 16px inputs)
- Sufficient contrast between labels, inputs, and backgrounds
- Icons have text labels or aria-labels (not icon-only buttons)
- Error states use both color AND icon/text indicators
- Focus ring is clearly visible against the background
- Section boundaries are visually distinct (borders, backgrounds, or spacing)

### 15. Tolerance and Forgiveness
The design should be flexible and forgiving of user mistakes.

**Form checklist:**
- Accept multiple input formats where possible (e.g., "1234567890" and "(123) 456-7890" for phone)
- Trim whitespace on text inputs before validation
- Case-insensitive validation where appropriate (email)
- Don't reset the entire form on a single field error
- Allow partial saves on long forms
- Graceful handling of network failures during submission (retry, not data loss)

---

## How to Use This Reference

### During Phase 1.5 (Suggestions)
When analyzing requirements for UI/UX enhancement opportunities, check whether the current spec violates any of these 15 principles. Prioritize suggestions that address accessibility (#13), error prevention (#5), and error recovery (#9) — these have the highest user impact.

### During Phase 2 (Planning)
After assembling the FormPlan, verify the layout decisions against principles #4 (consistency), #8 (minimalist design), #12 (structure), and #13 (accessibility). Flag any violations before approval.

### During Phase 4 (Code Generation)
Use the "Form checklist" items as a verification pass on generated code. Every generated form should satisfy the applicable items from all 15 principles. The Step 8 verification checklist should include a design audit pass.
