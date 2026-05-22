"use client";

import { useEffect } from "react";
import { ErrorCard } from "@/features/dashboard/ErrorCard";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard/error]", error);
  }, [error]);

  return <ErrorCard onRetry={unstable_retry} />;
}
