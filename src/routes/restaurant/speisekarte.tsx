import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/media/photo";
import { buttonVariants } from "@/components/ui/button";
import { images, menuPreview, hours } from "@/lib/site";

export const Route = createFileRoute("/restaurant/speisekarte")({
  component: MenuPage,
  head: () => ({
    meta: [{ title: "Speisen — Bärengarten Ravensburg" }],
  }),
});

function MenuPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <header className="content-wide grid gap-10 lg:grid-cols-12 lg:items-end pb-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-wine-700">Restaurant</p>
          <h1 className="text-display-md mt-3">Speisen</h1>
          <p className="mt-4 max-w-xl text-lg text-charcoal-600">
            Eine Orientierung, keine bindende Karte. Preise und Gerichte des
            Tages erfahren Sie im Haus. {hours.restaurant}.
          </p>
        </div>
        <div className="lg:col-span-5">
          <Photo
            src={images.foodMaultaschen}
            alt="Maultaschen in klarer Brühe"
            ratio="1 / 1"
            className="rounded-md max-w-sm ml-auto"
          />
        </div>
      </header>
      <div className="content-reading space-y-16">
        {menuPreview.map((group) => (
          <section key={group.group}>
            <h2 className="eyebrow text-charcoal-600">{group.group}</h2>
            <ul className="mt-6 divide-y divide-charcoal-900/12">
              {group.items.map((item) => (
                <li key={item.name} className="py-6">
                  <p className="font-display text-3xl tracking-tight">{item.name}</p>
                  <p className="mt-2 text-charcoal-600">{item.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <Link
          to="/restaurant/reservieren"
          className={buttonVariants({ variant: "green" })}
        >
          Tisch reservieren
        </Link>
      </div>
    </main>
  );
}
