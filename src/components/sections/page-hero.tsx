import { Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { Photo } from "@/components/media/photo";
import { cn } from "@/lib/utils";

type Cta = {
  to: string;
  label: string;
  variant?: "wine" | "green" | "inverse" | "secondary";
};

export function PageHero({
  image,
  alt,
  eyebrow,
  title,
  kicker,
  actions,
  compact = false,
}: {
  image: string;
  alt: string;
  eyebrow?: string;
  title: string;
  kicker?: string;
  actions?: Cta[];
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative isolate flex items-end overflow-hidden bg-green-950 text-paper-50",
        compact
          ? "min-h-[62svh] md:min-h-[70vh]"
          : "min-h-[78svh] md:min-h-[min(92vh,980px)]",
      )}
    >
      <Photo
        src={image}
        alt={alt}
        priority
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-green-950/35 to-green-950/20" />
      <div className="relative content-wide pb-16 pt-32 md:pb-24 md:pt-40">
        {eyebrow ? (
          <p className="eyebrow text-paper-50/75 mb-4">{eyebrow}</p>
        ) : null}
        <h1 className="text-display-lg max-w-4xl">{title}</h1>
        {kicker ? (
          <p className="mt-5 max-w-xl text-lg text-paper-50/85">{kicker}</p>
        ) : null}
        {actions && actions.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((cta) => (
              <Link
                key={cta.to}
                to={cta.to}
                className={buttonVariants({
                  variant: cta.variant ?? "inverse",
                })}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function HomeHero() {
  return (
    <section className="relative isolate min-h-[75svh] md:min-h-[min(90vh,980px)] flex items-end overflow-hidden bg-green-950 text-paper-50">
      <Photo
        src="/images/hero-garden.jpg"
        alt="Abendlicher Biergarten unter alten Kastanien, gedeckte Tische im warmen Licht"
        priority
        className="absolute inset-0 h-full w-full"
        imgClassName="object-[center_42%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-green-950/75 via-green-950/30 to-green-950/20" />
      <div className="relative content-wide w-full pb-16 pt-32 md:pb-28">
        <p className="eyebrow text-paper-50/80">Bärengarten · Ravensburg</p>
        <h1 className="text-display-xl mt-4 max-w-5xl">
          Unvernünftig
          <br />
          gastfreundlich.
        </h1>
        <p className="mt-6 text-sm tracking-[0.18em] uppercase text-paper-50/75">
          Hotel · Restaurant · Biergarten
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/hotel/buchen" className={buttonVariants({ variant: "wine" })}>
            Zimmer
          </Link>
          <Link
            to="/restaurant/reservieren"
            className={buttonVariants({ variant: "inverse" })}
          >
            Tisch
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="bg-green-800 text-paper-50">
      <div className="content-wide section-pad grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow text-paper-50/60">Weiter</p>
          <h2 className="text-display-md mt-4">Was führt Sie zu uns?</h2>
        </div>
        <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 lg:justify-end">
          <Button asChild variant="inverse">
            <Link to="/hotel/buchen">Zimmer</Link>
          </Button>
          <Button asChild variant="wine">
            <Link to="/restaurant/reservieren">Tisch</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="border-paper-50/30 text-paper-50 hover:bg-paper-50/10"
          >
            <Link to="/anlaesse">Anlass</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
