import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function requestId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

const bookingSchema = z.object({
  arrival: z.string().min(1, "Bitte prüfen Sie das Anreisedatum."),
  departure: z.string().min(1, "Bitte prüfen Sie das Abreisedatum."),
  guests: z.coerce.number().int().min(1).max(8),
  room: z.string().optional(),
  name: z.string().min(2, "Bitte nennen Sie uns Ihren Namen."),
  email: z.string().email("Bitte prüfen Sie die E-Mail-Adresse."),
  phone: z.string().optional(),
  notes: z.string().max(800).optional(),
});

const reservationSchema = z.object({
  date: z.string().min(1, "Bitte wählen Sie ein Datum."),
  time: z.string().min(1, "Bitte wählen Sie eine Uhrzeit."),
  guests: z.coerce.number().int().min(1).max(20),
  name: z.string().min(2, "Bitte nennen Sie uns Ihren Namen."),
  email: z.string().email("Bitte prüfen Sie die E-Mail-Adresse."),
  phone: z.string().optional(),
  notes: z.string().max(800).optional(),
});

const occasionSchema = z.object({
  occasion: z.string().min(1),
  date: z.string().min(1, "Bitte nennen Sie uns ein Wunschdatum."),
  guests: z.coerce.number().int().min(4).max(400),
  name: z.string().min(2, "Bitte nennen Sie uns Ihren Namen."),
  email: z.string().email("Bitte prüfen Sie die E-Mail-Adresse."),
  phone: z.string().optional(),
  notes: z.string().max(1200).optional(),
});

export type InquiryResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

export const submitBookingInquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }): Promise<InquiryResult> => {
    if (data.departure <= data.arrival) {
      return {
        ok: false,
        message: "Das Abreisedatum muss nach der Anreise liegen.",
      };
    }
    return { ok: true, id: requestId("BG-Z") };
  });

export const submitReservation = createServerFn({ method: "POST" })
  .validator((data: unknown) => reservationSchema.parse(data))
  .handler(async (): Promise<InquiryResult> => {
    return { ok: true, id: requestId("BG-T") };
  });

export const submitOccasionInquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => occasionSchema.parse(data))
  .handler(async (): Promise<InquiryResult> => {
    return { ok: true, id: requestId("BG-A") };
  });
