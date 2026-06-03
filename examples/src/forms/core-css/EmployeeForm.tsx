import { useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import type { IChangeEvent, ObjectFieldTemplateProps } from '@rjsf/utils';
import { schema, uiSchema } from '../shared-schema';
import type { EmployeeFormData } from '../shared-schema';
import { responsiveGridColumns } from '../grid-helper';
import './rjsf-overrides.css';
import styles from './EmployeeForm.module.css';

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
    <fieldset className={styles.section}>
      {title && <legend className={styles.sectionTitle}>{title}</legend>}
      {description && <p className={styles.sectionDescription}>{description}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: responsiveGridColumns(columns), gap: '16px 24px' }}>
        {properties.map((prop) =>
          prop.hidden ? null : (
            <div
              key={prop.name}
              style={{
                gridColumn: FULL_WIDTH_FIELDS.has(prop.name) ? '1 / -1' : undefined,
                minWidth: 0,
              }}
            >
              {prop.content}
            </div>
          ),
        )}
      </div>
    </fieldset>
  );
}

/* ─── Main Form ─────────────────────────────────────────────────────────────── */

const templatesProp = { ObjectFieldTemplate: SectionTemplate };

export function CoreCssEmployeeForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (_data: IChangeEvent<EmployeeFormData>) => {
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className={styles.successPage}>
        <div className={styles.successIcon}>&#10003;</div>
        <h2 className={styles.successTitle}>Onboarding Complete</h2>
        <p className={styles.successMessage}>
          The employee record has been created successfully.
        </p>
        <button className={styles.outlineBtn} onClick={() => setStatus('idle')}>
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      <h1 className={styles.formTitle}>Employee Onboarding</h1>
      <p className={styles.formSubtitle}>
        Complete the form below to finalize the onboarding process.
      </p>
      <hr className={styles.divider} />

      {status === 'error' && (
        <div className={styles.alertError}>
          <span className={styles.alertIcon}>&#10007;</span>
          <div>
            <p className={styles.alertTitle}>Submission Failed</p>
            <p className={styles.alertMessage}>Please fix the errors below and try again.</p>
          </div>
          <button className={styles.alertClose} onClick={() => setStatus('idle')}>&times;</button>
        </div>
      )}

      <div className="core-css-form-wrapper">
        <Form<EmployeeFormData>
          schema={schema}
          uiSchema={uiSchema}
          validator={validator}
          templates={templatesProp}
          noHtml5Validate
          omitExtraData
          onSubmit={handleSubmit}
          showErrorList={false}
        >
          <div className={styles.actions}>
            <button type="button" className={styles.outlineBtn}>Save Draft</button>
            <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
              {status === 'loading' && <span className={styles.spinner} />}
              {status === 'loading' ? 'Submitting...' : 'Complete Onboarding'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
