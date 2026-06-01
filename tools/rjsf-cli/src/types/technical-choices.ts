export interface TechnicalChoices {
  schemaVersion?: 'draft-07' | 'draft-2020-12' | 'draft-2019-09';
  validator?: 'ajv8' | 'yup';
  validationTiming?: 'onSubmit' | 'onBlur' | 'live';
  html5Validation?: boolean;
  omitExtraData?: boolean;
  submissionPattern?: 'async-loading' | 'sync' | 'optimistic' | 'callback-only';
  successBehavior?: 'inline-message' | 'callback' | 'reset';
  serverErrorShape?: 'flat-record' | 'nested-object' | 'custom-transformer';
  draftSaveInterval?: number;
  formWrapper?: 'centered-card' | 'full-width' | 'no-wrapper';
  breakpoints?: 'standard' | 'bootstrap' | 'custom';
  touchTargetSize?: '44px' | '36px' | '48px';
  gridGap?: 'default' | 'compact' | 'spacious';
  colorPalette?: 'neutral' | 'match-theme' | 'custom';
  typeStyle?: 'per-section' | 'flat' | 'zod';
  conditionalApproach?: 'if-then-else' | 'dependencies' | 'allOf';
  formStateManagement?: 'local-hooks' | 'context' | 'external';
  formContextUsage?: 'disabled' | 'enabled';
  // Custom values when breakpoints === 'custom'
  customTabletBreakpoint?: string;
  customDesktopBreakpoint?: string;
  // Custom values when colorPalette === 'custom'
  customBorderColor?: string;
  customFocusColor?: string;
  customErrorColor?: string;
  customPrimaryColor?: string;
}

export const DEFAULTS: Required<Pick<TechnicalChoices,
  | 'schemaVersion' | 'validator' | 'validationTiming' | 'html5Validation'
  | 'omitExtraData' | 'submissionPattern' | 'successBehavior' | 'serverErrorShape'
  | 'draftSaveInterval' | 'formWrapper' | 'breakpoints' | 'touchTargetSize'
  | 'gridGap' | 'colorPalette' | 'typeStyle' | 'conditionalApproach'
  | 'formStateManagement' | 'formContextUsage'
>> = {
  schemaVersion: 'draft-07',
  validator: 'ajv8',
  validationTiming: 'onSubmit',
  html5Validation: true,
  omitExtraData: false,
  submissionPattern: 'async-loading',
  successBehavior: 'inline-message',
  serverErrorShape: 'flat-record',
  draftSaveInterval: 30,
  formWrapper: 'centered-card',
  breakpoints: 'standard',
  touchTargetSize: '44px',
  gridGap: 'default',
  colorPalette: 'neutral',
  typeStyle: 'per-section',
  conditionalApproach: 'if-then-else',
  formStateManagement: 'local-hooks',
  formContextUsage: 'disabled',
};
