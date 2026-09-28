import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { getDashboard } from "@/lib/operations/functions";
import { DashboardView } from "@/components/internal/dashboard/dashboard-view";
import type { DashboardData } from "@/lib/dashboard/model";

const searchSchema = z.object({
  range: z.enum(["heute", "7tage", "30tage"]).default("7tage"),
});

export const Route = createFileRoute("/intern/dashboard")({
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  // The range filter re-runs the loader server-side; operative today-KPIs are
  // computed unconditionally and stay independent of it.
  loaderDeps: ({ search }) => ({ range: search.range }),
  loader: ({ deps }) => getDashboard({ data: { range: deps.range } }),
  component: DashboardPage,
});

function DashboardPage() {
  // The payload is aggregated by scripts/operations.mjs (untyped JS boundary).
  const data = Route.useLoaderData() as DashboardData;
  return <DashboardView data={data} />;
}
