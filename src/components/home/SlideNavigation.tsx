import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SlideNavigationProps {
  totalSlides: number;
  currentSlide: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export function SlideNavigation({
  totalSlides,
  currentSlide,
  onPrev,
  onNext,
  onGoTo,
}: SlideNavigationProps) {
  return (
    <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={currentSlide === 0}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalSlides }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onGoTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i === currentSlide ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={currentSlide === totalSlides - 1}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
