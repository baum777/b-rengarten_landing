import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarIcon,
  LocationIcon,
  MenuCardIcon,
  PhoneIcon,
  StayIcon,
  TableIcon,
} from "@/components/brand/icons";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

type ActionIcon = ComponentType<SVGProps<SVGSVGElement>>;

export function MobileActionBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const actions: {
    to?: string;
    href?: string;
    label: string;
    icon: ActionIcon;
  }[] = pathname.startsWith("/hotel")
    ? [
        { to: "/hotel/buchen", label: "Verfügbarkeit", icon: CalendarIcon },
        { href: site.phoneHref, label: "Anrufen", icon: PhoneIcon },
      ]
    : pathname.startsWith("/restaurant")
      ? [
          { to: "/restaurant/reservieren", label: "Reservieren", icon: TableIcon },
          { to: "/restaurant/speisekarte", label: "Karte", icon: MenuCardIcon },
        ]
      : pathname.startsWith("/biergarten")
        ? [
            { to: "/kontakt", label: "Heute", icon: CalendarIcon },
            { href: site.googleMapsUrl, label: "Anfahrt", icon: LocationIcon },
          ]
        : [
            { to: "/hotel/buchen", label: "Zimmer", icon: StayIcon },
            { to: "/restaurant/reservieren", label: "Tisch", icon: TableIcon },
            { to: "/restaurant/speisekarte", label: "Menü", icon: MenuCardIcon },
          ];

  return (
    <nav
      aria-label="Schnellaktionen"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-charcoal-900/12 bg-paper-50/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${actions.length}, 1fr)` }}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          const className = cn(
            "flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium tracking-wide text-charcoal-900",
          );
          if (action.href) {
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
