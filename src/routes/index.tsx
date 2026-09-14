import { createFileRoute } from "@tanstack/react-router";
import { HomeHero } from "@/components/sections/page-hero";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Unvernünftige Gastfreundschaft — Bärengarten Ravensburg" },
      {
        name: "description",
        content:
          "Bärengarten Ravensburg — Hotel mit Restaurant und Biergarten. Unvernünftige Gastfreundschaft.",
      },
    ],
  }),
});

function Home() {
  return (
    <main className="h-dvh overflow-hidden">
      <HomeHero />
    </main>
  );
}
