import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(function Input(
  {
    className,
    type,
    ...props
  },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-base text-white transition-all outline-none placeholder:text-white/32 focus-visible:border-white/24 focus-visible:ring-3 focus-visible:ring-white/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-white/[0.03] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground md:text-sm",
        className
      )}
      {...props} />
  );
})

export { Input }
