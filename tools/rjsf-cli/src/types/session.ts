import type { TechnicalChoices } from './technical-choices.js';

export type PhaseKey = '1' | '1.5' | '2' | '2.5' | '3' | '4' | '5';

export type PhaseStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'awaiting_client_approval';

export interface PhaseState {
  status: PhaseStatus;
  startedAt: string | null;
  completedAt: string | null;
  artifactPath: string | null;
}

export interface Session {
  version: string;
  formName: string;
  outputPath: string | null;
  rjsfTheme: string | null;
  stylingApproach: string | null;
  technicalChoices?: TechnicalChoices;
  currentPhase: string;
  phases: Partial<Record<PhaseKey, PhaseState>>;
}
