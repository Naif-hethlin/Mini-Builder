"use client";

import { useEffect } from "react";
import { ErrorCard } from "@/features/dashboard/ErrorCard";

export default function BuilderError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[builder/error]", error);
  }, [error]);

  return <ErrorCard onRetry={unstable_retry} />;
}
