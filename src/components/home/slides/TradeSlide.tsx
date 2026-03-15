import { TradeForm } from "@/components/market/TradeForm";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useMarketList } from "@/hooks/market/useMarketList";
import { useMarketState } from "@/hooks/market/useMarketState";

export function TradeSlideInfo() {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        How a Swap Works
      </h2>
      <p className="text-sm text-muted-foreground">
        Every buy starts by{" "}
        <strong className="text-foreground">
          minting equal amounts of YES and NO tokens
        </strong>{" "}
        from deposited collateral. The hook then routes the unwanted side back
        into the pool so the user ends up holding only the token they want.
      </p>

      <div className="space-y-2 rounded-lg bg-muted/60 p-4 text-xs font-mono leading-relaxed">
        <p className="text-muted-foreground">{"// Buy YES flow"}</p>
        <p>1. Collateral deposited</p>
        <p>2. Split → equal YES + NO minted</p>
        <p>3. User receives YES</p>
        <p>4. Hook retains NO as reserve</p>
      </div>

      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Selling</strong> is the reverse
            — outcome tokens are returned, merged back into collateral, and the
            user is paid out.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">YES↔NO swaps</strong> happen at
            near-zero net cost because the collateral legs cancel out.
          </span>
        </li>
      </ul>
    </div>
  );
}

interface TradeSlidePanelProps {
  onGoTo?: (index: number) => void;
  conditionId?: string;
}

export function TradeSlidePanel({ onGoTo, conditionId }: TradeSlidePanelProps) {
  return (
    <div className="flex h-full min-h-[28rem] items-center justify-center overflow-y-auto rounded-2xl border border-border/50 bg-card/30 p-6">
      <TradeSlideInner onGoTo={onGoTo} conditionId={conditionId} />
    </div>
  );
}

function TradeSlideInner({ onGoTo, conditionId }: TradeSlidePanelProps) {
  const { markets, isLoading, refetch: listRefetch } = useMarketList();
  const target = conditionId
    ? markets.find((m) => m.condition.conditionId === conditionId)
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
