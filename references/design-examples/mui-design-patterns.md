# MUI (Material UI) Design Patterns for RJSF Forms

Production-quality UI/UX patterns using `@rjsf/mui` theme with MUI v5+ components.
Use these as reference when generating forms with `rjsfTheme: "@rjsf/mui"`.

> **CRITICAL:** When using `@rjsf/mui`, NEVER apply CSS to raw `input`, `select`, or `textarea` elements. MUI wraps these in styled components (`MuiOutlinedInput-root`, `MuiSelect-select`, etc.). Raw element CSS breaks click/type interactions. Always use `.Mui*` class selectors.

---

## 1. Form Card Container

Wrap every form in a centered, elevated card with proper padding and max-width.

```tsx
import { Box, Paper, Typography, Divider } from '@mui/material';

function FormCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ maxWidth: 780, mx: 'auto', py: 4, px: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {subtitle}
          </Typography>
        )}
        <Divider sx={{ mb: 3 }} />
        {children}
      </Paper>
    </Box>
  );
}
```

---

## 2. Section Grouping Styles

### Style A: Bordered Card Sections (recommended)

```tsx
import { Box, Typography, Divider } from '@mui/material';
import type { ObjectFieldTemplateProps } from '@rjsf/utils';

const SECTION_COLUMNS: Record<string, number> = {
  personalInfo: 2,
  addressInfo: 2,
  preferences: 1,
};

const FULL_WIDTH_FIELDS = new Set(['bio', 'description', 'address']);

export function SectionTemplate(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const columns = SECTION_COLUMNS[sectionKey] ?? 1;

  return (
    <Box
      component="fieldset"
      sx={{
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 2.5,
        p: { xs: 2.5, md: 3 },
        mb: 3,
        bgcolor: 'grey.50',
        '&:hover': { borderColor: 'grey.300' },
        transition: 'border-color 0.2s',
      }}
    >
      {title && (
        <Typography
          component="legend"
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            px: 1,
            fontSize: '1rem',
          }}
        >
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, mt: 0.5 }}>
          {description}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: columns >= 2 ? 'repeat(2, 1fr)' : '1fr',
            lg: `repeat(${columns}, 1fr)`,
          },
          gap: { xs: '12px 16px', md: '16px 24px' },
        }}
      >
        {properties.map((prop) =>
          prop.hidden ? null : (
            <Box
              key={prop.name}
              sx={{
                gridColumn: FULL_WIDTH_FIELDS.has(prop.name) ? '1 / -1' : undefined,
              }}
            >
              {prop.content}
            </Box>
          ),
        )}
      </Box>
    </Box>
  );
}
```

### Style B: Flat Divider Sections (minimal)

```tsx
export function FlatDividerSection(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const columns = SECTION_COLUMNS[sectionKey] ?? 1;

  return (
    <Box sx={{ mb: 4 }}>
      {title && (
        <>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              letterSpacing: 1.2,
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          <Divider sx={{ mb: 2, borderColor: 'primary.light', borderWidth: 1.5 }} />
        </>
      )}
      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {description}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: columns >= 2 ? 'repeat(2, 1fr)' : '1fr',
            lg: `repeat(${columns}, 1fr)`,
          },
          gap: '16px 24px',
        }}
      >
        {properties.map((prop) =>
          prop.hidden ? null : (
            <Box
              key={prop.name}
              sx={{
                gridColumn: FULL_WIDTH_FIELDS.has(prop.name) ? '1 / -1' : undefined,
              }}
            >
              {prop.content}
            </Box>
          ),
        )}
      </Box>
    </Box>
  );
}
```

### Style C: Color-Banded Header Sections

```tsx
export function ColorBandedSection(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const columns = SECTION_COLUMNS[sectionKey] ?? 1;

  return (
    <Box
      sx={{
        mb: 3,
        borderRadius: 2.5,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      {title && (
        <Box
          sx={{
            bgcolor: 'primary.main',
            px: 3,
            py: 1.5,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.25 }}>
              {description}
            </Typography>
          )}
        </Box>
      )}
      <Box sx={{ p: { xs: 2.5, md: 3 }, bgcolor: '#fff' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: columns >= 2 ? 'repeat(2, 1fr)' : '1fr',
              lg: `repeat(${columns}, 1fr)`,
            },
            gap: '16px 24px',
          }}
        >
          {properties.map((prop) =>
            prop.hidden ? null : (
              <Box
                key={prop.name}
                sx={{
                  gridColumn: FULL_WIDTH_FIELDS.has(prop.name) ? '1 / -1' : undefined,
                }}
              >
                {prop.content}
              </Box>
            ),
          )}
        </Box>
      </Box>
    </Box>
  );
}
```

