// Rechtlicher Kontakt ≠ öffentlicher Marketing-Kontakt (Disposition
// R1.1-A, 2026-09-27): § 5 Abs. 1 Nr. 2 DDG verlangt für geschäftsmäßige,
// in der Regel gegen Entgelt angebotene digitale Dienste Angaben zur
// schnellen elektronischen Kontaktaufnahme „einschließlich der Adresse
// für die elektronische Post" (Quelle: gesetze-im-internet.de/ddg/__5.html,
// abgerufen 2026-09-27). Eine Kleinunternehmer-Ausnahme existiert nicht.
//
// Diese Adresse ist für die aktuelle Betreiberschaft noch NICHT verifiziert;
// Legacy-Adressen werden bewusst nicht wiederhergestellt. Das Datum wird
// ausschließlich vom Eigentümer geliefert — niemals erfunden, niemals aus
// alten Ständen übernommen. Marketing-Flächen dürfen dieses Modul nicht für
// Bewerbungszwecke verwenden; die Projektion erfolgt nur in Impressum.
export type VerifiedLegalContact = {
  status: "VERIFIED";
  email: string;
};

export type MissingLegalContact = {
  status: "MISSING_VERIFICATION";
  requiredDatum: "email";
};

export type LegalContact = VerifiedLegalContact | MissingLegalContact;

export const LEGAL_CONTACT: LegalContact = {
  status: "MISSING_VERIFICATION",
  requiredDatum: "email",
} as const;

export function legalContactEmail(contact: LegalContact): string | null {
  return contact.status === "VERIFIED" ? contact.email : null;
}
