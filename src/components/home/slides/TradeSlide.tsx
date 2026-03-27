import { TradeForm } from "@/components/market/TradeForm";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useMarketList } from "@/hooks/market/useMarketList";
import { useMarketState } from "@/hooks/market/useMarketState";

export function TradeSlideInfo() {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        Step 2: The Crowd Trades
      </h2>
      <p className="text-sm text-muted-foreground">
        Once your market is live, anyone can buy YES or NO tokens. Every trade{" "}
        <strong className="text-foreground">
          moves the price toward the crowd's true belief
        </strong>{" "}
        — and that price <em>is</em> your probability estimate.
      </p>

      <div className="space-y-2 rounded-lg bg-muted/60 p-4 text-xs font-mono leading-relaxed">
        <p className="text-muted-foreground">{"// Someone thinks YES is underpriced"}</p>
        <p>1. Deposits collateral</p>
        <p>2. Buys YES tokens → price rises</p>
        <p>3. Market now reflects their info</p>
      </div>

      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Profit motive = accuracy</strong>{" "}
            — Traders who know something the market doesn't can profit by pushing
            the price toward truth.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Your subsidy funds the information</strong>{" "}
            — The money you put in is the "bounty" that incentivizes informed traders to participate.
          </span>
        </li>
      </ul>
    </div>
  );
}

interface TradeSlidePanelProps {
  onGoTo?: (index: number) => void;
  universeId?: string;
}

export function TradeSlidePanel({ onGoTo, universeId }: TradeSlidePanelProps) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center overflow-y-auto rounded-2xl border border-border/50 bg-card/30 p-4 lg:min-h-[28rem] lg:p-6">
      <TradeSlideInner onGoTo={onGoTo} universeId={universeId} />
    </div>
  );
}

function TradeSlideInner({ onGoTo, universeId }: TradeSlidePanelProps) {
  const { markets, isLoading, refetch: listRefetch } = useMarketList();
  const target = universeId
    ? markets.find((m) => m.universe.universeId === universeId)
    : markets[0];
  const firstMarket = target ?? null;

  if (isLoading && markets.length === 0) {
    return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
  }

  if (!firstMarket) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <p className="text-muted-foreground">No markets available yet.</p>
          <Button onClick={() => onGoTo?.(2)}>Create a Market</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <TradeSlideWithMarket
      universe={firstMarket.universe}
      listRefetch={listRefetch}
    />
  );
}

function TradeSlideWithMarket({
  universe,
  listRefetch,
}: {
  universe: Parameters<typeof useMarketState>[0];
  listRefetch: () => void;
}) {
  const marketState = useMarketState(universe);

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
