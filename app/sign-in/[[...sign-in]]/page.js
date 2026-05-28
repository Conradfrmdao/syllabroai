import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="app-shell-bg flex min-h-screen flex-col px-5 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/78 transition hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <SignIn />
      </div>
    </div>
  );
}
