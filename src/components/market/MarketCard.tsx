import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { MarketWithPrices } from "@/types";
import { MarketStatusBadge } from "./MarketStatusBadge";
import { ProbabilityBar } from "./ProbabilityBar";

interface MarketCardProps {
  market: MarketWithPrices;
}

export function MarketCard({ market }: MarketCardProps) {
  return (
    <Card className="cursor-pointer transition-colors hover:border-foreground/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            {market.condition.question}
          </CardTitle>
          <MarketStatusBadge
            isResolved={market.isResolved}
            resolvedOutcome={market.resolvedOutcome}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ProbabilityBar yesProb={market.yesProb} noProb={market.noProb} />
        {!market.isResolved && (
          // biome-ignore lint/a11y/noStaticElementInteractions: stops click propagation only
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/markets/$conditionId/resolve"
                params={{ conditionId: market.condition.conditionId }}
              >
                Resolve
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
