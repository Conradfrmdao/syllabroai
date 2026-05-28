import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-3 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-white/14 bg-white/[0.1] text-white [a]:hover:bg-white/[0.14]",
        secondary:
          "border-white/10 bg-white/[0.06] text-white/80 [a]:hover:bg-white/[0.1]",
        destructive:
          "border-rose-500/20 bg-rose-500/15 text-rose-100 focus-visible:ring-destructive/20 dark:bg-rose-500/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-rose-500/22",
        outline:
          "border-white/10 text-white/82 [a]:hover:bg-white/[0.08] [a]:hover:text-white",
        ghost:
          "hover:bg-white/[0.08] hover:text-white dark:hover:bg-white/[0.08]",
        link: "text-white underline-offset-4 hover:text-white/74 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
