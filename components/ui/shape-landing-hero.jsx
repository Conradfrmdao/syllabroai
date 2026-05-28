"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

function ElegantShape({
  className,
  delay = 0,
  width = 420,
  height = 110,
  rotate = 0,
}) {
  return (
    <div
      className={cn("absolute animate-float opacity-70", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className="relative rounded-full border border-white/10 bg-linear-to-r from-white/[0.11] to-transparent shadow-[0_16px_48px_-24px_rgba(255,255,255,0.12)] backdrop-blur-[2px]"
        style={{
          width,
          height,
          transform: `rotate(${rotate}deg)`,
        }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.14),transparent_72%)]" />
      </div>
    </div>
  );
}

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
    <section className="relative overflow-hidden border-b border-white/8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%)]" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.2}
          width={640}
          height={150}
          rotate={12}
          className="left-[-12%] top-[12%]"
        />
        <ElegantShape
          delay={0.5}
          width={520}
          height={124}
          rotate={-14}
          className="right-[-8%] top-[72%]"
        />
        <ElegantShape
          delay={0.8}
          width={260}
          height={72}
          rotate={-10}
          className="left-[4%] bottom-[8%]"
        />
        <ElegantShape
          delay={1}
          width={180}
          height={52}
          rotate={22}
          className="right-[18%] top-[14%]"
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="max-w-4xl space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-white/64">
            <span className="h-2 w-2 rounded-full bg-white" />
            {badge}
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              <span className="text-white">{title1}</span>
              <br />
              <span className="text-gradient">{title2}</span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg leading-8 text-white/62">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={primaryHref}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white bg-white px-5 text-sm font-medium text-black transition hover:bg-white/92"
            >
              Start Learning Free
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-5 text-sm font-medium text-white/84 transition hover:bg-white/[0.08] hover:text-white"
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
