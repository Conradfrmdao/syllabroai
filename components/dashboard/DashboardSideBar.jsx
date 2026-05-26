"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Create Course",
    href: "/dashboard/create-course",
  },
  {
    name: "Courses",
    href: "/dashboard/courses",
  },
  {
    name: "Quizzes",
    href: "/dashboard/quizzes",
  },
  {
    name: "Flashcards",
    href: "/dashboard/flashcards",
  },
  {
    name: "Exams",
    href: "/dashboard/exams",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
  }
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r p-6">
      <h2 className="mb-6 text-xl font-bold">Syllabro Ai</h2>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "rounded-md bg-black px-3 py-2 text-white"
                  : "rounded-md px-3 py-2 hover:bg-gray-100"
              }
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}