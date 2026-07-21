import { type ReactNode } from "react";
import { Check, ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * ---- Types -------------------------------------------------------------
 */

export interface StepNavigatorStep {
  
  id: string;  /** Stable unique id for the step (used as React key + click callback arg) */
  
  label: string; /** Title shown in the sidebar list, e.g. "Your Name" */
  
  sublabel?: string;  /** Small muted line under the label in the sidebar, e.g. "Browse and upload" */
  
  icon: ReactNode;  /** Icon shown in the circular node. Any ReactNode — usually a lucide-react icon */
  
  heading?: string;  /** Big heading shown in the content pane when this step is active. Falls back to `label` */
  
  description?: string;  /** Supporting copy shown under the heading in the content pane */
}

export interface StepNavigatorProps {
  steps: StepNavigatorStep[];
  currentStep: number;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onStepClick?: (index: number) => void;
  clickableSteps?: "completed" | "all" | "none";
  className?: string;
  onBack?: () => void;
  backLabel?: string;
}

type StepStatus = "completed" | "active" | "upcoming";

function getStatus(index: number, currentStep: number): StepStatus {
  if (index < currentStep) return "completed";
  if (index === currentStep) return "active";
  return "upcoming";
}


//  ---- Component -----------------------------------------------------------

export function StepNavigator({
  steps,
  currentStep,
  children,
  title,
  subtitle,
  onStepClick,
  clickableSteps = "completed",
  className = "",
  onBack,
  backLabel = "Back",
}: StepNavigatorProps) {
  const active = steps[currentStep];

  const isClickable = (index: number, status: StepStatus) => {
    if (!onStepClick || clickableSteps === "none") return false;
    if (clickableSteps === "all") return true;
    return status === "completed"||currentStep>index;
  };

  return (
    <div
      className={cn(
        "h-screen flex w-fullWidth p-16 overflow-hidden bg-background text-foreground",
        className,
      )}
    >
      {/* ---------------- Sidebar: steps list ---------------- */}
      <div className="w-[280px] shrink-0 border-r border-border px-7 py-8">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        <ol className="relative">
          {steps.map((step, index) => {
            const status = getStatus(index, currentStep);
            const clickable = isClickable(index, status);
            const isLast = index === steps.length ;

            return (
              <li key={step.id} className="relative pb-8 last:pb-0">
                {/* connecting line */}
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-[19px] top-10 h-[calc(100%-24px)] w-px",
                      status === "completed" ? "bg-primary/60" : "bg-border",
                    )}
                  />
                )}

                <button
                  type="button"
                  onClick={() => clickable && onStepClick?.(index)}
                  disabled={!clickable}
                  className={cn(
                    "group flex w-full items-start gap-3 text-left",
                    clickable ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  {/* node */}
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                      status === "completed" &&
                        "bg-primary/15 text-primary ring-1 ring-primary/40",
                      status === "active" &&
                        "bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(16,185,129,0.15)]",
                      status === "upcoming" &&
                        "bg-muted text-muted-foreground ring-1 ring-border",
                    )}
                  >
                    {status === "completed" ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      step.icon
                    )}
                  </span>

                  {/* label */}
                  <span className="pt-1.5">
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        status === "upcoming"
                          ? "text-muted-foreground"
                          : "text-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                    {step.sublabel && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {step.sublabel}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ---------------- Content pane: active step + children ---------------- */}
      <div className="flex-1 px-9 py-8 flex flex-col">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </button>
        )}
        <div className="mb-5 border-b border-border pb-5">
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            Step {currentStep + 1}/{steps.length}
          </span>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            {active?.heading ?? active?.label}
          </h1>
          {active?.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {active.description}
            </p>
          )}
        </div>
        

        {children}
      </div>
    </div>
  );
}

export default StepNavigator;
