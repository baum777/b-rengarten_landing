import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MobileActionBar } from "@/components/site/mobile-bar";
import { site } from "@/lib/site";
import appCss from "../styles.css?url";

const APP_NAME = "Bärengarten Ravensburg";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Hotel",
      name: "Bärengarten Ravensburg",
      url: "https://baerengarten.de",
      telephone: "+49 751 95877753",
      email: site.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        postalCode: site.address.zip,
        addressLocality: site.address.city,
        addressCountry: "DE",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.geo.lat,
        longitude: site.geo.lng,
      },
    },
    {
      "@type": "Restaurant",
      name: "Bärengarten Restaurant",
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        postalCode: site.address.zip,
        addressLocality: site.address.city,
        addressCountry: "DE",
      },
    },
  ],
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Bärengarten Ravensburg — Hotel mit Restaurant und Biergarten in Ravensburg. Qualität, Ehrlichkeit und persönliche Gastfreundschaft.",
      },
      { name: "theme-color", content: "#1F3B2E" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="de" suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body className="bg-paper-50 text-charcoal-900 pb-14 md:pb-0">
        <PreviewHostBridge />
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper-50 focus:px-4 focus:py-2"
        >
          Zum Inhalt
        </a>
        <AuthProvider>
          <SiteHeader />
          <div id="inhalt">
            <Outlet />
          </div>
          <SiteFooter />
          <MobileActionBar />
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="content-reading min-h-[70vh] pt-32 pb-24">
      <p className="eyebrow text-wine-700">404</p>
      <h1 className="text-display-md mt-4">Diese Seite gibt es nicht.</h1>
      <p className="mt-4 text-charcoal-600">
        Vielleicht lag ein Tippfehler in der Adresse. Zurück zum Haus:
      </p>
      <p className="mt-8">
        <Link to="/" className="underline underline-offset-4">
          Zur Startseite
        </Link>
      </p>
    </main>
  );
}
