import { useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import type { IChangeEvent, ObjectFieldTemplateProps } from '@rjsf/utils';
import { schema, uiSchema } from '../shared-schema';
import type { EmployeeFormData } from '../shared-schema';
import { responsiveGridColumns } from '../grid-helper';
import './rjsf-overrides.css';

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
    <fieldset className="border border-base-200 rounded-2xl p-4 md:p-5 mb-5 bg-base-200/30 hover:border-base-300 transition-colors">
      {title && (
        <legend className="text-sm font-semibold text-base-content px-2">
          {title}
        </legend>
      )}
      {description && (
        <p className="text-sm text-base-content/60 mb-3">{description}</p>
      )}
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

const templates = { ObjectFieldTemplate: SectionTemplate };

export function DaisyUiEmployeeForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (_data: IChangeEvent<EmployeeFormData>) => {
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="card bg-base-100 border border-base-200 p-8 text-center">
          <div className="w-[72px] h-[72px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Onboarding Complete</h2>
          <p className="text-base-content/60 mb-5">
            The employee record has been created successfully.
          </p>
          <button className="btn btn-outline btn-primary" onClick={() => setStatus('idle')}>
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6 md:p-10">
          <h1 className="card-title text-xl font-bold">Employee Onboarding</h1>
          <p className="text-sm text-base-content/60 -mt-1">
            Complete the form below to finalize the onboarding process.
          </p>
          <div className="divider mt-2 mb-4" />

          {status === 'error' && (
            <div className="alert alert-error mb-5 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-sm">Submission Failed</h3>
                <p className="text-xs">Please fix the errors below and try again.</p>
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => setStatus('idle')}>X</button>
            </div>
          )}

          <div className="daisyui-form-wrapper">
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
              <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-base-200">
                <button type="button" className="btn btn-outline btn-lg">
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg px-10"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' && <span className="loading loading-spinner loading-sm" />}
                  {status === 'loading' ? 'Submitting...' : 'Complete Onboarding'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
