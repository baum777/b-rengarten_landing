import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Photo } from "@/components/media/photo";
import { images } from "@/lib/site";

const portals = [
  {
    to: "/hotel",
    title: "Hotel",
    copy: "Ruhige Zimmer in der Stadt. Ankommen ohne Umstände.",
    image: images.roomComfort,
    alt: "Helles Hotelzimmer mit Leinenbett und Schreibtisch",
  },
  {
    to: "/restaurant",
    title: "Restaurant",
    copy: "Küche mit Haltung. Zum Essen, nicht zum Inszenieren.",
    image: images.foodRoast,
    alt: "Zwiebelrostbraten auf Keramik, gedeckt am Eichentisch",
  },
  {
    to: "/biergarten",
    title: "Biergarten",
    copy: "Unter den Kastanien. Offener Tisch, offener Abend.",
    image: images.gardenDay,
    alt: "Biergarten am Tag unter dichtem Blätterdach",
  },
] as const;

export function PortalGrid() {
  return (
    <section className="bg-paper-50">
      <div className="content-wide section-pad">
        <div className="grid gap-6 md:grid-cols-3">
          {portals.map((portal) => (
            <Link
              key={portal.to}
              to={portal.to}
              className="group block focus-visible:outline-none"
            >
              <Photo
                src={portal.image}
                alt={portal.alt}
                ratio="3 / 4"
                className="rounded-md"
                imgClassName="transition-transform duration-700 ease-standard group-hover:scale-[1.03]"
              />
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl tracking-tight">
                    {portal.title}
                  </h2>
                  <p className="mt-2 text-charcoal-600 max-w-xs">{portal.copy}</p>
                </div>
                <ArrowRight
                  className="mt-2 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
