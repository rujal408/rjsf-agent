import type { TechnicalChoices } from '../types/technical-choices.js';
import { DEFAULTS } from '../types/technical-choices.js';
import type { Session } from '../types/session.js';

export interface ResolvedChoices {
  schemaVersion: string;
  validator: string;
  validationTiming: string;
  html5Validation: boolean;
  omitExtraData: boolean;
  submissionPattern: string;
  successBehavior: string;
  serverErrorShape: string;
  draftSaveInterval: number;
  formWrapper: string;
  touchTargetSize: string;
  gridGap: { row: string; column: string };
  colorPalette: { border: string; focus: string; error: string; primary: string };
  breakpoints: { tablet: string; desktop: string };
  typeStyle: string;
  conditionalApproach: string;
  formStateManagement: string;
  formContextUsage: string;
}

function resolveGridGap(gap: string): { row: string; column: string } {
  switch (gap) {
    case 'compact':
      return { row: '8px', column: '16px' };
    case 'spacious':
      return { row: '24px', column: '32px' };
    default:
      return { row: '16px', column: '24px' };
  }
}

function resolveColorPalette(
  palette: string,
  choices: TechnicalChoices
): { border: string; focus: string; error: string; primary: string } {
  if (palette === 'custom') {
    return {
      border: choices.customBorderColor ?? '#d1d5db',
      focus: choices.customFocusColor ?? '#2563eb',
      error: choices.customErrorColor ?? '#dc2626',
      primary: choices.customPrimaryColor ?? '#2563eb',
    };
  }
  // neutral and match-theme both use the standard palette
  return {
    border: '#d1d5db',
    focus: '#2563eb',
    error: '#dc2626',
    primary: '#2563eb',
  };
}

function resolveBreakpoints(
  bp: string,
  choices: TechnicalChoices
): { tablet: string; desktop: string } {
  switch (bp) {
    case 'bootstrap':
      return { tablet: '576px', desktop: '992px' };
    case 'custom':
      return {
        tablet: choices.customTabletBreakpoint ?? '640px',
        desktop: choices.customDesktopBreakpoint ?? '1024px',
      };
    default:
      return { tablet: '640px', desktop: '1024px' };
  }
}

/**
 * Merge session.technicalChoices with defaults and resolve computed values
 * (grid gap pixels, color hex codes, breakpoint values).
 */
export function resolveChoices(session: Session): ResolvedChoices {
  const tc = session.technicalChoices ?? {};
  const merged = { ...DEFAULTS, ...tc };

  return {
    schemaVersion: merged.schemaVersion,
    validator: merged.validator,
    validationTiming: merged.validationTiming,
    html5Validation: merged.html5Validation,
    omitExtraData: merged.omitExtraData,
    submissionPattern: merged.submissionPattern,
    successBehavior: merged.successBehavior,
    serverErrorShape: merged.serverErrorShape,
    draftSaveInterval: merged.draftSaveInterval,
    formWrapper: merged.formWrapper,
    touchTargetSize: merged.touchTargetSize,
    gridGap: resolveGridGap(merged.gridGap),
    colorPalette: resolveColorPalette(merged.colorPalette, tc),
    breakpoints: resolveBreakpoints(merged.breakpoints, tc),
    typeStyle: merged.typeStyle,
    conditionalApproach: merged.conditionalApproach,
    formStateManagement: merged.formStateManagement,
    formContextUsage: merged.formContextUsage,
  };
}
