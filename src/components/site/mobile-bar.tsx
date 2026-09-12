import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarRange, MapPin, Menu, Phone, Utensils } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function MobileActionBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const actions =
    pathname.startsWith("/hotel")
      ? [
          { to: "/hotel/buchen", label: "Verfügbarkeit", icon: CalendarRange },
          { href: site.phoneHref, label: "Anrufen", icon: Phone },
        ]
      : pathname.startsWith("/restaurant")
        ? [
            { to: "/restaurant/reservieren", label: "Reservieren", icon: Utensils },
            { to: "/restaurant/speisekarte", label: "Karte", icon: Menu },
          ]
        : pathname.startsWith("/biergarten")
          ? [
              { to: "/kontakt", label: "Heute", icon: CalendarRange },
              { href: site.googleMapsUrl, label: "Anfahrt", icon: MapPin },
            ]
          : [
              { to: "/hotel/buchen", label: "Zimmer", icon: CalendarRange },
              { to: "/restaurant/reservieren", label: "Tisch", icon: Utensils },
              { to: "/restaurant/speisekarte", label: "Menü", icon: Menu },
            ];

  return (
    <nav
      aria-label="Schnellaktionen"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-charcoal-900/12 bg-paper-50/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${actions.length}, 1fr)` }}>
        {actions.map((action) => {
          const Icon = action.icon;
          const className = cn(
            "flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium tracking-wide text-charcoal-900",
          );
          if ("href" in action && action.href) {
            return (
              <li key={action.label}>
                <a href={action.href} className={className}>
                  <Icon className="h-4 w-4" aria-hidden />
                  {action.label}
                </a>
              </li>
            );
          }
          return (
            <li key={action.label}>
              <Link to={action.to!} className={className}>
                <Icon className="h-4 w-4" aria-hidden />
                {action.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
