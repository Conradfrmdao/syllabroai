import { UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getOrCreateCurrentUser } from "@/lib/current-user";

export default async function DashboardTopbar() {
  const user = await getOrCreateCurrentUser();

  let welcomeText = "Welcome back";

  if (user && user.name) {
    welcomeText = `Welcome, ${user.name}`;
  }

  return (
    <header className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <div className="glass-panel mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-[1.75rem] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            Learning dashboard
          </Badge>

          <div>
            <p className="text-sm text-white/56">{welcomeText}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Syllabro AI Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 sm:self-auto">
          <div className="hidden text-right sm:block">
            <p className="text-xs uppercase tracking-[0.24em] text-white/35">
              Workspace
            </p>
            <p className="text-sm text-white/72">Study mode active</p>
          </div>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}
