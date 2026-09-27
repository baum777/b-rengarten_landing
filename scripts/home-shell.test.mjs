import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * R3-Homepage-Verträge als deterministische statische Checks:
 *  - Die Startseite ist ein scrollendes Dokument (keine Single-View-Locks).
 *  - Footer und Mobile-Bar rendern auf der Startseite.
 *  - Jede Homepage-CTA auflöst zu einer existierenden Route.
 *  - Bildwahl: nur Property-relevante Assets, falsche-Haus-Foto ausgeschlossen.
 *  - Keine HOLD-Fakten / R1-Verbots-Claims im Homepage-Quelltext.
 */
const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

describe("R3 homepage shell", () => {
  const index = read("src/routes/index.tsx");
  const rootRoute = read("src/routes/__root.tsx");

  it("homepage is a scrolling document — no single-view locks", () => {
    for (const lock of ["h-dvh", "overflow-hidden", "overflow-y-hidden"]) {
      assert.ok(!index.includes(lock), `index.tsx uses ${lock}`);
    }
    assert.ok(!rootRoute.includes("isHome"), "__root.tsx still gates on isHome");
    assert.ok(
      !rootRoute.includes("classList.toggle"),
      "html/body overflow lock remains in __root.tsx",
    );
  });

  it("footer and mobile action bar render on every public page", () => {
    assert.match(rootRoute, /\{isInternal \? null : <SiteFooter \/>\}/);
    assert.match(rootRoute, /\{isInternal \? null : <MobileActionBar \/>\}/);
  });

  it("every homepage CTA target resolves to an existing route file", () => {
    const targets = [...index.matchAll(/to="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((to) => to.startsWith("/"));
    assert.ok(targets.length >= 5, `expected homepage CTAs, found ${targets.length}`);
    for (const to of targets) {
      const base = to === "/" ? "index" : to.replace(/^\//, "");
      const candidates = [
        join(root, "src", "routes", `${base}.tsx`),
        join(root, "src", "routes", base, "index.tsx"),
      ];
      assert.ok(
        candidates.some((candidate) => existsSync(candidate)),
        `route target ${to} has no route file`,
      );
    }
  });

  it("image references use known site keys and exclude non-property assets", () => {
    const site = read("src/lib/site.ts");
    const knownKeys = [...site.matchAll(/(\w+): "\/images\//g)].map(
      (match) => match[1],
    );
    const usedKeys = [...index.matchAll(/images\.(\w+)/g)].map(
      (match) => match[1],
    );
    assert.ok(usedKeys.length >= 5, `expected homepage images, found ${usedKeys.length}`);
    for (const key of usedKeys) {
      assert.ok(knownKeys.includes(key), `unknown image key images.${key}`);
    }
    // entrance.jpg zeigt ein Fremd-Schild ("Zum Hirschen") — niemals als
    // Property-Foto nutzen; Gerichte/Frühstück/Küche sind keine belegten
    // Haus-Fakten und bleiben raus.
    for (const banned of ["entrance", "foodMaultaschen", "foodRoast", "breakfast", "kitchen", "hostService"]) {
      assert.ok(!usedKeys.includes(banned), `image images.${banned} must not appear on the homepage`);
    }
  });

  it("carries no HOLD facts or R1-claim strings in homepage source", () => {
    for (const banned of ["14.000", "Biertank", "Junior Suite", "Komfort", "Business", "Zwiebelrostbraten", "Maultaschen", "Frühstück", "Check-in 15"]) {
      assert.ok(!index.includes(banned), `${banned} appeared in index.tsx`);
    }
  });
});
