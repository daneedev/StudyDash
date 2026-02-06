import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

export function DashboardLoader() {
  const { isLoading, hasPendingMatches } = useRouterState({
    select: (state) => ({
      isLoading: state.isLoading,
      hasPendingMatches: state.matches.some((match) => match.status === "pending"),
    }),
    structuralSharing: true,
  });

  const isPending = isLoading || hasPendingMatches;
  const [isVisible, setIsVisible] = useState(isPending);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (isPending) {
      setIsVisible(true);
      setIsFading(false);
      return undefined;
    }

    if (isVisible) {
      setIsFading(true);
      timeoutId = window.setTimeout(() => {
        setIsVisible(false);
        setIsFading(false);
      }, 350);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isPending, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-y-0 right-0 left-[72px] z-20 flex items-center justify-center bg-[var(--loader-bg)] transition-opacity duration-350 ease-in-out ${
        isFading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="relative h-1.5 w-[min(410px,80%)] overflow-hidden rounded-xl border border-[var(--color-primary)] bg-[var(--card-bg)] before:absolute before:top-0 before:left-[-35%] before:h-full before:w-[35%] before:animate-[dashboard-loader-move_1.4s_ease-in-out_infinite] before:rounded-xl before:bg-[var(--color-primary)] before:content-['']" />
    </div>
  );
}
