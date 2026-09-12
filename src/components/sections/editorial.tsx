import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { Photo } from "@/components/media/photo";
import { cn } from "@/lib/utils";

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

export function StatusLine({ label }: { label: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm text-charcoal-600">
      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
      {label}
    </p>
  );
}
