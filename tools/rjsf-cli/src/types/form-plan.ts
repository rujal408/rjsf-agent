export type StylingApproach =
  | 'css-modules'
  | 'scss'
  | 'tailwind'
  | 'plain-css'
  | 'chakra'
  | 'bare'
  | 'mui-grid'
  | 'antd-grid'
  | 'bootstrap-grid';

export type RjsfTheme =
  | '@rjsf/core'
  | '@rjsf/mui'
  | '@rjsf/antd'
  | '@rjsf/bootstrap';

export type SchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object';

export type FieldWidth = 'full' | 'half' | 'quarter';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

export interface ConditionalRule {
  triggerField: string;
  triggerValue: string | boolean | number;
  operator?: 'eq' | 'neq' | 'in';
  triggerValues?: (string | boolean | number)[];
}

export interface FormField {
  key: string;
  label: string;
  schemaType: SchemaType;
  format?: string;
  widget: string;
  width: FieldWidth;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  validation?: FieldValidation;
  options?: FieldOption[];
  uiSchemaHints?: Record<string, unknown>;
  customComponent?: string;
  conditional?: ConditionalRule;
  computed?: boolean;
  computeExpression?: string;
  properties?: FormField[];
  items?: FormField;
}

export interface ResponsiveColumns {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface FormSection {
  key: string;
  title: string;
  description?: string;
  columns: ResponsiveColumns;
  fields: FormField[];
}

export interface StepDefinition {
  key: string;
  title: string;
  sectionKeys: string[];
  validatesOnNext: boolean;
}

export interface CustomComponentDef {
  name: string;
  forField?: string;
  reason: string;
  rjsfApi: string;
}

export interface CustomizationAssessment {
  standardFields: string[];
  widgets: CustomComponentDef[];
  fields: CustomComponentDef[];
  templates: CustomComponentDef[];
}

export interface AsyncFieldDef {
  fieldKey: string;
  asyncType: 'options-from-api' | 'validation-on-blur';
  trigger: string;
  endpointHint: string;
  dependsOnField?: string;
}

export interface EdgeCaseFlags {
  errorDisplay: 'inline' | 'both' | 'top';
  responsive: boolean;
  editMode: boolean;
  draftSave: boolean;
  serverErrorMapping: boolean;
  asyncOptions: boolean;
  asyncFieldValidation: boolean;
  viewMode: boolean;
  i18n: boolean;
  printExport: boolean;
  arrayReorder: boolean;
  nestedArrays: boolean;
  computedFields: boolean;
  roleBased: boolean;
  maskedInput: boolean;
  richText: boolean;
  fileUploadServer: boolean;
  tabLayout: boolean;
  multiStep: boolean;
  crossFieldValidation: boolean;
}

export interface FormPlanJSON {
  formName: string;
  formTitle: string;
  formSubtitle?: string;
  generatedDate: string;
  stylingApproach: StylingApproach;
  rjsfTheme: RjsfTheme;
  multiStep: boolean;
  responsive: boolean;
  sections: FormSection[];
  steps?: StepDefinition[];
  customization: CustomizationAssessment;
  asyncFields?: AsyncFieldDef[];
  edgeCaseFlags: EdgeCaseFlags;
}
