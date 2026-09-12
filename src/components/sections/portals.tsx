import { Link } from "@tanstack/react-router";
import {
  ArrowIcon,
  GardenIcon,
  StayIcon,
  TableIcon,
} from "@/components/brand/icons";
import { Photo } from "@/components/media/photo";
import { images } from "@/lib/site";

const portals = [
  {
    to: "/hotel",
    title: "Hotel",
    copy: "Ankommen, übernachten und weiter. Ohne unnötige Umstände.",
    image: images.roomComfort,
    alt: "Helles Hotelzimmer mit Leinenbett und Schreibtisch",
    Mark: StayIcon,
  },
  {
    to: "/restaurant",
    title: "Restaurant",
    copy: "Gute Küche und Service mit Anspruch.",
    image: images.foodRoast,
    alt: "Zwiebelrostbraten auf Keramik, gedeckt am Eichentisch",
    Mark: TableIcon,
  },
  {
    to: "/biergarten",
    title: "Biergarten",
    copy: "Draußen zusammensitzen. Mit Kollegen, Freunden oder Familie.",
    image: images.gardenDay,
    alt: "Biergarten am Tag unter dichtem Blätterdach",
    Mark: GardenIcon,
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
                imgClassName="transition-transform duration-500 ease-standard group-hover:scale-[1.03]"
              />
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-green-800 mb-2">
                    <portal.Mark className="h-6 w-6" />
                  </p>
                  <h2 className="font-display text-3xl tracking-tight">
                    {portal.title}
                  </h2>
                  <p className="mt-2 text-charcoal-600 max-w-xs">{portal.copy}</p>
                </div>
                <ArrowIcon
                  className="mt-8 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
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
