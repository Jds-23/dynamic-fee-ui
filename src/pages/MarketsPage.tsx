import { Link } from "@tanstack/react-router";
import { MarketCard } from "@/components/market/MarketCard";
import { useMarketList } from "@/hooks/market/useMarketList";

export function MarketsPage() {
  const { markets, isLoading } = useMarketList();

  if (isLoading && markets.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading markets...
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No markets found.
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Prediction Markets</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((market) => (
          <Link
            key={market.condition.conditionId}
            to="/markets/$conditionId"
            params={{ conditionId: market.condition.conditionId }}
          >
            <MarketCard market={market} />
          </Link>
        ))}
      </div>
    </div>
  );
}
