# Design Examples Reference

Framework-specific UI/UX design patterns for RJSF form generation. Each file contains production-ready component examples, CSS patterns, and design tokens that Phase 4 should reference when generating polished forms.

## Files

| File | Framework | When to Use |
|------|-----------|-------------|
| [mui-design-patterns.md](./mui-design-patterns.md) | MUI (Material UI) v5+ | `rjsfTheme: "@rjsf/mui"` |
| [chakra-design-patterns.md](./chakra-design-patterns.md) | Chakra UI | `stylingApproach: "chakra"` |
| [daisyui-design-patterns.md](./daisyui-design-patterns.md) | DaisyUI + Tailwind CSS | `stylingApproach: "tailwind"` with DaisyUI |
| [core-css-design-patterns.md](./core-css-design-patterns.md) | Plain CSS / CSS Modules / SCSS | `rjsfTheme: "@rjsf/core"` with `css-modules`, `scss`, or `plain-css` |

## What Each File Covers

Every design patterns file includes these sections:

1. **Form Card Container** — Centered card wrapper with proper padding, border-radius, shadow
2. **Section Grouping (3 styles)** — Bordered cards (A), flat dividers (B), color-banded headers (C)
3. **CSS Overrides** — Complete `rjsf-overrides.css` content for the framework
4. **Submit Button (3 styles)** — Right-aligned (A), full-width (B), split draft+submit (C)
5. **Step Indicator** — Multi-step wizard progress indicator
6. **Step Navigation** — Back/Next buttons for wizard forms
7. **Success / Error Alerts** — Status feedback after submission
8. **Empty Array State** — Illustrated placeholder with add CTA
9. **Array Item Card** — Drag-handle, numbered badge, remove button
10. **Complete Form Example** — Full working component end-to-end
11. **Design Token Reference** — Colors, spacing, typography, border-radius values

## How Phase 4 Uses These

When generating code in Phase 4 (rjsf-execute), read the appropriate design patterns file based on the session's `rjsfTheme` and `stylingApproach`. Use the patterns as the visual baseline for:

- `rjsf-overrides.css` content
- `templates/SectionTemplate.tsx` component structure and styling
- `index.tsx` form wrapper, alerts, success state, and button bar
- Array templates (empty state, item cards, drag handles)
- Step indicator components (for multi-step forms)

The design tokens table at the bottom of each file provides the exact values (colors, spacing, radii, font sizes) to use across all generated files.
