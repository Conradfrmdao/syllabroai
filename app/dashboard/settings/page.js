export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { UserButton } from "@clerk/nextjs";
import {
  BadgeCheck,
  CreditCard,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateCurrentUser } from "@/lib/current-user";

function formatDate(date) {
  if (!date) {
    return "Not available";
  }

  return new Date(date).toLocaleDateString();
}

function InfoRow({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/8 bg-black/30 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-white/36">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-white/82">
        {value}
      </p>
    </div>
  );
}

function SectionIcon({ children }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white">
      {children}
    </div>
  );
}

export default async function SettingsPage() {
  let appUser = null;
  let errorMessage = "";

  try {
    appUser = await getOrCreateCurrentUser();
  } catch (error) {
    console.warn("Failed to fetch settings user:", error?.message ?? error);
    errorMessage =
      "Account settings are temporarily unavailable. Please refresh in a moment.";
  }

  if (errorMessage) {
    return (
      <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
        {errorMessage}
      </p>
    );
  }

  if (!appUser) {
    return <div>You must be signed in to view settings.</div>;
  }

  let planName = appUser.plan;

  if (!planName) {
    planName = "free";
  }

  let displayName = appUser.name;

  if (!displayName) {
    displayName = "Not provided";
  }

  let displayEmail = appUser.email;

  if (!displayEmail) {
    displayEmail = "Not provided";
  }

  return (
    <div className="w-full">
      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="glass-panel-strong rounded-[2rem]">
          <CardHeader className="border-b border-white/8 p-3">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <UserRound className="h-5 w-5" />
              </SectionIcon>
              <CardTitle className="text-xl">Account</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="grid gap-2 p-3 sm:grid-cols-3">
            <InfoRow label="Name" value={displayName} />
            <InfoRow label="Email" value={displayEmail} />
            <InfoRow
              label="Account Created"
              value={formatDate(appUser.createdAt)}
            />
          </CardContent>
        </Card>

        <Card className="glass-panel-strong rounded-[2rem]">
          <CardHeader className="border-b border-white/8 p-3">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <BadgeCheck className="h-5 w-5" />
              </SectionIcon>
              <CardTitle className="text-xl">Plan</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="grid gap-2 p-3 sm:grid-cols-2">
            <InfoRow label="Current Plan" value={planName} />
            <InfoRow label="Weekly Course Limit" value="2 courses" />
          </CardContent>
        </Card>

        <Card className="glass-panel-strong rounded-[2rem]">
          <CardHeader className="border-b border-white/8 p-3">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <ShieldCheck className="h-5 w-5" />
              </SectionIcon>
              <CardTitle className="text-xl">Account Security</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 p-3">
            <p className="text-sm leading-6 text-white/62">
              Authentication, sessions, and profile management are handled
              securely by Clerk.
            </p>

            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/30 p-3">
              <div>
                <p className="text-sm font-medium text-white">Clerk account</p>
                <p className="text-xs leading-5 text-white/48">
                  Open your Clerk menu to manage your signed-in account.
                </p>
              </div>

              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-strong rounded-[2rem]">
          <CardHeader className="border-b border-white/8 p-3">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <CreditCard className="h-5 w-5" />
              </SectionIcon>
              <CardTitle className="text-xl">Coming Soon</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/8 bg-black/30 p-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-white/62" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Payments and upgrades
                  </p>
                  <p className="text-xs leading-5 text-white/48">
                    Upgrade and billing controls are not live yet.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/30 p-3">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="h-4 w-4 text-white/62" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Learning preferences
                  </p>
                  <p className="text-xs leading-5 text-white/48">
                    Personalized learning controls will come later.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
