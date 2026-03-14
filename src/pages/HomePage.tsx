import { useState, useEffect, useCallback } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { BarChart3, Zap, Shield, Coins } from "lucide-react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { SlideNavigation } from "@/components/home/SlideNavigation";
import { MultiverseSlideInfo, MultiverseSlidePanel } from "@/components/home/slides/IntroSlide";
import { CreateMarketSlideInfo, CreateMarketSlidePanel } from "@/components/home/slides/CreateMarketSlide";
import { TradeSlideInfo, TradeSlidePanel } from "@/components/home/slides/TradeSlide";
import { LMSRSlideInfo, LMSRSlidePanel } from "@/components/home/slides/LMSRSlide";
import { ResolutionSlideInfo, ResolutionSlidePanel } from "@/components/home/slides/ResolutionSlide";

const TOTAL_SLIDES = 6;
const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (direction: number) => ({ x: `${direction * 100}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: `${direction * -100}%`, opacity: 0 }),
};

const slideTransition = { type: "spring" as const, stiffness: 300, damping: 30 };

// --- Hero slide left-column pieces ---

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  animate: boolean;
  delay: number;
  onAnimationComplete?: () => void;
}

function FeatureCard({ icon, title, description, animate, delay, onAnimationComplete }: FeatureCardProps) {
  return (
    <motion.div
      animate={animate ? { scale: [1, 1.08, 1], y: [0, -8, 0] } : undefined}
      transition={animate ? { type: "spring", stiffness: 400, damping: 15, delay } : undefined}
      onAnimationComplete={onAnimationComplete}
    >
      <Card className="p-4">
        <CardContent className="flex items-start gap-3 p-0">
          <div className="text-primary">{icon}</div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const features = [
  { icon: <BarChart3 className="h-5 w-5" />, title: "LMSR Pricing", description: "Automated market maker with logarithmic scoring" },
  { icon: <Zap className="h-5 w-5" />, title: "Dynamic Fees", description: "Fees adjust based on market volatility" },
  { icon: <Shield className="h-5 w-5" />, title: "Smart Accounts", description: "Gasless transactions via EIP-7702" },
  { icon: <Coins className="h-5 w-5" />, title: "On-chain Settlement", description: "Trustless resolution and redemption" },
];

export function HomePage() {
  const { market: conditionId } = useSearch({ from: "/" });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hasFlourished, setHasFlourished] = useState(false);
  const [triggerFlourish, setTriggerFlourish] = useState(false);

  const shouldAnimateCards = triggerFlourish && !hasFlourished;

  const handleFlourishComplete = useCallback(() => {
    setHasFlourished(true);
    setTriggerFlourish(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentSlide === 0 && !hasFlourished) {
      setTriggerFlourish(true);
      return;
    }
    if (currentSlide < TOTAL_SLIDES - 1) {
      setDirection(1);
      setCurrentSlide((s) => s + 1);
    }
  }, [currentSlide, hasFlourished]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((s) => s - 1);
    }
  }, [currentSlide]);

  const handleGoTo = useCallback(
    (index: number) => {
      if (index === currentSlide) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_e: MouseEvent | TouchEvent | PointerEvent, { offset }: PanInfo) => {
            if (offset.x < -SWIPE_THRESHOLD) handleNext();
            else if (offset.x > SWIPE_THRESHOLD) handlePrev();
          }}
          className="absolute inset-0 grid grid-cols-1 items-center gap-12 px-4 pb-16 pt-12 lg:grid-cols-2"
        >
          {/* Every slide: left = info, right = interactive panel */}
          {currentSlide === 0 && (
            <>
              {/* Hero left */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs">
                    Built on Uniswap V4
                  </span>
                  <span className="ml-1 inline-block rounded-full bg-secondary px-3 py-1 text-xs">
                    Deployed on Unichain
                  </span>
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                    The Multiverse Market
                    <span className="block text-muted-foreground">
                      A Uniswap v4 Hook for Conditional Finance
                    </span>
                  </h1>
                  <p className="max-w-lg text-muted-foreground">
                    Trade on real-world outcomes using LMSR pricing, dynamic fees that
                    adjust to volatility, and gasless transactions via smart accounts.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link to="/markets">Explore Markets</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/create-market">Create Market</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {features.map((f, i) => (
                    <FeatureCard
                      key={f.title}
                      icon={f.icon}
                      title={f.title}
                      description={f.description}
                      animate={shouldAnimateCards}
                      delay={i * 0.1}
                      onAnimationComplete={i === features.length - 1 ? handleFlourishComplete : undefined}
                    />
                  ))}
                </div>
              </div>

              {/* Hero right */}
              <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-8">
                <h2 className="text-lg font-semibold">Demo</h2>
              </div>
            </>
          )}

          {currentSlide === 1 && (
            <>
              <MultiverseSlideInfo />
              <MultiverseSlidePanel />
            </>
          )}

          {currentSlide === 2 && (
            <>
              <CreateMarketSlideInfo />
              <CreateMarketSlidePanel />
            </>
          )}

          {currentSlide === 3 && (
            <>
              <TradeSlideInfo />
              <TradeSlidePanel onGoTo={handleGoTo} conditionId={conditionId} />
            </>
          )}

          {currentSlide === 4 && (
            <>
              <LMSRSlideInfo />
              <LMSRSlidePanel conditionId={conditionId} />
            </>
          )}

          {currentSlide === 5 && (
            <>
              <ResolutionSlideInfo />
              <ResolutionSlidePanel conditionId={conditionId} />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <SlideNavigation
        totalSlides={TOTAL_SLIDES}
        currentSlide={currentSlide}
        onPrev={handlePrev}
        onNext={handleNext}
        onGoTo={handleGoTo}
      />
    </div>
  );
}
