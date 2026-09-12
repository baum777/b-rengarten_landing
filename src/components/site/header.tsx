import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { BrandLink } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";

const overlayRoutes = new Set([
  "/",
  "/hotel",
  "/restaurant",
  "/biergarten",
  "/anlaesse",
]);

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const canOverlay = overlayRoutes.has(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const inverted = canOverlay && !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,color,box-shadow,border-color] duration-300 ease-standard",
        inverted
          ? "bg-transparent text-paper-50"
          : "bg-paper-50/95 text-charcoal-900 border-b border-charcoal-900/10 backdrop-blur-sm",
      )}
    >
      <div className="content-wide flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <BrandLink inverted={inverted} />

        <nav
          className="hidden lg:flex items-center gap-8"
          aria-label="Hauptnavigation"
        >
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "font-sans text-sm font-medium tracking-wide transition-opacity duration-200 hover:opacity-70",
                pathname.startsWith(item.to) && "underline underline-offset-8",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/hotel/buchen"
            className={buttonVariants({
              variant: inverted ? "inverse" : "wine",
            })}
          >
            Zimmer
          </Link>
          <Link
            to="/restaurant/reservieren"
            className={buttonVariants({
              variant: inverted ? "secondary" : "green",
              className: inverted
                ? "border-paper-50/40 text-paper-50 hover:bg-paper-50/10"
                : undefined,
            })}
          >
            Tisch
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-sm"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="lg:hidden border-t border-charcoal-900/10 bg-paper-50 text-charcoal-900"
        >
          <nav
            className="content-wide flex flex-col py-6 gap-1"
            aria-label="Mobiles Menü"
          >
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="min-h-12 flex items-center font-display text-2xl tracking-tight"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/ueber-uns"
              className="min-h-12 flex items-center font-display text-2xl tracking-tight"
            >
              Über uns
            </Link>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild variant="wine">
                <Link to="/hotel/buchen">Zimmer anfragen</Link>
              </Button>
              <Button asChild variant="green">
                <Link to="/restaurant/reservieren">Tisch reservieren</Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
