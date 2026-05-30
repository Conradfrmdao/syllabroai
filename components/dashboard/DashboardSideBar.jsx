"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  BrainCircuit,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  Settings,
  SquarePen,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Courses",
    href: "/dashboard/courses",
    icon: BookOpenText,
  },
  {
    name: "Create Course",
    href: "/dashboard/create-course",
    icon: SquarePen,
  },
  {
    name: "Quizzes",
    href: "/dashboard/quizzes",
    icon: FileQuestion,
  },
  {
    name: "Flashcards",
    href: "/dashboard/flashcards",
    icon: BrainCircuit,
  },
  {
    name: "Exams",
    href: "/dashboard/exams",
    icon: GraduationCap,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-b border-white/8 bg-[#070b14]/72 backdrop-blur-2xl lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-72 lg:border-b-0 lg:border-r lg:border-white/8">
      <div className="flex h-full flex-col gap-6 p-4 sm:p-5 lg:p-6">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#111521]/68 p-4 shadow-[0_24px_70px_-50px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <Image
              src="/syllabro-icon.png"
              alt="SyllabroAI logo"
              width={46}
              height={46}
              className="h-12 w-12 object-contain"
            />

            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/38">
                AI Study Lab
              </p>
              <h2 className="text-lg font-semibold text-white">SyllabroAI</h2>
            </div>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex min-w-max items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all",
                  isActive
                    ? "border-white/18 bg-white/[0.09] text-white shadow-[0_18px_38px_-28px_rgba(56,189,248,0.18)]"
                    : "border-white/0 bg-white/[0.03] text-white/62 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
                    isActive
                      ? "border-white/14 bg-white/[0.08] text-white"
                      : "border-white/8 bg-white/[0.04] text-white/56 group-hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

      </div>
    </aside>
  );
}
