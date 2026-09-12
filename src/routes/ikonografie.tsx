import { createFileRoute, Link } from "@tanstack/react-router";
import { Monogram } from "@/components/brand/logo";
import {
  atoms,
  coreGroups,
  signatureSet,
  ArrivalIcon,
  BreakfastIcon,
  CalendarIcon,
  ClockIcon,
  GardenIcon,
  HostIcon,
  LocationIcon,
  MenuCardIcon,
  PhoneIcon,
  StayIcon,
  TableIcon,
  TogetherIcon,
} from "@/components/brand/icons";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ikonografie")({
  component: IconographyPage,
  head: () => ({
    meta: [
      { title: "Ikonografie — Bärengarten Ravensburg" },
      {
        name: "description",
        content:
          "BG-IC-001. Monoline-Zeichen aus der Monogramm-Geometrie. Kein Maskottchen, keine Pfote, kein Tourismus-Satz.",
      },
    ],
  }),
});

const sizes = [
  { px: 16, label: "16" },
  { px: 24, label: "24" },
  { px: 32, label: "32" },
  { px: 48, label: "48" },
] as const;

const construction = [
  { name: "Host", Icon: HostIcon },
  { name: "Stay", Icon: StayIcon },
  { name: "Table", Icon: TableIcon },
  { name: "Garden", Icon: GardenIcon },
] as const;

const inHouse = [
  { name: "Hotel · Portal", Icon: StayIcon },
  { name: "Restaurant · Portal", Icon: TableIcon },
  { name: "Biergarten · Portal", Icon: GardenIcon },
  { name: "Anreise", Icon: ArrivalIcon },
  { name: "Frühstück", Icon: BreakfastIcon },
  { name: "Rezeption", Icon: ClockIcon },
  { name: "Tisch", Icon: TableIcon },
  { name: "Karte", Icon: MenuCardIcon },
  { name: "Anlass", Icon: TogetherIcon },
  { name: "Anfahrt", Icon: LocationIcon },
  { name: "Anrufen", Icon: PhoneIcon },
  { name: "Datum", Icon: CalendarIcon },
] as const;

function IconographyPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <header className="content-wide grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow text-wine-700">BG-IC-001</p>
          <h1 className="text-display-md mt-3">Ikonografie</h1>
          <p className="mt-5 max-w-xl text-lg text-charcoal-600">
            Zeichen sind ruhige Werkzeuge, keine Dekoration. Monoline, 1,5 auf
            24, weich-eckige Fugen. Abgeleitet aus dem B — nicht aus einem
            Bärenpark.
          </p>
        </div>
        <div className="lg:col-span-5 flex items-end gap-8">
          <div className="flex flex-col items-center gap-3">
            <Monogram className="h-20 w-20 text-green-800" />
            <p className="micro text-charcoal-600">Quelle · Monogramm</p>
          </div>
          <div className="flex flex-col items-center gap-3 text-green-800">
            <HostIcon className="h-20 w-20" />
            <p className="micro text-charcoal-600">Linie · Host</p>
          </div>
        </div>
      </header>

      <section className="content-wide mt-20 md:mt-28">
        <p className="eyebrow text-wine-700">Atome</p>
        <h2 className="text-display-md mt-3">Vier Teile. Die ganze Familie.</h2>
        <p className="mt-4 max-w-xl text-charcoal-600">
          Stamm, Schale, Traverse, Laubdach. Jedes Zeichen ist eine Montage,
          kein Clipart.
        </p>
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {atoms.map((item) => (
            <li key={item.name} className="border-t border-charcoal-900/16 pt-6">
              <item.Icon className="h-12 w-12 text-green-800" />
              <h3 className="font-display text-2xl tracking-tight mt-5">
                {item.name}
              </h3>
              <p className="mt-3 text-charcoal-600">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="content-wide mt-20 md:mt-28">
        <p className="eyebrow text-wine-700">Signatur</p>
        <h2 className="text-display-md mt-3">Sechs Zeichen. Eine Grammatik.</h2>
        <p className="mt-4 max-w-xl text-charcoal-600">
          Host, Stay, Table, Garden, Arrival, Together — die vier Modi des
          Hauses, plus Ankommen und Zusammenkommen.
        </p>
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {signatureSet.map((item) => (
            <li key={item.name} className="border-t border-charcoal-900/16 pt-6">
              <item.Icon className="h-14 w-14 text-green-800" />
              <p className="eyebrow text-charcoal-600 mt-5">{item.mode}</p>
              <h3 className="font-display text-3xl tracking-tight mt-2">
                {item.name}
              </h3>
              <p className="mt-3 text-charcoal-600">{item.note}</p>
              <p className="mt-3 micro text-charcoal-600">{item.use}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="content-wide mt-20 md:mt-28">
        <p className="eyebrow text-wine-700">Konstruktion</p>
        <h2 className="text-display-md mt-3">24 auf 24. Kein Schmuckrand.</h2>
        <p className="mt-4 max-w-xl text-charcoal-600">
          Optische Reserve von zwei Einheiten. Quadratische Kappen, runde Fugen.
          Der Strich skaliert mit dem Feld.
        </p>
        <ul className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {construction.map((item) => (
            <li key={item.name}>
              <GridStage>
                <item.Icon />
              </GridStage>
              <p className="micro text-charcoal-600 mt-3">{item.name}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="content-wide mt-20 md:mt-28">
        <p className="eyebrow text-wine-700">Kernsatz</p>
        <h2 className="text-display-md mt-3">Funktion, 24 Pixel.</h2>
        <div className="mt-12 grid gap-16">
          {coreGroups.map((group) => (
            <div key={group.name}>
              <h3 className="eyebrow text-charcoal-600">{group.name}</h3>
              <ul className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-8">
                {group.icons.map((item) => (
                  <li
                    key={item.name}
                    className="flex flex-col items-start gap-3"
                  >
                    <item.Icon className="h-6 w-6 text-charcoal-900" />
                    <span className="micro text-charcoal-600">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="content-wide mt-20 md:mt-28 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-wine-700">Maß</p>
          <h2 className="text-display-md mt-3">Der Strich bleibt dünn.</h2>
          <p className="mt-4 text-charcoal-600">
            1,5 Einheiten in einem 24er-Feld. Skaliert mit dem Zeichen — kein
            fester Pixelstrich, der bei 48 zu dünn oder bei 16 zu grob wird.
          </p>
        </div>
        <div className="lg:col-span-7 flex items-end gap-8 border-t border-charcoal-900/16 pt-8">
          {sizes.map((size) => (
            <div key={size.px} className="flex flex-col items-center gap-3">
              <StayIcon
                className="text-green-800"
                style={{ width: size.px, height: size.px }}
              />
              <span className="micro text-charcoal-600">{size.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 md:mt-28">
        <div className="content-wide mb-8">
          <p className="eyebrow text-wine-700">Flächen</p>
          <h2 className="text-display-md mt-3">Ein Zeichen, drei Gründe.</h2>
        </div>
        <div className="grid md:grid-cols-3">
          <Colorway
            className="bg-paper-50 text-charcoal-900"
            label="Papier"
            hex="#F6EFE4"
          />
          <Colorway
            className="bg-green-800 text-paper-50"
            label="Garten"
            hex="#1F3B2E"
          />
          <Colorway
            className="bg-wine-700 text-paper-50"
            label="Wein"
            hex="#722F32"
          />
        </div>
      </section>

      <section className="content-wide mt-20 md:mt-28">
        <p className="eyebrow text-wine-700">Im Haus</p>
        <h2 className="text-display-md mt-3">Wo die Zeichen arbeiten.</h2>
        <p className="mt-4 max-w-xl text-charcoal-600">
          Portale, Fakten, mobile Leiste. Ein Zeichen pro Handlung — nicht als
          Ornament über jeder Überschrift.
        </p>
        <ul className="mt-12 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-10">
          {inHouse.map((item) => (
            <li key={item.name} className="flex flex-col items-start gap-3">
              <item.Icon className="h-6 w-6 text-green-800" />
              <span className="micro text-charcoal-600">{item.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="content-wide mt-20 md:mt-28 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow text-success">Tun</p>
          <ul className="mt-6 space-y-3 text-charcoal-900">
            <li>Monoline, geometrisch, aus Stamm und Schale.</li>
            <li>Ein Zeichen pro Handlung. Pfeil statt Illustration.</li>
            <li>Bär nur als latente Silhouette im Monogramm.</li>
            <li>Laubdach, nicht Tanne. Stadtgarten, nicht Alm.</li>
          </ul>
        </div>
        <div className="lg:col-span-6">
          <p className="eyebrow text-error">Lassen</p>
          <ul className="mt-6 grid grid-cols-4 gap-4">
            <Forbidden mark="Pfote" />
            <Forbidden mark="Tanne" kind="pine" />
            <Forbidden mark="Krug" kind="mug" />
            <Forbidden mark="Gesicht" kind="face" />
          </ul>
          <ul className="mt-8 space-y-3 text-charcoal-900">
            <li>Generische Tourismussätze und Material-Icons als Marke.</li>
            <li>Gefüllte Blobs, 20-Pixel-Radien, App-Badges.</li>
            <li>Oktoberfest, Lederhose, Bergsilhouette.</li>
          </ul>
        </div>
      </section>

      <p className="content-wide mt-20 md:mt-28 text-charcoal-600 max-w-xl">
        Die Familie lebt im Haus — in den Portalen, der mobilen Leiste, den
        Hotelzeiten. Zurück zur{" "}
        <Link to="/" className="underline underline-offset-4">
          Startseite
        </Link>
        .
      </p>
    </main>
  );
}

function GridStage({ children }: { children: React.ReactNode }) {
  const lines = Array.from({ length: 25 }, (_, i) => i);
  return (
    <div className="relative aspect-square bg-paper-100 text-green-800">
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {lines.map((i) => (
          <g
            key={i}
            stroke="currentColor"
            className={
              i % 4 === 0 ? "text-charcoal-900/18" : "text-charcoal-900/08"
            }
            strokeWidth={i % 4 === 0 ? 0.12 : 0.06}
          >
            <line x1={i} y1={0} x2={i} y2={24} />
            <line x1={0} y1={i} x2={24} y2={i} />
          </g>
        ))}
      </svg>
      <div className="relative h-full w-full [&>svg]:h-full [&>svg]:w-full">
        {children}
      </div>
    </div>
  );
}

function Colorway({
  className,
  label,
  hex,
}: {
  className: string;
  label: string;
  hex: string;
}) {
  return (
    <div className={cn("px-8 py-12 md:px-12 md:py-16", className)}>
      <p className="eyebrow opacity-70">{label}</p>
      <p className="micro mt-1 opacity-60">{hex}</p>
      <div className="mt-8 flex gap-6">
        <HostIcon className="h-10 w-10" />
        <StayIcon className="h-10 w-10" />
        <TableIcon className="h-10 w-10" />
        <GardenIcon className="h-10 w-10" />
      </div>
    </div>
  );
}

function Forbidden({
  mark,
  kind = "paw",
}: {
  mark: string;
  kind?: "paw" | "pine" | "mug" | "face";
}) {
  return (
    <li className="flex flex-col items-start gap-2">
      <span className="relative text-charcoal-600">
        {kind === "pine" ? (
          <PineMark />
        ) : kind === "mug" ? (
          <MugMark />
        ) : kind === "face" ? (
          <FaceMark />
        ) : (
          <PawMark />
        )}
        <span
          className="absolute inset-0 flex items-center justify-center text-error"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-10 w-10">
            <path
              d="M5 5 19 19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </span>
      </span>
      <span className="micro text-charcoal-600">{mark}</span>
    </li>
  );
}

function PawMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden
    >
      <circle cx="7.2" cy="9.2" r="1.2" />
      <circle cx="10" cy="7.4" r="1.2" />
      <circle cx="14" cy="7.4" r="1.2" />
      <circle cx="16.8" cy="9.2" r="1.2" />
      <circle cx="12" cy="15" r="3.4" />
    </svg>
  );
}

function PineMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 4.4 17.4 11H6.6L12 4.4Z" />
      <path d="M12 8.6 18.6 16.6H5.4L12 8.6Z" />
      <path d="M12 16.6V20" />
    </svg>
  );
}

function MugMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden
    >
      <path d="M6.4 7.2h9.2v10.4H6.4z" />
      <path d="M15.6 9.2h2.6v5.2h-2.6" />
      <path d="M8 10.6h6" />
    </svg>
  );
}

function FaceMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden
    >
      <circle cx="8.4" cy="7.2" r="1.6" />
      <circle cx="15.6" cy="7.2" r="1.6" />
      <circle cx="12" cy="13.2" r="5.2" />
      <path d="M10.4 13.6h3.2" />
    </svg>
  );
}
