"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  FileQuestion,
  LayoutDashboard,
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
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    match: "startsWith",
  },
];

function isActivePath(pathname, item) {
  if (item.match === "exact") {
    if (pathname === item.href) {
      return true;
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

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] lg:hidden">
      <nav className="mx-auto flex max-w-md items-center justify-between rounded-full border border-white/10 bg-[#151515]/82 px-2 py-2 shadow-[0_22px_70px_-36px_rgba(0,0,0,1)] backdrop-blur-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item);
          let itemClass =
            "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full px-2 py-2 text-[0.68rem] font-medium text-white/48 transition";
          let iconClass = "h-4 w-4 text-white/48";

          if (isActive) {
            itemClass =
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full border border-white/12 bg-white text-[0.68rem] font-semibold text-black shadow-[0_14px_36px_-24px_rgba(255,255,255,0.38)] transition";
            iconClass = "h-4 w-4 text-black";
          }

          return (
            <Link key={item.href} href={item.href} className={itemClass}>
              <Icon className={iconClass} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
