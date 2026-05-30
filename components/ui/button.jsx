import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-white bg-white text-black shadow-[0_18px_44px_-24px_rgba(255,255,255,0.32)] hover:translate-y-[-1px] hover:bg-white/92",
        outline:
          "border-white/12 bg-white/[0.03] text-white/82 backdrop-blur-xl hover:border-white/22 hover:bg-white/[0.08] hover:text-white aria-expanded:bg-white/[0.08] aria-expanded:text-white",
        secondary:
          "border-white/10 bg-white/[0.07] text-white hover:bg-white/[0.1] aria-expanded:bg-white/[0.1] aria-expanded:text-white",
        ghost:
          "text-white/72 hover:bg-white/[0.08] hover:text-white aria-expanded:bg-white/[0.08] aria-expanded:text-white",
        destructive:
          "border-rose-500/25 bg-rose-500/15 text-rose-100 hover:bg-rose-500/22 focus-visible:border-rose-500/40 focus-visible:ring-rose-400/20 dark:bg-rose-500/20 dark:hover:bg-rose-500/28 dark:focus-visible:ring-rose-400/30",
        link: "text-white underline-offset-4 hover:text-white/74 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-xl px-2.5 text-xs in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 rounded-xl px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-1.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-8",
        "icon-xs":
          "size-7 rounded-xl in-data-[slot=button-group]:rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-xl in-data-[slot=button-group]:rounded-xl",
        "icon-lg": "size-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
