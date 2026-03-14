import { useEffect } from "react";
import { parseUnits } from "viem";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProbabilityBar } from "@/components/market/ProbabilityBar";
import { useMarketList } from "@/hooks/market/useMarketList";
import { useMarketState } from "@/hooks/market/useMarketState";
import { useMarketTrade } from "@/hooks/market/useMarketTrade";
import { DEFAULT_SLIPPAGE_TOLERANCE } from "@/constants/defaults";
import { getExplorerTxUrl } from "@/utils/explorer";
import type { MarketCondition, MarketWithPrices } from "@/types";

const BUY_AMOUNT = parseUnits("1", 6); // 1 TUSD
const MIN_OUT = BUY_AMOUNT * BigInt(10000 - DEFAULT_SLIPPAGE_TOLERANCE) / 10000n;

export function LMSRSlideInfo() {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        The LMSR
      </h2>
      <p className="text-sm text-muted-foreground">
        The{" "}
        <strong className="text-foreground">
          Logarithmic Market Scoring Rule
        </strong>{" "}
        is the cost function that prices every swap. It guarantees bounded loss
        for the market maker and smooth price discovery for traders.
      </p>

      <div className="rounded-lg bg-muted p-4 text-center font-mono text-sm leading-relaxed">
        C(q) = b · ln( Σ exp(qᵢ / b) )
      </div>

      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Marginal cost = probability.</strong>{" "}
            The derivative of the cost function with respect to each outcome
            gives its current market price, which sums to 1 across all outcomes.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            Buy pressure on YES <strong className="text-foreground">raises</strong>{" "}
            its price and <strong className="text-foreground">lowers</strong> NO
            — and vice versa.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            The <strong className="text-foreground">b</strong> parameter controls
            liquidity depth — a higher b means larger trades are needed to move
            the price.
          </span>
        </li>
      </ul>
    </div>
  );
}

export function LMSRSlidePanel({ conditionId }: { conditionId?: string }) {
  return (
    <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-6">
      <LivePricePanel conditionId={conditionId} />
    </div>
  );
}

function LivePricePanel({ conditionId }: { conditionId?: string }) {
  const { markets, isLoading } = useMarketList();
  const target = conditionId
    ? markets.find((m) => m.condition.conditionId === conditionId)
    : markets[0];
  const firstMarket = target ?? null;

  if (isLoading && markets.length === 0) {
    return <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />;
  }

  if (!firstMarket) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No markets yet — create one to see live prices.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <LivePricePanelInner condition={firstMarket.condition} />;
}

function LivePricePanelInner({ condition }: { condition: MarketCondition }) {
  const market = useMarketState(condition);
  const { refetch } = market;

  const marketWithPrices: MarketWithPrices = {
    condition: market.condition,
    state: market.state,
    yesProb: market.yesProb,
    noProb: market.noProb,
    isResolved: market.isResolved,
    resolvedOutcome: market.resolvedOutcome,
  };

  const buyYes = useMarketTrade({
    market: marketWithPrices,
    side: "YES",
    direction: "buy",
    amountIn: BUY_AMOUNT,
    minAmountOut: MIN_OUT,
  });

  const buyNo = useMarketTrade({
    market: marketWithPrices,
    side: "NO",
    direction: "buy",
    amountIn: BUY_AMOUNT,
    minAmountOut: MIN_OUT,
  });

  useEffect(() => {
    if (buyYes.isSuccess) {
      refetch();
      buyYes.reset();
    }
  }, [buyYes.isSuccess, refetch, buyYes.reset]);

  useEffect(() => {
    if (buyNo.isSuccess) {
      refetch();
      buyNo.reset();
    }
  }, [buyNo.isSuccess, refetch, buyNo.reset]);

  const busy = buyYes.isPending || buyYes.isConfirming || buyNo.isPending || buyNo.isConfirming;
  const error = buyYes.error || buyNo.error;
  const confirmingHash = buyYes.hash || buyNo.hash;

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          Live Probabilities
        </h3>
        <p className="text-lg font-semibold">{condition.question}</p>
        <ProbabilityBar yesProb={market.yesProb} noProb={market.noProb} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>YES</span>
          <span>NO</span>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            variant="default"
            disabled={busy || market.isResolved}
            onClick={() => buyYes.trade()}
          >
            {buyYes.isPending || buyYes.isConfirming ? "Buying…" : "Buy YES — 1 TUSD"}
          </Button>
          <Button
            className="flex-1"
            variant="secondary"
            disabled={busy || market.isResolved}
            onClick={() => buyNo.trade()}
          >
            {buyNo.isPending || buyNo.isConfirming ? "Buying…" : "Buy NO — 1 TUSD"}
          </Button>
        </div>

        {(buyYes.isPending || buyNo.isPending) && (
          <p className="text-xs text-muted-foreground">Waiting for wallet…</p>
        )}
        {(buyYes.isConfirming || buyNo.isConfirming) && confirmingHash && (
          <p className="text-xs text-muted-foreground">
            Confirming…{" "}
            <a
              href={getExplorerTxUrl(confirmingHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View tx
            </a>
          </p>
        )}
        {error && (
          <p className="text-xs text-destructive">
            {error instanceof Error ? error.message : "Transaction failed"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
