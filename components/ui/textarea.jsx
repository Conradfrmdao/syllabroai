import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(function Textarea(
  {
    className,
    ...props
  },
  ref
) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex min-h-32 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white transition-all outline-none placeholder:text-white/32 focus-visible:border-white/24 focus-visible:ring-3 focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:bg-white/[0.03] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props} />
  );
})

export { Textarea }
