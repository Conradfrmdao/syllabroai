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
    <section className="dot-matrix relative w-full max-w-full overflow-hidden border-b border-white/8 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.12),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 hidden h-48 bg-linear-to-b from-white/[0.05] to-transparent sm:block" />
      <div className="absolute bottom-[-12rem] left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-300/10 blur-[90px] sm:h-80 sm:w-80 sm:blur-[110px]" />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full min-w-0 max-w-7xl items-center justify-center overflow-hidden px-4 py-10 sm:min-h-[calc(100vh-5rem)] sm:px-8 sm:py-16 lg:px-10 lg:py-24">
        <div className="w-full min-w-0 max-w-[42rem] space-y-5 text-center sm:max-w-4xl sm:space-y-8">
          <div className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-[#1f1f1f57] px-3 py-1.5 text-[0.62rem] uppercase leading-4 tracking-[0.12em] text-white/64 backdrop-blur-xl sm:text-xs sm:tracking-[0.24em]">
            <span className="h-2 w-2 rounded-full bg-sky-300" />
            <span className="min-w-0 break-words text-center">{badge}</span>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h1 className="mx-auto max-w-full break-words text-[2.45rem] font-semibold leading-[1.03] tracking-[-0.045em] text-white min-[390px]:text-[2.7rem] sm:text-6xl sm:leading-[1.02] lg:text-7xl">
              <span className="text-white">{title1}</span>
              <br />
              <span className="text-gradient">
                {title2}
              </span>
            </h1>

            <p className="mx-auto max-w-3xl break-words text-sm leading-6 text-white/62 sm:text-lg sm:leading-8">
              {description}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 min-[390px]:flex-row min-[390px]:flex-wrap">
            <Link
              href={primaryHref}
              className="inline-flex h-10 w-full max-w-56 items-center justify-center rounded-full border border-white bg-white px-4 text-sm font-medium text-black transition hover:bg-white/92 min-[390px]:w-auto sm:h-11 sm:px-5"
            >
              Start Learning Free
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-10 w-full max-w-56 items-center justify-center rounded-full border border-white/12 bg-[#1f1f1f57] px-4 text-sm font-medium text-white/84 transition hover:bg-white/[0.08] hover:text-white min-[390px]:w-auto sm:h-11 sm:px-5"
            >
              See How It Works
            </Link>
          </div>

          <p className="text-xs text-white/48 sm:text-sm">{trustLine}</p>
        </div>
      </div>
    </section>
  );
}

export { HeroGeometric };
