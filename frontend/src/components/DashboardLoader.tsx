import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

type DashboardLoaderProps = {
  forceVisible?: boolean;
  leftOffsetClassName?: string;
};

export function DashboardLoader({
  forceVisible = false,
  leftOffsetClassName = "left-[72px]",
}: DashboardLoaderProps) {
  const { isLoading, hasPendingMatches } = useRouterState({
    select: (state) => ({
      isLoading: state.isLoading,
      hasPendingMatches: state.matches.some((match) => match.status === "pending"),
    }),
    structuralSharing: true,
  });

  const isPending = forceVisible || isLoading || hasPendingMatches;
  const [isVisible, setIsVisible] = useState(isPending);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;
    let frameId: number | undefined;
    let removeListeners: (() => void) | undefined;
    let isCancelled = false;

    const beginFadeOut = () => {
      if (isCancelled || !isVisible) {
        return;
      }

      setIsFading(true);
      timeoutId = window.setTimeout(() => {
        if (isCancelled) {
          return;
        }
        setIsVisible(false);
        setIsFading(false);
      }, 350);
    };

    const waitForImages = () => {
      const images = Array.from(document.querySelectorAll("img")).filter(
        (img) => !img.complete,
      );

      if (images.length === 0) {
        beginFadeOut();
        return;
      }

      let pendingCount = images.length;

      const handleSettled = () => {
        pendingCount -= 1;
        if (pendingCount <= 0) {
          removeListeners?.();
          beginFadeOut();
        }
      };

      removeListeners = () => {
        images.forEach((img) => {
          img.removeEventListener("load", handleSettled);
          img.removeEventListener("error", handleSettled);
        });
      };

      images.forEach((img) => {
        img.addEventListener("load", handleSettled, { once: true });
        img.addEventListener("error", handleSettled, { once: true });
      });
    };

    if (isPending) {
      setIsVisible(true);
      setIsFading(false);
      return undefined;
    }

    if (isVisible) {
      frameId = window.requestAnimationFrame(waitForImages);
    }

    return () => {
      isCancelled = true;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      removeListeners?.();
    };
  }, [isPending, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-y-0 right-0 ${leftOffsetClassName} z-20 flex items-center justify-center bg-[var(--loader-bg)] transition-opacity duration-350 ease-in-out ${
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
