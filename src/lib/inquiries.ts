import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const bookingSchema = z
  .object({
    arrival: z.iso.date(),
    departure: z.iso.date(),
    guests: z.coerce.number().int().min(1).max(8),
    room: z.string().max(100).optional(),
    name: z.string().min(2, "Bitte nennen Sie uns Ihren Namen.").max(160),
    email: z.string().email("Bitte prüfen Sie die E-Mail-Adresse.").max(254),
    phone: z.string().max(60).optional(),
    notes: z.string().max(800).optional(),
  })
  .strict();

const reservationSchema = z
  .object({
    date: z.iso.date(),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    guests: z.coerce.number().int().min(1).max(20),
    name: z.string().min(2, "Bitte nennen Sie uns Ihren Namen.").max(160),
    email: z.string().email("Bitte prüfen Sie die E-Mail-Adresse.").max(254),
    phone: z.string().max(60).optional(),
    notes: z.string().max(800).optional(),
  })
  .strict();

const occasionSchema = z
  .object({
    occasion: z.string().min(1).max(160),
    date: z.iso.date(),
    guests: z.coerce.number().int().min(4).max(400),
    name: z.string().min(2, "Bitte nennen Sie uns Ihren Namen.").max(160),
    email: z.string().email("Bitte prüfen Sie die E-Mail-Adresse.").max(254),
    phone: z.string().max(60).optional(),
    notes: z.string().max(1200).optional(),
  })
  .strict();

export type InquiryResult = { ok: true; id: string } | { ok: false; message: string };

export const submitBookingInquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }): Promise<InquiryResult> => {
    if (data.departure <= data.arrival) {
      return {
        ok: false,
        message: "Das Abreisedatum muss nach der Anreise liegen.",
      };
    }
    const { saveInquiry } = await import("./operations/inquiry.server");
    return { ok: true, id: await saveInquiry({ ...data, type: "ROOM" }) };
  });

export const submitReservation = createServerFn({ method: "POST" })
  .validator((data: unknown) => reservationSchema.parse(data))
  .handler(async ({ data }): Promise<InquiryResult> => {
    const { saveInquiry } = await import("./operations/inquiry.server");
    const { date, ...rest } = data;
    return { ok: true, id: await saveInquiry({ ...rest, arrival: date, type: "TABLE" }) };
  });

export const submitOccasionInquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => occasionSchema.parse(data))
  .handler(async ({ data }): Promise<InquiryResult> => {
    const { saveInquiry } = await import("./operations/inquiry.server");
    const { date, ...rest } = data;
    return { ok: true, id: await saveInquiry({ ...rest, arrival: date, type: "OCCASION" }) };
  });
