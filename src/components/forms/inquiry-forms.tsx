import { useState, type FormEvent, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  submitBookingInquiry,
  submitOccasionInquiry,
  submitReservation,
} from "@/lib/inquiries";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function Success({ id, kind }: { id: string; kind: string }) {
  return (
    <div className="rounded-md border border-charcoal-900/16 bg-white p-6 md:p-8">
      <p className="eyebrow text-green-800">Bestätigt</p>
      <h2 className="font-display text-3xl mt-3 tracking-tight">
        Wir haben Ihre {kind} erhalten.
      </h2>
      <p className="mt-3 text-charcoal-600">
        Vorgang <span className="micro text-charcoal-900">{id}</span>. Wir
        melden uns persönlich. Wenn es eilt:
      </p>
      <p className="mt-4">
        <a href={site.phoneHref} className="underline underline-offset-4">
          {site.phone}
        </a>
        {" · "}
        <a href={`mailto:${site.email}`} className="underline underline-offset-4">
          {site.email}
        </a>
      </p>
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="text-sm text-error">
      {message} Falls das Formular nicht geht, rufen Sie uns an: {site.phone}.
    </p>
  );
}

export function BookingForm({
  defaults,
}: {
  defaults?: { arrival?: string; departure?: string; guests?: string };
}) {
  const submit = useServerFn(submitBookingInquiry);
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ status: "submitting" });
    try {
      const result = await submit({
        data: {
          arrival: String(form.get("arrival") ?? ""),
          departure: String(form.get("departure") ?? ""),
          guests: Number(form.get("guests") ?? 1),
          room: String(form.get("room") ?? ""),
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          notes: String(form.get("notes") ?? ""),
        },
      });
      if (result.ok) setState({ status: "success", id: result.id });
      else setState({ status: "error", message: result.message });
    } catch {
      setState({
        status: "error",
        message: "Bitte prüfen Sie Ihre Angaben.",
      });
    }
  }

  if (state.status === "success") {
    return <Success id={state.id} kind="Zimmeranfrage" />;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="arrival" label="Anreise">
          <Input
            id="arrival"
            name="arrival"
            type="date"
            required
            defaultValue={defaults?.arrival}
          />
        </Field>
        <Field id="departure" label="Abreise">
          <Input
            id="departure"
            name="departure"
            type="date"
            required
            defaultValue={defaults?.departure}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="guests" label="Gäste">
          <Input
            id="guests"
            name="guests"
            type="number"
            min={1}
            max={8}
            required
            defaultValue={defaults?.guests ?? "1"}
          />
        </Field>
        <Field id="room" label="Zimmertyp">
          <select
            id="room"
            name="room"
            className="flex h-control w-full rounded-sm border border-charcoal-900/16 bg-paper-50 px-3 font-sans text-base"
            defaultValue="komfort"
          >
            <option value="komfort">Komfort</option>
            <option value="business">Business</option>
            <option value="suite">Junior Suite</option>
            <option value="egal">Ohne Präferenz</option>
          </select>
        </Field>
      </div>
      <Field id="name" label="Name">
        <Input id="name" name="name" autoComplete="name" required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="E-Mail">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </Field>
        <Field id="phone" label="Telefon">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
      </div>
      <Field id="notes" label="Hinweis (optional)">
        <Textarea id="notes" name="notes" rows={4} />
      </Field>
      {state.status === "error" ? <ErrorNote message={state.message} /> : null}
      <Button type="submit" variant="wine" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Wird gesendet…" : "Verfügbarkeit anfragen"}
      </Button>
      <p className="text-sm text-charcoal-600">
        Das ist eine Anfrage, keine Sofortbuchung. Wir bestätigen persönlich.
      </p>
    </form>
  );
}

