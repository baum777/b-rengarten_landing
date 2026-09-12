import { createFileRoute } from "@tanstack/react-router";
import { HomeHero, CtaBand } from "@/components/sections/page-hero";
import { PortalGrid } from "@/components/sections/portals";
import {
  RestaurantEditorial,
  HotelUtility,
  HostManifesto,
  GardenFeature,
  LocationSection,
  ProofPrinciples,
} from "@/components/sections/home";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Bärengarten Ravensburg — Hotel, Restaurant, Biergarten" },
      {
        name: "description",
        content:
          "Bärengarten Ravensburg — Hotel mit Restaurant und Biergarten in Ravensburg. Qualität, Ehrlichkeit und persönliche Gastfreundschaft.",
      },
    ],
  }),
});

function Home() {
  return (
    <main>
      <HomeHero />
      <PortalGrid />
      <RestaurantEditorial />
      <HotelUtility />
      <HostManifesto />
      <GardenFeature />
      <LocationSection />
      <ProofPrinciples />
      <CtaBand />
    </main>
  );
}
