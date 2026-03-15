import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StepperNavigationProps {
  steps: { title: string }[];
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export function StepperRail({
  steps,
  currentStep,
  onGoTo,
}: Pick<StepperNavigationProps, "steps" | "currentStep" | "onGoTo">) {
  return (
    <>
      {/* Desktop: vertical sidebar rail */}
      <nav className="hidden lg:flex w-56 shrink-0 flex-col justify-center py-8 pl-6 pr-4">
        <ol className="relative space-y-0">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <li
                key={step.title}
                className="relative flex items-start gap-3 pb-8 last:pb-0"
              >
                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <span
                    className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 ${
                      isCompleted ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => onGoTo(i)}
                  className="flex items-center gap-3 text-left"
                >
                  {/* Circle */}
                  <span
                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                          : "border border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {/* Title */}
                  <span
                    className={`text-sm transition-colors ${
                      isCurrent
                        ? "font-semibold text-foreground"
                        : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile: thin progress bar + step label */}
      <div className="lg:hidden px-4 pt-4 pb-2 space-y-2">
        <div className="h-1 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {steps.length} —{" "}
          <span className="font-medium text-foreground">
            {steps[currentStep]?.title}
          </span>
        </p>
      </div>
    </>
  );
}

export function StepperBottomNav({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
}: Pick<StepperNavigationProps, "currentStep" | "onPrev" | "onNext"> & {
  totalSteps: number;
}) {
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between border-t border-border px-6 py-4">
      {currentStep > 0 ? (
        <Button variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      ) : (
        <div />
      )}

      {isLast ? (
        <Button asChild>
          <Link to="/markets">
            Explore Markets
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button onClick={onNext}>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
