import { useState } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import type { IChangeEvent, ObjectFieldTemplateProps } from '@rjsf/utils';
import {
  Box, Paper, Typography, Divider, Button,
  Alert, AlertTitle, Collapse, CircularProgress, IconButton,
} from '@mui/material';
import { schema, uiSchema } from '../shared-schema';
import type { EmployeeFormData } from '../shared-schema';
import { responsiveGridColumns } from '../grid-helper';

/* ─── Section Template ──────────────────────────────────────────────────────── */

const SECTION_COLUMNS: Record<string, number> = {
  'Personal Information': 3,
  'Address': 2,
  'Emergency Contact': 4,
  'Employment Details': 2,
};

const FULL_WIDTH_FIELDS = new Set(['street', 'bio', 'agreeToTerms', 'gender']);

function SectionTemplate(props: ObjectFieldTemplateProps) {
  const { title, description, properties } = props;
  const columns = (title && SECTION_COLUMNS[title]) ?? 0;

  if (!columns) {
    return <>{properties.map((p) => p.content)}</>;
  }

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
          sx={{ fontWeight: 600, color: 'text.primary', px: 1, fontSize: '1rem' }}
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
          gridTemplateColumns: responsiveGridColumns(columns),
          gap: { xs: '12px 16px', md: '16px 24px' },
        }}
      >
        {properties.map((prop) =>
          prop.hidden ? null : (
            <Box
              key={prop.name}
              sx={{
                gridColumn: FULL_WIDTH_FIELDS.has(prop.name) ? '1 / -1' : undefined,
                minWidth: 0,
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

/* ─── Main Form ─────────────────────────────────────────────────────────────── */

const templates = { ObjectFieldTemplate: SectionTemplate };

export function MuiEmployeeForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (_data: IChangeEvent<EmployeeFormData>) => {
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <Box sx={{ maxWidth: 960, mx: 'auto', py: 4, px: 2 }}>
        <Paper
          sx={{
            p: 6, borderRadius: 3, textAlign: 'center',
            border: '1px solid', borderColor: 'grey.200',
          }}
        >
          <Box
            sx={{
              width: 72, height: 72, borderRadius: '50%', bgcolor: '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
            }}
          >
            <Typography sx={{ fontSize: 40, color: '#16a34a', lineHeight: 1 }}>&#10003;</Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Onboarding Complete</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            The employee record has been created successfully.
          </Typography>
          <Button variant="outlined" onClick={() => setStatus('idle')}>
            Submit Another
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', py: 4, px: 2 }}>
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
          Complete the form below to finalize the onboarding process.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Collapse in={status === 'error'}>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <IconButton size="small" onClick={() => setStatus('idle')}>
                <span style={{ fontSize: 16 }}>&times;</span>
              </IconButton>
            }
          >
            <AlertTitle sx={{ fontWeight: 600 }}>Submission Failed</AlertTitle>
            Please fix the errors below and try again.
          </Alert>
        </Collapse>

        <Form<EmployeeFormData>
          schema={schema}
          uiSchema={uiSchema}
          validator={validator}
          templates={templates}
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
              variant="outlined"
              size="large"
              sx={{
                px: 3, borderRadius: 2, textTransform: 'none', fontWeight: 500,
                borderColor: 'grey.300', color: 'text.secondary',
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
              startIcon={status === 'loading' ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{
                px: 5, py: 1.25, borderRadius: 2, textTransform: 'none',
                fontWeight: 600, fontSize: '0.95rem',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)' },
              }}
            >
              {status === 'loading' ? 'Submitting...' : 'Complete Onboarding'}
            </Button>
          </Box>
        </Form>
      </Paper>
    </Box>
  );
}
