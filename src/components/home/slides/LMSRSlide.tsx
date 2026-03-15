import { parseUnits } from "viem";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMarketList } from "@/hooks/market/useMarketList";
import { useMarketState } from "@/hooks/market/useMarketState";
import { useMarketTrade } from "@/hooks/market/useMarketTrade";
import { DEFAULT_SLIPPAGE_TOLERANCE } from "@/constants/defaults";
import { getExplorerTxUrl } from "@/utils/explorer";
import type { MarketCondition, MarketWithPrices } from "@/types";

const BUY_AMOUNT = parseUnits("1000", 6); // 1000 TUSD
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

function SemiCircleGauge({ value }: { value: number | null }) {
  const pct = value !== null ? Math.round(value * 100) : 0;
  const loading = value === null;

  // SVG arc: 180° semi-circle, radius 45, stroke 8
  const r = 45;
  const cx = 50;
  const cy = 50;
  const circumference = Math.PI * r; // half-circle
  const filled = loading ? 0 : (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 58" className="w-28 h-auto">
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="currentColor"
          className="text-muted"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${circumference - filled}`}
          className={loading ? "animate-pulse" : "transition-all duration-500"}
        />
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        {/* Center label */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className="fill-foreground text-xl font-bold"
          style={{ fontSize: 18 }}
        >
          {loading ? "—" : `${pct}%`}
        </text>
      </svg>
      <span className="text-xs font-medium text-green-400 -mt-1">YES</span>
    </div>
  );
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

  const handleBuyYes = () => {
    buyYes.trade({
      onSuccess: () => {
        buyYes.reset();
        setTimeout(() => refetch(), 2000);
      },
    });
  };

  const handleBuyNo = () => {
    buyNo.trade({
      onSuccess: () => {
        buyNo.reset();
        setTimeout(() => refetch(), 2000);
      },
    });
  };

  const busy = buyYes.isPending || buyYes.isConfirming || buyNo.isPending || buyNo.isConfirming;
  const error = buyYes.error || buyNo.error;
  const confirmingHash = buyYes.hash || buyNo.hash;

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-5">
          <SemiCircleGauge value={market.yesProb} />
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Live Probabilities
            </h3>
            <p className="text-lg font-semibold">{condition.question}</p>
          </div>
        </div>

        {/* <ProbabilityBar yesProb={market.yesProb} noProb={market.noProb} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>YES</span>
          <span>NO</span>
        </div> */}

        <div className="flex gap-3">
          <Button
            className="flex-1"
            variant="default"
            disabled={busy || market.isResolved}
            onClick={handleBuyYes}
          >
            {buyYes.isPending || buyYes.isConfirming ? "Buying…" : "Buy YES — 1000 TUSD"}
          </Button>
          <Button
            className="flex-1"
            variant="secondary"
            disabled={busy || market.isResolved}
            onClick={handleBuyNo}
          >
            {buyNo.isPending || buyNo.isConfirming ? "Buying…" : "Buy NO — 1000 TUSD"}
          </Button>
        </div>
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
