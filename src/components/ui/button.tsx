import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-sans text-sm font-medium transition-[color,background-color,border-color,transform,opacity] duration-300 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] min-h-control px-6",
  {
    variants: {
      variant: {
        wine: "bg-wine-700 text-paper-50 hover:bg-wine-900 ring-offset-paper-50",
        green: "bg-green-800 text-paper-50 hover:bg-green-950 ring-offset-paper-50",
        secondary:
          "bg-transparent text-charcoal-900 border border-charcoal-900/25 hover:bg-paper-100 ring-offset-paper-50",
        inverse: "bg-paper-50 text-green-950 hover:bg-paper-100 ring-offset-green-800",
        ghost:
          "bg-transparent text-current underline-offset-4 hover:underline min-h-0 px-0 py-0",
      },
      size: {
        default: "min-h-control",
        lg: "min-h-14 px-8 text-[0.9375rem]",
      },
    },
    defaultVariants: {
      variant: "wine",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
