"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpenText,
  BrainCircuit,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  SquarePen,
} from "lucide-react";

const navItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
    match: "exact",
  },
  {
    name: "Courses",
    href: "/dashboard/courses",
    icon: BookOpenText,
    match: "startsWith",
  },
  {
    name: "Create",
    href: "/dashboard/create-course",
    icon: SquarePen,
    match: "startsWith",
  },
  {
    name: "Quizzes",
    href: "/dashboard/quizzes",
    icon: FileQuestion,
    match: "startsWith",
  },
  {
    name: "More",
    href: "#",
    icon: MoreHorizontal,
    match: "more",
  },
];

const moreItems = [
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

function isActivePath(pathname, item) {
  if (item.match === "exact") {
    if (pathname === item.href) {
      return true;
    }

    return false;
  }

  if (item.match === "more") {
    for (const moreItem of moreItems) {
      if (pathname.startsWith(moreItem.href)) {
        return true;
      }
    }

    return false;
  }

  if (pathname.startsWith(item.href)) {
    return true;
  }

  return false;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleMoreClick = () => {
    setIsMoreOpen((currentValue) => {
      if (currentValue) {
        return false;
      }

      return true;
    });
  };

  const closeMoreMenu = () => {
    setIsMoreOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] lg:hidden">
      {isMoreOpen && (
        <div className="mx-auto mb-3 max-w-md rounded-[1.35rem] border border-white/10 bg-[#151515]/92 p-2 shadow-[0_24px_70px_-34px_rgba(0,0,0,1)] backdrop-blur-2xl">
          <div className="grid grid-cols-3 gap-2">
            {moreItems.map((item) => {
              const Icon = item.icon;
              let itemClass =
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border border-white/8 bg-white/[0.035] px-2 py-3 text-[0.72rem] font-medium text-white/62 transition";

              if (pathname.startsWith(item.href)) {
                itemClass =
                  "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border border-sky-300/20 bg-sky-300/12 px-2 py-3 text-[0.72rem] font-semibold text-white transition";
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMoreMenu}
                  className={itemClass}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav className="mx-auto flex h-[4.15rem] max-w-md items-center justify-between rounded-[1.45rem] border border-white/10 bg-[#151515]/86 p-1 shadow-[0_22px_70px_-36px_rgba(0,0,0,1)] backdrop-blur-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item);
          let itemClass =
            "flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.05rem] px-1 text-[0.64rem] font-medium text-white/48 transition";
          let iconClass = "h-3.5 w-3.5 text-white/48";

          if (isActive) {
            itemClass =
              "flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.05rem] border border-sky-300/18 bg-[linear-gradient(135deg,rgba(14,165,233,0.2),rgba(255,255,255,0.08))] px-1 text-[0.64rem] font-semibold text-white shadow-[0_14px_36px_-26px_rgba(56,189,248,0.48)] transition";
            iconClass = "h-3.5 w-3.5 text-white";
          }

          if (item.match === "more") {
            return (
              <button
                key={item.name}
                type="button"
                onClick={handleMoreClick}
                className={itemClass}
                aria-expanded={isMoreOpen}
              >
                <Icon className={iconClass} />
                <span className="truncate">{item.name}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMoreMenu}
              className={itemClass}
            >
              <Icon className={iconClass} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
