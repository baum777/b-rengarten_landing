import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Monogram } from "@/components/brand/logo";
import { UserButton } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { can, type Capability, type StaffContext } from "@/lib/permissions/roles";

/**
 * The internal chrome — deliberately NOT the public hospitality shell. Dense,
 * functional, same design tokens. Rendered by the /intern layout route; the
 * public SiteHeader/SiteFooter/MobileActionBar never mount under /intern/*.
 *
 * `staff` is null only on /intern/kein-zugriff (no active profile): the shell
 * then renders without navigation, just identity + sign-out.
 */
type NavItem = { to: string; label: string; capability?: Capability };
type NavGroup = { label: string; items: NavItem[] };

/**
 * Grouped target structure (Heute / Betrieb / Konto, später Steuerung). Only
 * routes that actually exist are listed — the shell never renders dead
 * navigation. STEUERUNG (Datenflüsse, Team, Auswertung) and further BETRIEB
 * entries (Aufgaben, Auslastung, Briefings) gain items as their routes ship;
 * groups without items are omitted from the render.
 *
 * Items without a capability are session self-service for every staff member
 * (e.g. the own password); the /intern layout route already guarantees an
 * active staff profile for the whole tree.
 */
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Heute",
    items: [
      { to: "/intern/heute", label: "Heute", capability: "tasks:read:own" },
      { to: "/intern/dashboard", label: "Übersicht", capability: "kpis:read" },
    ],
  },
  {
    label: "Betrieb",
    items: [
      { to: "/intern/anfragen", label: "Anfragen", capability: "inquiries:manage" },
      { to: "/intern/aufgaben", label: "Aufgaben", capability: "tasks:read:all" },
    ],
  },
  {
    label: "Konto",
    items: [{ to: "/intern/passwort", label: "Passwort" }],
  },
];

function navGroupsFor(staff: StaffContext | null): NavGroup[] {
  if (!staff) return [];
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => item.capability === undefined || can(staff.role, item.capability),
    ),
  })).filter((group) => group.items.length > 0);
}

export function InternalShell({
  staff,
  children,
}: {
  staff: StaffContext | null;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const groups = navGroupsFor(staff);
  const items = groups.flatMap((group) => group.items);

  return (
    <div className="flex min-h-dvh flex-col bg-paper-50 text-charcoal-900 md:h-dvh md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-charcoal-900/10 bg-paper-100 p-5 md:flex">
        <Link to="/intern" className="flex items-center gap-3">
          <Monogram className="h-9 w-9 text-green-800" />
          <span>
            <span className="font-display text-lg leading-tight">Bärengarten</span>
            <span className="block text-[11px] uppercase tracking-widest text-charcoal-600">
              Betrieb
            </span>
          </span>
        </Link>
        <nav className="mt-8 flex flex-col gap-5" aria-label="Intern">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="eyebrow px-3 text-charcoal-600">{group.label}</p>
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "rounded-sm px-3 py-2 text-sm " +
                    (pathname === item.to
                      ? "bg-green-800 text-paper-50"
                      : "text-charcoal-900 hover:bg-paper-50")
                  }
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto pt-6">
          <UserButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-charcoal-900/10 bg-paper-100 px-4 md:hidden">
        <Link to="/intern" className="flex items-center gap-2">
          <Monogram className="h-7 w-7 text-green-800" />
          <span className="font-display text-base leading-none">Bärengarten</span>
          <span className="text-[11px] uppercase tracking-widest text-charcoal-600">
            Betrieb
          </span>
        </Link>
        <UserButton />
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Wide enough for the dashboard control tower at 1440px while Heute
            keeps its own narrower reading width. */}
        <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-28 md:max-w-6xl md:pb-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      {items.length > 0 ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-charcoal-900/10 bg-paper-50 md:hidden"
          aria-label="Intern mobil"
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={
                "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs " +
                (pathname === item.to
                  ? "text-wine-700"
                  : "text-charcoal-600")
              }
            >
              <span className="font-mono text-sm leading-none">●</span>
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => void signOut("/login")}
            className="flex flex-1 flex-col items-center gap-0.5 py-3 text-xs text-charcoal-600"
          >
            <span className="font-mono text-sm leading-none">○</span>
            Abmelden
          </button>
        </nav>
      ) : null}
    </div>
  );
}
