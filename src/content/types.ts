/**
 * Content-State-System (R2, 2026-09-27) — typisierte Source of Truth für
 * öffentliche Inhalte. Drei Dimensionen, bewusst nicht zusammengefasst:
 *
 *  - truthState       Wie belastbar ist der Sachverhalt selbst?
 *  - publicationState Darf er aktuell öffentlich gerendert werden?
 *  - requirement      Was gilt, wenn er fehlt (optional/operativ/legal)?
 *
 * Projektiert wird ausschließlich über `src/content/public.ts`. Direkte
 * Imports aus `operator.ts`/`transitional.ts` in Public-Code sind verboten
 * (scripts/content-boundary.test.mjs); nicht-freigegebene Werte können
 * strukturell nicht in die UI leaken.
 */
export type TruthState =
  | "PROPERTY_TRUTH"
  | "TRANSITIONAL"
  | "OPERATOR_STATE";

export type PublicationState = "LIVE" | "HOLD" | "HIDDEN";

export type RequirementState = "OPTIONAL" | "OPERATIONAL" | "LEGAL_REQUIRED";

export type ContentFact<T = string | null> = {
  key: string;
  value: T;
  truthState: TruthState;
  publicationState: PublicationState;
  requirement: RequirementState;
  sourceLabel?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  note?: string;
};

/** NULL, solange der Fakt nicht LIVE ist — für optionale Konsumstellen. */
export function liveFact<T>(fact: ContentFact<T>): T | null {
  return fact.publicationState === "LIVE" ? fact.value : null;
}

/** Laut, falls ein strukturell benötigter Fakt nicht (mehr) LIVE ist. */
export function liveFactOrThrow<T>(fact: ContentFact<T>): T {
  if (fact.publicationState !== "LIVE") {
    throw new Error(`content fact "${fact.key}" is not LIVE (publicationState=${fact.publicationState})`);
  }
  return fact.value;
}
