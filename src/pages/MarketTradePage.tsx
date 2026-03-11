import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { ProbabilityBar } from "@/components/market/ProbabilityBar";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { TradeForm } from "@/components/market/TradeForm";
import { SplitMergePanel } from "@/components/market/SplitMergePanel";
import { RedeemPanel } from "@/components/market/RedeemPanel";
import { useMarketState } from "@/hooks/market/useMarketState";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";
import { fetchMarkets } from "@/lib/api";
import type { MarketCondition } from "@/types";

export function MarketTradePage() {
  const { conditionId } = useParams({ from: "/markets/$conditionId" });
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

  return <MarketTradeContent condition={condition} />;
}

function MarketTradeContent({
  condition,
}: {
  condition: MarketCondition;
}) {
  const market = useMarketState(condition);

  const winnerToken = market.isResolved && market.state
    ? market.resolvedOutcome === "YES"
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

        {market.isResolved && winnerToken && market.resolvedOutcome ? (
          <RedeemPanel
            resolvedOutcome={market.resolvedOutcome}
            winnerToken={winnerToken}
            winnerBalance={winnerBalance ?? 0n}
          />
        ) : (
          <>
            <TradeForm market={market} />
            <SplitMergePanel market={market} />
          </>
        )}
      </div>
    </div>
  );
}
