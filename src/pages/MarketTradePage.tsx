import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { ProbabilityBar } from "@/components/market/ProbabilityBar";
import { RedeemPanel } from "@/components/market/RedeemPanel";
import { SplitMergePanel } from "@/components/market/SplitMergePanel";
import { TradeForm } from "@/components/market/TradeForm";
import { Button } from "@/components/ui/Button";
import { useMarketState } from "@/hooks/market/useMarketState";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";
import { fetchMarkets } from "@/lib/api";
import type { MarketUniverse } from "@/types";

export function MarketTradePage() {
  const { universeId } = useParams({ from: "/markets/$universeId" });
  const { data: universes = [] } = useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
  });
  const universe = universes.find((m) => m.universeId === universeId);

  if (!universe) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Market not found.{" "}
        <Link to="/markets" className="underline">
          Back
        </Link>
      </div>
    );
  }

  return <MarketTradeContent universe={universe} />;
}

function MarketTradeContent({ universe }: { universe: MarketUniverse }) {
  const market = useMarketState(universe);

  const winnerToken =
    market.isResolved && market.state
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
            <h1 className="text-xl font-bold">{universe.question}</h1>
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
