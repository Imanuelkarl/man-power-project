
import { cn } from "../../lib/utils";

interface LoaderProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loader = ({
  isLoading,
  message = "Loading...",
  fullScreen = true,
  className,
}: LoaderProps) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        fullScreen
          ? "fixed inset-0 z-500 flex items-center justify-center bg-background/90 backdrop-blur-sm"
          : "relative flex items-center justify-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex min-w-[220px] max-w-xs flex-col items-center gap-4 rounded-3xl border border-border/70 bg-card/95 p-6 shadow-xl shadow-black/10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/20 border-t-primary animate-spin">
          <span className="sr-only">{message}</span>
        </div>
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
};

export { Loader };