---

## 3. MUI CSS Overrides (`rjsf-overrides.css`)

```css
/* rjsf-overrides.css — MUI theme polish */

/* Form card container */
.rjsf-form-card {
  max-width: 780px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 32px 40px;
}

@media (max-width: 640px) {
  .rjsf-form-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
}

/* MUI TextField overrides for visual consistency */
.rjsf .MuiTextField-root {
  margin-bottom: 0;
}

.rjsf .MuiInputBase-root {
  border-radius: 8px;
  background: #fafbfc;
  transition: background 0.2s, border-color 0.2s;
}

.rjsf .MuiInputBase-root:hover {
  background: #f5f6f8;
}

.rjsf .MuiInputBase-root.Mui-focused {
  background: #fff;
}

.rjsf .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
  border-width: 2px;
}

/* Label styling */
.rjsf .MuiFormLabel-root {
  font-weight: 500;
  font-size: 0.875rem;
}

/* Help text */
.rjsf .MuiFormHelperText-root {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 4px;
  margin-left: 2px;
}

/* Error text */
.rjsf .MuiFormHelperText-root.Mui-error {
  color: #dc2626;
  font-weight: 500;
}

/* Required asterisk */
.rjsf .MuiFormLabel-asterisk {
  color: #dc2626;
}

/* Radio/Checkbox inline styling */
.rjsf .MuiFormGroup-row {
  gap: 16px;
}

/* Select placeholder */
.rjsf .MuiSelect-select[aria-expanded="false"]:has(option[value=""]:checked) {
  color: #9ca3af;
}

/* Fieldset (section) borders */
.rjsf fieldset.MuiFormControl-root {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
}
```

---

## 4. Submit Button Patterns

### Style A: Right-Aligned Primary

```tsx
import { Box, Button, CircularProgress } from '@mui/material';

<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
  <Button
    type="submit"
    variant="contained"
    size="large"
    disabled={status === 'loading'}
    startIcon={status === 'loading' ? <CircularProgress size={18} color="inherit" /> : undefined}
    sx={{
      px: 5,
      py: 1.25,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.95rem',
      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
      '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)' },
    }}
  >
    {status === 'loading' ? 'Submitting...' : 'Submit Application'}
  </Button>
</Box>
```

### Style B: Full-Width Primary

```tsx
<Box sx={{ mt: 4 }}>
  <Button
    type="submit"
    variant="contained"
    size="large"
    fullWidth
    disabled={status === 'loading'}
    sx={{
      py: 1.5,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
    }}
  >
    {status === 'loading' ? 'Processing...' : 'Submit'}
  </Button>
</Box>
```

### Style C: Split Save Draft + Submit

```tsx
<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
  <Button
    type="button"
    variant="outlined"
    size="large"
    onClick={handleSaveDraft}
    sx={{
      px: 3,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 500,
      borderColor: 'grey.300',
      color: 'text.secondary',
      '&:hover': { borderColor: 'grey.400', bgcolor: 'grey.50' },
    }}
  >
    Save Draft
  </Button>
  <Button
    type="submit"
    variant="contained"
    size="large"
    disabled={status === 'loading'}
    sx={{
      px: 5,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
    }}
  >
    Submit
  </Button>
</Box>
```

---

## 5. Step Indicator (Multi-Step Wizard)

```tsx
import { Box, Stepper, Step, StepLabel, Typography } from '@mui/material';

interface StepIndicatorProps {
  steps: { key: string; title: string }[];
  currentStep: number;
}

function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Stepper
        activeStep={currentStep}
        alternativeLabel
        sx={{
          '& .MuiStepLabel-label': {
            fontSize: '0.85rem',
            fontWeight: 500,
            mt: 1,
          },
          '& .MuiStepLabel-label.Mui-active': {
            fontWeight: 700,
            color: 'primary.main',
          },
          '& .MuiStepLabel-label.Mui-completed': {
            color: 'success.main',
          },
          '& .MuiStepIcon-root': {
            width: 32,
            height: 32,
          },
          '& .MuiStepConnector-line': {
            borderTopWidth: 2,
          },
        }}
      >
        {steps.map((step) => (
          <Step key={step.key}>
            <StepLabel>{step.title}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
```

