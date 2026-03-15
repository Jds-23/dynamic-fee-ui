import { useState, useCallback } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { ProbabilityBar } from "@/components/market/ProbabilityBar";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { ResolvePanel } from "@/components/market/ResolvePanel";
import { RedeemPanel } from "@/components/market/RedeemPanel";
import { useMarketState } from "@/hooks/market/useMarketState";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";
import { fetchMarkets } from "@/lib/api";
import type { MarketCondition } from "@/types";

export function ResolvePage() {
  const { conditionId } = useParams({ from: "/markets/$conditionId/resolve" });
  const { data: conditions = [] } = useQuery({ queryKey: ["markets"], queryFn: fetchMarkets });
  const condition = conditions.find((m) => m.conditionId === conditionId);

  if (!condition) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Market not found.{" "}
        <Link to="/markets" className="underline">
          Back
        </Link>
      </div>
    );
  }

  return <ResolveContent condition={condition} />;
}

function ResolveContent({ condition }: { condition: MarketCondition }) {
  const market = useMarketState(condition);
  const [optimisticOutcome, setOptimisticOutcome] = useState<"YES" | "NO" | null>(null);

  const onResolved = useCallback((outcome: "YES" | "NO") => {
    setOptimisticOutcome(outcome);
  }, []);

  const resolvedOutcome = market.resolvedOutcome ?? optimisticOutcome;

  const winnerToken = resolvedOutcome && market.state
    ? resolvedOutcome === "YES"
      ? market.state.yesTokenAddress
      : market.state.noTokenAddress
    : undefined;

  const { balance: winnerBalance } = useTokenBalance(winnerToken);

  return (
    <div className="py-8">
      <div className="mx-auto max-w-md space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/markets">&larr; Back</Link>
        </Button>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{condition.question}</h1>
            <MarketStatusBadge
              isResolved={market.isResolved}
              resolvedOutcome={market.resolvedOutcome}
            />
          </div>
          <ProbabilityBar yesProb={market.yesProb} noProb={market.noProb} />
        </div>

        <ResolvePanel market={market} onResolved={onResolved} />
        {resolvedOutcome && winnerToken && (
          <RedeemPanel
            resolvedOutcome={resolvedOutcome}
            winnerToken={winnerToken}
            winnerBalance={winnerBalance ?? 0n}
          />
        )}
      </div>
    </div>
  );
}
