import type { AnalysisRecord, CreditEvent, PrecisionEvent } from '../types';

const ANALYSIS_KEY = 'voicefit.analysis.history';
const CREDIT_KEY = 'voicefit.credit.events';
const PRECISION_KEY = 'voicefit.precision.events';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadAnalysisHistory(): AnalysisRecord[] {
  if (typeof window === 'undefined') return [];
  return safeParse<AnalysisRecord[]>(window.localStorage.getItem(ANALYSIS_KEY), []);
}

export function saveAnalysisHistory(records: AnalysisRecord[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ANALYSIS_KEY, JSON.stringify(records));
}

export function addAnalysisRecord(record: AnalysisRecord): AnalysisRecord[] {
  const current = loadAnalysisHistory();
  const next = [record, ...current].slice(0, 30);
  saveAnalysisHistory(next);
  return next;
}

export function loadCreditEvents(): CreditEvent[] {
  if (typeof window === 'undefined') return [];
  return safeParse<CreditEvent[]>(window.localStorage.getItem(CREDIT_KEY), []);
}

export function saveCreditEvents(events: CreditEvent[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CREDIT_KEY, JSON.stringify(events));
}

export function addCreditEvent(event: CreditEvent): CreditEvent[] {
  const current = loadCreditEvents();
  const next = [event, ...current].slice(0, 100);
  saveCreditEvents(next);
  return next;
}

export function loadPrecisionEvents(): PrecisionEvent[] {
  if (typeof window === 'undefined') return [];
  return safeParse<PrecisionEvent[]>(window.localStorage.getItem(PRECISION_KEY), []);
}

export function savePrecisionEvents(events: PrecisionEvent[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PRECISION_KEY, JSON.stringify(events));
}

export function addPrecisionEvent(event: PrecisionEvent): PrecisionEvent[] {
  const current = loadPrecisionEvents();
  const next = [event, ...current].slice(0, 100);
  savePrecisionEvents(next);
  return next;
}
