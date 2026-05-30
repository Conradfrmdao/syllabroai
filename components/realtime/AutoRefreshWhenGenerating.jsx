"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefreshWhenGenerating({
  enabled = false,
  intervalMs = 4000,
}) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs, router]);

  return null;
}
