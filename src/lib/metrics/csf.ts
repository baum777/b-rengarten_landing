/**
 * Critical Success Factors — the strategic level of the measurement model.
 *
 * Every dashboard metric answers to exactly one CSF, so a number on the control
 * tower can always be traced back to the operational goal it serves. The CSFs
 * are the operation's own goals as stated in the pilot brief; they are not new
 * operator claims and carry no thresholds of their own.
 */

export type CsfId =
  | "csf_inquiry_response"
  | "csf_operation"
  | "csf_occupancy"
  | "csf_data_trust";

export type CriticalSuccessFactor = {
  id: CsfId;
  label: string;
  statement: string;
  /** Who is accountable for the outcome — context, never authorization. */
  accountable: string;
  /**
   * How the factor becomes visible on the control tower. "metrics" = through
   * registered metrics; "data_quality" = through the source states in the
   * data-health section (no metric is honest here — the goal is the quality of
   * the data itself, not a number).
   */
  realizedBy: "metrics" | "data_quality";
};

export const CRITICAL_SUCCESS_FACTORS: CriticalSuccessFactor[] = [
  {
    id: "csf_inquiry_response",
    label: "Anfragen werden zeitnah beantwortet",
    statement:
      "Jede Anfrage aus Website, Restaurant und Anlass wird nach Eingang nachvollziehbar übernommen.",
    accountable: "Empfang",
    realizedBy: "metrics",
  },
  {
    id: "csf_operation",
    label: "Der Arbeitsvorrat bleibt beherrschbar",
    statement:
      "Keine Aufgabe bleibt überfällig oder blockiert liegen, ohne dass der Grund sichtbar ist.",
    accountable: "Betriebsleitung",
    realizedBy: "metrics",
  },
  {
    id: "csf_occupancy",
    label: "Die Belegung trägt den Betrieb",
    statement:
      "Auslastung sowie An- und Abreisen sind aus einer verlässlichen Quelle bekannt.",
    accountable: "Betriebsleitung",
    realizedBy: "metrics",
  },
  {
    id: "csf_data_trust",
    label: "Entscheidungen ruhen auf aktuellen Daten",
    statement:
      "Jede angezeigte Zahl nennt Quelle, Zeitraum und Definition — fehlende Quellen werden als Zustand ausgewiesen.",
    accountable: "Management",
    realizedBy: "data_quality",
  },
];

const CSF_BY_ID = new Map(CRITICAL_SUCCESS_FACTORS.map((c) => [c.id, c]));

export const csfById = (id: CsfId): CriticalSuccessFactor | undefined => CSF_BY_ID.get(id);
