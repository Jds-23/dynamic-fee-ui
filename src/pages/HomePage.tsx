import { useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  StepperBottomNav,
  StepperRail,
} from "@/components/home/StepperNavigation";
import {
  CreateMarketSlideInfo,
  CreateMarketSlidePanel,
} from "@/components/home/slides/CreateMarketSlide";
import { HeroSlideInfo } from "@/components/home/slides/HeroSlide";
import {
  MultiverseSlideInfo,
  MultiverseSlidePanel,
} from "@/components/home/slides/IntroSlide";
import {
  LMSRSlideInfo,
  LMSRSlidePanel,
} from "@/components/home/slides/LMSRSlide";
import {
  ResolutionSlideInfo,
  ResolutionSlidePanel,
} from "@/components/home/slides/ResolutionSlide";
import {
  ThankYouSlideInfo,
  ThankYouSlidePanel,
} from "@/components/home/slides/ThankYouSlide";
import {
  TradeSlideInfo,
  TradeSlidePanel,
} from "@/components/home/slides/TradeSlide";

const STEPS = [
  { title: "Welcome", Info: HeroSlideInfo, Panel: null },
  {
    title: "Multiverse",
    Info: MultiverseSlideInfo,
    Panel: MultiverseSlidePanel,
  },
  {
    title: "Creation",
    Info: CreateMarketSlideInfo,
    Panel: CreateMarketSlidePanel,
  },
  { title: "Swaps", Info: TradeSlideInfo, Panel: TradeSlidePanel },
  { title: "LMSR", Info: LMSRSlideInfo, Panel: LMSRSlidePanel },
  {
    title: "Resolution",
    Info: ResolutionSlideInfo,
    Panel: ResolutionSlidePanel,
  },
  {
    title: "Thanks",
    Info: ThankYouSlideInfo,
    Panel: ThankYouSlidePanel,
  },
];

const stepTransition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const };

export function HomePage() {
  const { market: conditionId } = useSearch({ from: "/" });
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleGoTo = useCallback(
    (index: number) => {
      if (index === currentStep) return;
      setDirection(index > currentStep ? 1 : -1);
      setCurrentStep(index);
    },
    [currentStep],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrev]);

  const step = STEPS[currentStep];
  if (!step) return null;
  const { Info, Panel } = step;

  // Props forwarded to panels that accept them
  const panelProps: Record<string, unknown> = {};
  if (currentStep === 3) {
    panelProps.onGoTo = handleGoTo;
    panelProps.conditionId = conditionId;
  }
  if (currentStep === 4 || currentStep === 5) {
    panelProps.conditionId = conditionId;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-1">
        {/* Mobile progress bar */}
        <StepperRail
          steps={STEPS}
          currentStep={currentStep}
          onGoTo={handleGoTo}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Content area */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{ y: direction * 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: direction * -40, opacity: 0 }}
                transition={stepTransition}
                className={`absolute inset-0 grid grid-cols-1 items-center gap-12 overflow-y-auto px-4 pb-16 pt-12 ${Panel ? "lg:grid-cols-2" : ""}`}
              >
                <Info />
                {Panel && <Panel {...panelProps} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <StepperBottomNav
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