export function ReservationForm() {
  const submit = useServerFn(submitReservation);
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ status: "submitting" });
    try {
      const result = await submit({
        data: {
          date: String(form.get("date") ?? ""),
          time: String(form.get("time") ?? ""),
          guests: Number(form.get("guests") ?? 2),
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          notes: String(form.get("notes") ?? ""),
        },
      });
      if (result.ok) setState({ status: "success", id: result.id });
      else setState({ status: "error", message: result.message });
    } catch {
      setState({
        status: "error",
        message: "Bitte prüfen Sie Datum, Uhrzeit und Kontaktdaten.",
      });
    }
  }

  if (state.status === "success") {
    return <Success id={state.id} kind="Reservierung" />;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="date" label="Datum">
          <Input id="date" name="date" type="date" required />
        </Field>
        <Field id="time" label="Uhrzeit">
          <Input id="time" name="time" type="time" required defaultValue="19:00" />
        </Field>
        <Field id="guests" label="Personen">
          <Input id="guests" name="guests" type="number" min={1} max={20} required defaultValue="2" />
        </Field>
      </div>
      <Field id="name" label="Name">
        <Input id="name" name="name" autoComplete="name" required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="E-Mail">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field id="phone" label="Telefon">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
      </div>
      <Field id="notes" label="Hinweis (Allergien, Anlass)">
        <Textarea id="notes" name="notes" rows={4} />
      </Field>
      {state.status === "error" ? <ErrorNote message={state.message} /> : null}
      <Button type="submit" variant="green" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Wird gesendet…" : "Tisch reservieren"}
      </Button>
      <p className="text-sm text-charcoal-600">
        Bestätigung erfolgt durch das Haus, nicht automatisch. Telefon: {site.phone}.
      </p>
    </form>
  );
}

export function OccasionForm() {
  const submit = useServerFn(submitOccasionInquiry);
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ status: "submitting" });
    try {
      const result = await submit({
        data: {
          occasion: String(form.get("occasion") ?? ""),
          date: String(form.get("date") ?? ""),
          guests: Number(form.get("guests") ?? 10),
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          notes: String(form.get("notes") ?? ""),
        },
      });
      if (result.ok) setState({ status: "success", id: result.id });
      else setState({ status: "error", message: result.message });
    } catch {
      setState({
        status: "error",
        message: "Bitte prüfen Sie Ihre Angaben zur Feier.",
      });
    }
  }

  if (state.status === "success") {
    return <Success id={state.id} kind="Anfrage" />;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="occasion" label="Anlass">
          <select
            id="occasion"
            name="occasion"
            className="flex h-control w-full rounded-sm border border-charcoal-900/16 bg-paper-50 px-3 font-sans text-base"
            defaultValue="essen"
          >
            <option value="essen">Zusammen essen</option>
            <option value="familie">Familie / Feier</option>
            <option value="garten">Gartenfest</option>
            <option value="arbeit">Kleine Tagung</option>
          </select>
        </Field>
        <Field id="date" label="Wunschdatum">
          <Input id="date" name="date" type="date" required />
        </Field>
        <Field id="guests" label="Personen">
          <Input id="guests" name="guests" type="number" min={4} max={400} required defaultValue="12" />
        </Field>
      </div>
      <Field id="name" label="Name">
        <Input id="name" name="name" autoComplete="name" required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="E-Mail">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field id="phone" label="Telefon">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
      </div>
      <Field id="notes" label="Was sollen wir wissen?">
        <Textarea id="notes" name="notes" rows={5} />
      </Field>
      {state.status === "error" ? <ErrorNote message={state.message} /> : null}
      <Button type="submit" variant="wine" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Wird gesendet…" : "Anfrage senden"}
      </Button>
    </form>
  );
}

export function BookingBar() {
  return (
    <form
      action="/hotel/buchen"
      method="get"
      className="bg-white border border-charcoal-900/12 rounded-md p-4 md:p-5 grid gap-4 md:grid-cols-12 md:items-end"
    >
      <div className="md:col-span-3 flex flex-col gap-2">
        <Label htmlFor="bar-arrival">Anreise</Label>
        <Input id="bar-arrival" name="anreise" type="date" required />
      </div>
      <div className="md:col-span-3 flex flex-col gap-2">
        <Label htmlFor="bar-departure">Abreise</Label>
        <Input id="bar-departure" name="abreise" type="date" required />
      </div>
      <div className="md:col-span-2 flex flex-col gap-2">
        <Label htmlFor="bar-guests">Gäste</Label>
        <Input id="bar-guests" name="gaeste" type="number" min={1} max={8} defaultValue="1" />
      </div>
      <div className="md:col-span-4">
        <Button type="submit" variant="wine" className="w-full">
          Verfügbarkeit prüfen
        </Button>
      </div>
    </form>
  );
}
