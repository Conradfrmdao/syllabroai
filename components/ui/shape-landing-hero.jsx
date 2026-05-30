"use client";

import Link from "next/link";

function HeroGeometric({
  badge = "AI-Powered Learning Platform",
  title1 = "Turn Any Learning Goal Into a",
  title2 = "Complete AI-Generated Course",
  description,
  trustLine,
  primaryHref = "/sign-up",
  secondaryHref = "#how-it-works",
}) {
  return (
    <section className="dot-matrix relative overflow-hidden border-b border-white/8 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.12),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-white/[0.05] to-transparent" />
      <div className="absolute bottom-[-12rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-300/10 blur-[110px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="max-w-4xl space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1f1f1f57] px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-white/64 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-sky-300" />
            {badge}
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              <span className="text-white">{title1}</span>
              <br />
              <span className="text-gradient">
                {title2}
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg leading-8 text-white/62">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={primaryHref}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white bg-white px-5 text-sm font-medium text-black transition hover:bg-white/92"
            >
              Start Learning Free
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-[#1f1f1f57] px-5 text-sm font-medium text-white/84 transition hover:bg-white/[0.08] hover:text-white"
            >
              See How It Works
            </Link>
          </div>

          <p className="text-sm text-white/48">{trustLine}</p>
        </div>
      </div>
    </section>
  );
}

export { HeroGeometric };
