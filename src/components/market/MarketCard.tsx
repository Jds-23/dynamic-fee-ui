import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProbabilityBar } from "./ProbabilityBar";
import { MarketStatusBadge } from "./MarketStatusBadge";
import type { MarketWithPrices } from "@/types";

interface MarketCardProps {
  market: MarketWithPrices;
  onClick: () => void;
}

export function MarketCard({ market, onClick }: MarketCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:border-foreground/20"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{market.condition.question}</CardTitle>
          <MarketStatusBadge
            isResolved={market.isResolved}
            resolvedOutcome={market.resolvedOutcome}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ProbabilityBar yesProb={market.yesProb} noProb={market.noProb} />
      </CardContent>
    </Card>
  );
}
