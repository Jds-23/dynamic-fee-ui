import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { TradeForm } from "@/components/market/TradeForm";
import { useMarketList } from "@/hooks/market/useMarketList";
import { useMarketState } from "@/hooks/market/useMarketState";

export function TradeSlideInfo() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Trade</h2>
      <p className="max-w-lg text-muted-foreground">
        Buy and sell outcome tokens on live markets. Prices update in
        real-time using LMSR automated market making.
      </p>
    </div>
  );
}

interface TradeSlidePanelProps {
  onGoTo: (index: number) => void;
}

export function TradeSlidePanel({ onGoTo }: TradeSlidePanelProps) {
  return (
    <div className="min-h-[28rem] overflow-y-auto rounded-2xl border border-border/50 bg-card/30 p-6">
      <TradeSlideInner onGoTo={onGoTo} />
    </div>
  );
}

function TradeSlideInner({ onGoTo }: TradeSlidePanelProps) {
  const { markets, isLoading, refetch: listRefetch } = useMarketList();
  const firstMarket = markets[0] ?? null;

  if (isLoading && markets.length === 0) {
    return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
  }

  if (!firstMarket) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <p className="text-muted-foreground">No markets available yet.</p>
          <Button onClick={() => onGoTo(2)}>Create a Market</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <TradeSlideWithMarket
      condition={firstMarket.condition}
      listRefetch={listRefetch}
    />
  );
}

function TradeSlideWithMarket({
  condition,
  listRefetch,
}: {
  condition: Parameters<typeof useMarketState>[0];
  listRefetch: () => void;
}) {
  const marketState = useMarketState(condition);

  return (
    <TradeForm
      market={{
        ...marketState,
        refetch: () => {
          marketState.refetch();
          listRefetch();
        },
      }}
    />
  );
}
