import { Link } from "@tanstack/react-router";
import { Monogram } from "@/components/brand/logo";
import { hours, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-green-800 text-paper-50">
      <div className="content-wide py-16 md:py-24 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <Monogram className="h-10 w-10 text-paper-50" />
            <div>
              <p className="font-display text-2xl tracking-tight">Bärengarten</p>
              <p className="eyebrow text-paper-50/70 mt-1">Ravensburg</p>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-paper-50/80 leading-relaxed">
            Hotel, Restaurant und Biergarten in der Stadt. Ein Ort zum Ankommen,
            Essen und Zusammensitzen — persönlich geführt.
          </p>
          <p className="mt-6 text-sm text-paper-50/70">
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow text-paper-50/60 mb-4">Haus</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/hotel" className="hover:underline underline-offset-4">
                Hotel
              </Link>
            </li>
            <li>
              <Link to="/restaurant" className="hover:underline underline-offset-4">
                Restaurant
              </Link>
            </li>
            <li>
              <Link to="/biergarten" className="hover:underline underline-offset-4">
                Biergarten
              </Link>
            </li>
            <li>
              <Link to="/anlaesse" className="hover:underline underline-offset-4">
                Anlässe
              </Link>
            </li>
            <li>
              <Link to="/ueber-uns" className="hover:underline underline-offset-4">
                Über uns
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow text-paper-50/60 mb-4">Direkt</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={site.phoneHref} className="hover:underline underline-offset-4">
                {site.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="hover:underline underline-offset-4"
              >
                {site.email}
              </a>
            </li>
            <li className="pt-3 text-paper-50/70">
              Restaurant {hours.restaurant}
            </li>
            <li className="text-paper-50/70">Rezeption {hours.receptionWeek}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper-50/15">
        <div className="content-wide py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-paper-50/60">
          <p>Hotel · Restaurant · Biergarten · Ravensburg</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Rechtliches">
            <Link to="/impressum" className="hover:text-paper-50">
              Impressum
            </Link>
            <Link to="/datenschutz" className="hover:text-paper-50">
              Datenschutz
            </Link>
            <Link to="/faq" className="hover:text-paper-50">
              FAQ
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
