import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Proprietary crop: rectangle with one concave bite. Not ornament. */
export function GardenFrame({
  children,
  className,
  corner = "br",
}: {
  children: ReactNode;
  className?: string;
  corner?: "br" | "bl";
}) {
  return (
    <div
      className={cn(
        "garden-frame overflow-hidden",
        corner === "bl" && "garden-frame-bl",
        className,
      )}
    >
      {children}
    </div>
  );
}
