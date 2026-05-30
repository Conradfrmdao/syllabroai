import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

import { getOrCreateCurrentUser } from "@/lib/current-user";

export default async function DashboardTopbar() {
  const user = await getOrCreateCurrentUser();

  let welcomeText = "Welcome back";

  if (user && user.name) {
    welcomeText = `Welcome, ${user.name}`;
  }

  return (
    <header className="sticky top-0 z-20 w-full px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full items-center justify-between gap-4 rounded-full border border-white/10 bg-[#151515]/72 px-4 py-3 shadow-[0_18px_60px_-44px_rgba(0,0,0,1)] backdrop-blur-2xl">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src="/syllabro-icon.png"
            alt="SyllabroAI logo"
            width={30}
            height={30}
            className="h-8 w-8 shrink-0 object-contain"
            priority
          />

          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-[0.2em] text-white/36">
              Study workspace
            </p>
            <p className="truncate text-sm font-medium text-white/78">
              {welcomeText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1.5">
          <p className="hidden text-xs font-medium text-white/54 sm:block">
            Study mode active
          </p>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}
