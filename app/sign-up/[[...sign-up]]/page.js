import Link from "next/link";
import Image from "next/image";
import { SignUp } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
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

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="flex items-center gap-3">
          <Image
            src="/syllabro-icon.png"
            alt="SyllabroAI logo"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
          <span className="text-2xl font-semibold tracking-[-0.03em] text-white">
            SyllabroAI
          </span>
        </div>

        <SignUp />
      </div>
    </div>
  );
}
