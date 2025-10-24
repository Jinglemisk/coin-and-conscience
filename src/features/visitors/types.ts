import type { DayPhase } from '#config/configTypes';

export type VisitorHonesty = 'honest' | 'deceptive';

export type VisitorNeedKind = 'buy';

export interface VisitorNeed {
  kind: VisitorNeedKind;
  /** Narrative prompt describing what the visitor hopes to obtain. */
  summary: string;
  /** Lightweight hint describing the item category or trait they seek. */
  itemHint: string;
  /** Placeholder price expectation ratio compared to base pricing. */
  fairPriceMultiplier: number;
}

export interface VisitorPersona {
  codename: string;
  formalName: string;
  appearance: string;
  demeanor: string;
  greeting: string;
}

export interface VisitorDialogueScript {
  honesty: VisitorHonesty;
  lines: readonly string[];
}

export interface VisitorTemplate {
  id: string;
  persona: VisitorPersona;
  need: VisitorNeed;
  scripts: readonly VisitorDialogueScript[];
}

export type VisitorDepartureReason = 'completed' | 'refused' | 'timeout' | 'manual';

export interface VisitorActionLogEntry {
  id: string;
  action: 'talk' | 'offer' | 'refuse' | 'timeout' | 'depart';
  timestamp: number;
  summary: string;
  satisfactionAfter: number;
}

export interface VisitorInstance {
  id: string;
  templateId: string;
  honesty: VisitorHonesty;
  persona: VisitorPersona;
  need: VisitorNeed;
  satisfaction: number;
  patience: number;
  dialogueLines: readonly string[];
  talkCursor: number;
  arrivalTick: number;
  lastInteractionTick: number;
  departureReason?: VisitorDepartureReason;
  log: VisitorActionLogEntry[];
}

export interface VisitorAdvanceContext {
  phase: DayPhase;
  tick: number;
}
