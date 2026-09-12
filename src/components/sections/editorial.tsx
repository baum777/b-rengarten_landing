import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { Photo } from "@/components/media/photo";
import { cn } from "@/lib/utils";

export function Manifesto() {
  return (
    <section className="bg-paper-50">
      <div className="content-reading section-pad text-center md:text-left">
        <p className="eyebrow text-wine-700">Gastgeber</p>
        <h2 className="text-display-md mt-5">
          Gastfreundschaft darf ein bisschen unvernünftig sein.
        </h2>
        <p className="mt-6 text-lg text-charcoal-600 max-w-xl">
          Qualität und Ehrlichkeit vor der großen Geste. Weniger Versprechen,
          mehr Präsenz am Tisch.
        </p>
        <dl className="mt-12 grid gap-8 md:grid-cols-2 text-left">
          <div>
            <dt className="eyebrow text-charcoal-600">Qualität vor Quantität</dt>
            <dd className="mt-2 text-charcoal-900">
              Weniger Gerichte, klarere Zimmer, kein Durchlaufbetrieb als
              Haltung.
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-charcoal-600">Kein Umsatzplatz</dt>
            <dd className="mt-2 text-charcoal-900">
              Gäste haben Namen. Wenn etwas schiefgeht, sagen wir es geradeheraus.
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function EditorialSplit({
  eyebrow,
  title,
  body,
  image,
  alt,
  reverse = false,
  cta,
  tone = "cream",
}: {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  reverse?: boolean;
  tone?: "cream" | "green" | "wine";
  cta?: { to: string; label: string };
}) {
  const surface =
    tone === "green"
      ? "bg-green-800 text-paper-50"
      : tone === "wine"
        ? "bg-wine-700 text-paper-50"
        : "bg-paper-50 text-charcoal-900";

  return (
    <section className={surface}>
      <div className="content-wide section-pad grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-center">
        <div
          className={cn(
            "lg:col-span-7",
            reverse && "lg:order-2",
          )}
        >
          <Photo src={image} alt={alt} ratio="3 / 2" className="rounded-md" />
        </div>
        <div className={cn("lg:col-span-5", reverse && "lg:order-1")}>
          <p
            className={cn(
              "eyebrow",
              tone === "cream" ? "text-wine-700" : "text-paper-50/70",
            )}
          >
            {eyebrow}
          </p>
          <h2 className="text-display-md mt-4">{title}</h2>
          <p
            className={cn(
              "mt-5 text-lg leading-relaxed",
              tone === "cream" ? "text-charcoal-600" : "text-paper-50/85",
            )}
          >
            {body}
          </p>
          {cta ? (
            <Link
              to={cta.to}
              className={buttonVariants({
                variant: tone === "cream" ? "green" : "inverse",
                className: "mt-8",
              })}
            >
              {cta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ReviewBand() {
  const quotes = [
    {
      quote:
        "Man merkt, dass hier jemand da ist. Nicht nur eine Rezeption, die abwickelt.",
      source: "Gast aus Stuttgart",
    },
    {
      quote:
        "Gutes Essen, ruhiges Zimmer, und der Garten am Abend. Mehr braucht Ravensburg oft nicht.",
      source: "Übernachtung unter der Woche",
    },
    {
      quote:
        "Wir kamen zu sechst, ohne große Ansage. Der Tisch war trotzdem ein Tisch, kein Durchlauf.",
      source: "Abend im Restaurant",
    },
  ];

  return (
    <section className="bg-paper-100">
      <div className="content-wide section-pad">
        <p className="eyebrow text-charcoal-600">Stimmen</p>
        <div className="mt-10 grid gap-12 lg:grid-cols-3">
          {quotes.map((item) => (
            <figure key={item.source}>
              <blockquote className="font-display text-2xl md:text-[1.75rem] leading-snug tracking-tight text-charcoal-900">
                {item.quote}
              </blockquote>
              <figcaption className="mt-4 text-sm text-charcoal-600">
                {item.source}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatusLine({ label }: { label: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm text-charcoal-600">
      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
      {label}
    </p>
  );
}
