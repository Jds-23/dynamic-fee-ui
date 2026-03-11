import { Button } from "@/components/ui/Button";
import { ProbabilityBar } from "@/components/market/ProbabilityBar";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { TradeForm } from "@/components/market/TradeForm";
import { SplitMergePanel } from "@/components/market/SplitMergePanel";
import { useMarketState } from "@/hooks/market/useMarketState";
import { MARKETS } from "@/constants/markets";

interface MarketTradePageProps {
  conditionId: `0x${string}`;
  onBack: () => void;
}

export function MarketTradePage({ conditionId, onBack }: MarketTradePageProps) {
  const condition = MARKETS.find((m) => m.conditionId === conditionId);

  if (!condition) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Market not found.{" "}
        <button type="button" className="underline" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  return <MarketTradeContent condition={condition} onBack={onBack} />;
}

function MarketTradeContent({
  condition,
  onBack,
}: {
  condition: (typeof MARKETS)[number];
  onBack: () => void;
}) {
  const market = useMarketState(condition);

  return (
    <div className="py-8">
      <div className="mx-auto max-w-md space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          &larr; Back
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

        <TradeForm market={market} />
        <SplitMergePanel market={market} />
      </div>
    </div>
  );
}
