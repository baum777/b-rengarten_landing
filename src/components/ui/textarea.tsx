import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-32 w-full rounded-sm border border-charcoal-900/16 bg-paper-50 px-3 py-3 font-sans text-base text-charcoal-900 shadow-none transition-[border-color,box-shadow] duration-200 ease-standard placeholder:text-charcoal-600/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-700 focus-visible:border-wine-700 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