---

## 6. Step Navigation Buttons

```tsx
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.100' }}>
  <Button
    variant="text"
    onClick={() => setCurrentStep((s) => s - 1)}
    disabled={currentStep === 0}
    startIcon={<ArrowBackIcon />}
    sx={{ textTransform: 'none', fontWeight: 500, color: 'text.secondary' }}
  >
    Back
  </Button>
  <Button
    type="submit"
    variant="contained"
    endIcon={isLastStep ? undefined : <ArrowForwardIcon />}
    sx={{
      px: 4,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
    }}
  >
    {isLastStep ? 'Submit' : 'Continue'}
  </Button>
</Box>
```

---

## 7. Success / Error Alerts

```tsx
import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

{/* Success */}
<Collapse in={status === 'success'}>
  <Alert
    severity="success"
    sx={{ mb: 3, borderRadius: 2, alignItems: 'center' }}
    action={
      <IconButton size="small" onClick={() => setStatus('idle')}>
        <CloseIcon fontSize="small" />
      </IconButton>
    }
  >
    <AlertTitle sx={{ fontWeight: 600, mb: 0.25 }}>Success</AlertTitle>
    Your form has been submitted successfully.
  </Alert>
</Collapse>

{/* Error */}
<Collapse in={status === 'error'}>
  <Alert
    severity="error"
    sx={{ mb: 3, borderRadius: 2 }}
    action={
      <IconButton size="small" onClick={() => setStatus('idle')}>
        <CloseIcon fontSize="small" />
      </IconButton>
    }
  >
    <AlertTitle sx={{ fontWeight: 600, mb: 0.25 }}>Submission Failed</AlertTitle>
    Please check the errors below and try again.
  </Alert>
</Collapse>
```

---

## 8. Empty Array State

```tsx
import { Box, Typography, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function EmptyArrayState({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <Box
      sx={{
        py: 5,
        px: 3,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'grey.300',
        borderRadius: 2.5,
        bgcolor: 'grey.50',
      }}
    >
      <AddCircleOutlineIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1.5 }} />
      <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
        No {label} added yet
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.disabled', mb: 2.5 }}>
        Click the button below to add your first item.
      </Typography>
      <Button
        variant="outlined"
        startIcon={<AddCircleOutlineIcon />}
        onClick={onAdd}
        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 500 }}
      >
        Add {label}
      </Button>
    </Box>
  );
}
```

---

## 9. Array Item Card

```tsx
import { Box, IconButton, Typography, Chip } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

function ArrayItemCard({
  index,
  children,
  onRemove,
  canRemove,
  isDragging,
  dragListeners,
}: {
  index: number;
  children: React.ReactNode;
  onRemove: () => void;
  canRemove: boolean;
  isDragging?: boolean;
  dragListeners?: Record<string, unknown>;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        p: 2,
        mb: 1.5,
        bgcolor: isDragging ? 'primary.50' : '#fff',
        border: '1px solid',
        borderColor: isDragging ? 'primary.200' : 'grey.200',
        borderRadius: 2,
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: 'grey.300', bgcolor: 'grey.25' },
      }}
    >
      {/* Drag handle */}
      <IconButton
        size="small"
        sx={{ cursor: 'grab', color: 'grey.400', mt: 0.5, flexShrink: 0 }}
        aria-label="Drag to reorder"
        {...dragListeners}
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>

      {/* Item number badge */}
      <Chip
        label={index + 1}
        size="small"
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: 'primary.50',
          color: 'primary.main',
          fontWeight: 700,
          fontSize: '0.8rem',
          mt: 0.5,
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>

      {/* Remove button */}
      {canRemove && (
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            color: 'grey.400',
            mt: 0.5,
            flexShrink: 0,
            '&:hover': { color: 'error.main', bgcolor: 'error.50' },
          }}
          aria-label="Remove item"
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
```

---

## 10. Complete Form Example — Employee Onboarding (MUI)

