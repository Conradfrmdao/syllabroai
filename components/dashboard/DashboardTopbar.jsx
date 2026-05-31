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
    <header className="sticky top-0 z-20 w-full px-4 pt-2.5 sm:px-6 sm:pt-4 lg:px-8">
      <div className="mx-auto flex w-full items-center justify-between gap-2.5 rounded-[1.25rem] border border-white/10 bg-[#151515]/76 px-2.5 py-2 shadow-[0_18px_60px_-44px_rgba(0,0,0,1)] backdrop-blur-2xl sm:gap-4 sm:rounded-full sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src="/syllabro-icon.png"
            alt="SyllabroAI logo"
            width={30}
            height={30}
            className="h-6 w-6 shrink-0 object-contain sm:h-8 sm:w-8"
            priority
          />

          <div className="min-w-0 max-w-[10rem] sm:max-w-none">
            <p className="truncate text-[0.62rem] uppercase tracking-[0.16em] text-white/36 sm:text-xs sm:tracking-[0.2em]">
              Study workspace
            </p>
            <p className="truncate text-xs font-medium text-white/78 sm:text-sm">
              {welcomeText}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-1.5 sm:gap-3 sm:px-2">
          <p className="hidden text-xs font-medium text-white/54 sm:block">
            Study mode active
          </p>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}