```tsx
import { useState } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import type { IChangeEvent, ErrorSchema } from '@rjsf/utils';
import {
  Box, Paper, Typography, Divider, Button,
  Alert, AlertTitle, Collapse, CircularProgress,
} from '@mui/material';
import { schema } from './schema';
import { uiSchema } from './uiSchema';
import type { EmployeeOnboardingData } from './types';
import { SectionTemplate } from './templates/SectionTemplate';
import './rjsf-overrides.css';

const templates = { ObjectFieldTemplate: SectionTemplate };

interface Props {
  formData?: Partial<EmployeeOnboardingData>;
  onSubmit: (data: EmployeeOnboardingData) => Promise<void>;
  onError?: (errors: unknown) => void;
}

export function EmployeeOnboardingForm({ formData, onSubmit, onError }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverErrors, setServerErrors] = useState<ErrorSchema<EmployeeOnboardingData>>(
    {} as ErrorSchema<EmployeeOnboardingData>,
  );

  const handleSubmit = async (data: IChangeEvent<EmployeeOnboardingData>) => {
    if (!data.formData) return;
    setStatus('loading');
    setServerErrors({} as ErrorSchema<EmployeeOnboardingData>);
    try {
      await onSubmit(data.formData);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      if (err && typeof err === 'object' && 'fieldErrors' in err) {
        const fe = (err as { fieldErrors: Record<string, string> }).fieldErrors;
        const es: Record<string, { __errors: string[] }> = {};
        for (const [field, msg] of Object.entries(fe)) {
          es[field] = { __errors: [msg] };
        }
        setServerErrors(es as ErrorSchema<EmployeeOnboardingData>);
      }
      onError?.(err);
    }
  };

  if (status === 'success') {
    return (
      <Box sx={{ maxWidth: 780, mx: 'auto', py: 4, px: 2 }}>
        <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center', border: '1px solid', borderColor: 'grey.200' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'success.50', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Typography sx={{ fontSize: 32, color: 'success.main' }}>&#10003;</Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Onboarding Complete</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            The employee record has been created successfully.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 780, mx: 'auto', py: 4, px: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Employee Onboarding
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Fill in the details below to complete the onboarding process.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Collapse in={status === 'error'}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 600 }}>Submission Failed</AlertTitle>
            Please fix the errors below and try again.
          </Alert>
        </Collapse>

        <Form<EmployeeOnboardingData>
          schema={schema}
          uiSchema={uiSchema}
          validator={validator}
          formData={formData}
          templates={templates}
          extraErrors={serverErrors}
          noHtml5Validate
          omitExtraData
          onSubmit={handleSubmit}
          showErrorList={false}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              mt: 4,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={status === 'loading'}
              startIcon={status === 'loading' ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{
                px: 5,
                py: 1.25,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
              }}
            >
              {status === 'loading' ? 'Submitting...' : formData ? 'Save Changes' : 'Complete Onboarding'}
            </Button>
          </Box>
        </Form>
      </Paper>
    </Box>
  );
}
```

---

## Design Token Reference (MUI)

| Token | Value | Usage |
|-------|-------|-------|
| Card border-radius | `16px` (borderRadius: 3) | Form container |
| Section border-radius | `12px` (borderRadius: 2.5) | Section fieldsets |
| Input border-radius | `8px` | All text inputs, selects |
| Button border-radius | `8px` (borderRadius: 2) | Submit, nav buttons |
| Card padding | `32px 40px` (p: 5) desktop, `20px 16px` (p: 3) mobile | Form container |
| Grid gap | `16px 24px` | Between fields |
| Section margin-bottom | `24px` (mb: 3) | Between sections |
| Input min-height | `44px` | WCAG touch target |
| Input background | `#fafbfc` idle, `#f5f6f8` hover, `#fff` focus | TextField |
| Title font-size | `1.5rem` (h5) | Form heading |
| Section title font-size | `1rem` (subtitle1) | Section headings |
| Label font-size | `0.875rem` | Field labels |
| Help text font-size | `0.8rem` | Below-field hints |
| Primary color | MUI default `#1976d2` | Buttons, focus rings, links |
| Error color | `#dc2626` | Validation errors, required asterisk |
| Text primary | `#1f2937` | Headings, input text |
| Text secondary | `#6b7280` | Subtitles, help text, descriptions |
