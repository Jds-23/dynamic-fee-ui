import { parseUnits } from "viem";
import { MintGate } from "@/components/collateral/MintGate";
import { DEFAULT_SLIPPAGE_TOLERANCE } from "@/constants/defaults";
import { useMarketList } from "@/hooks/market/useMarketList";
import { useMarketState } from "@/hooks/market/useMarketState";
import { useMarketTrade } from "@/hooks/market/useMarketTrade";
import { retryRefetch } from "@/lib/retryRefetch";
import type { MarketUniverse, MarketWithPrices } from "@/types";
import { getExplorerTxUrl } from "@/utils/explorer";

const BUY_AMOUNT = parseUnits("1000", 6); // 1000 TUSD
const MIN_OUT =
  (BUY_AMOUNT * BigInt(10000 - DEFAULT_SLIPPAGE_TOLERANCE)) / 10000n;

export function LMSRSlideInfo() {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        Why the Price Is Accurate
      </h2>
      <p className="text-sm text-muted-foreground">
        Under the hood, the{" "}
        <strong className="text-foreground">
          Logarithmic Market Scoring Rule (LMSR)
        </strong>{" "}
        guarantees that the market always has liquidity and that prices behave
        like real probabilities — they always sum to 100%.
      </p>

      <div className="rounded-lg bg-muted p-4 text-center font-mono text-sm leading-relaxed">
        C(q) = b · ln( Σ exp(qᵢ / b) )
      </div>

      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">
              Prices are probabilities.
            </strong>{" "}
            A YES token trading at $0.73 means the market thinks there's a 73%
            chance the answer is yes.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Your subsidy controls depth.</strong>{" "}
            The <strong className="text-foreground">b</strong> parameter (set by
            your funding amount) determines how much money it takes to move the
            price — more subsidy means a more stable, harder-to-manipulate
            estimate.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Bounded loss.</strong>{" "}
            The maximum you can lose as the market creator is capped — your
            subsidy is the worst case, not an open-ended liability.
          </span>
        </li>
      </ul>
    </div>
  );
}

export function LMSRSlidePanel({ universeId }: { universeId?: string }) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-4 lg:min-h-[28rem] lg:p-6">
      <LivePricePanel universeId={universeId} />
    </div>
  );
}

function LivePricePanel({ universeId }: { universeId?: string }) {
  const { markets, isLoading } = useMarketList();
  const target = universeId
    ? markets.find((m) => m.universe.universeId === universeId)
    : markets[0];
  const firstMarket = target ?? null;

  if (isLoading && markets.length === 0) {
    return <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />;
  }

  if (!firstMarket) {
    return (
      <div className="w-full rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          No markets yet — create one to see live prices.
        </p>
      </div>
    );
  }

  return <LivePricePanelInner universe={firstMarket.universe} />;
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
      <svg
        viewBox="0 0 100 58"
        className="w-28 h-auto"
        role="img"
        aria-label="Probability gauge"
      >
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

function LivePricePanelInner({ universe }: { universe: MarketUniverse }) {
  const market = useMarketState(universe);
  const { refetch } = market;

  const marketWithPrices: MarketWithPrices = {
    universe: market.universe,
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
        retryRefetch(refetch);
      },
    });
  };

  const handleBuyNo = () => {
    buyNo.trade({
      onSuccess: () => {
        buyNo.reset();
        retryRefetch(refetch);
      },
    });
  };

  const busy =
    buyYes.isPending ||
    buyYes.isConfirming ||
    buyNo.isPending ||
    buyNo.isConfirming;
  const error = buyYes.error || buyNo.error;
  const retryCountdown = buyYes.retryCountdown || buyNo.retryCountdown;
  const retryAttempt = buyYes.retryAttempt || buyNo.retryAttempt;
  const confirmingHash = buyYes.hash || buyNo.hash;

  return (
    <div className="w-full rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-5">
        <SemiCircleGauge value={market.yesProb} />
        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            Live Probabilities
          </h3>
          <p className="text-lg font-semibold">{universe.question}</p>
        </div>
      </div>

      <MintGate amountNeeded={BUY_AMOUNT}>
        {({ insufficientBalance }) => (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="flex-1 rounded-lg bg-success/15 py-3.5 text-center text-sm font-semibold text-success transition-colors hover:bg-success/90 hover:text-white disabled:opacity-50"
              disabled={busy || market.isResolved || insufficientBalance}
              onClick={handleBuyYes}
            >
              {buyYes.isPending || buyYes.isConfirming
                ? "Buying…"
                : "Buy Yes — 1000 TUSD"}
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-destructive/15 py-3.5 text-center text-sm font-semibold text-destructive transition-colors hover:bg-destructive/90 hover:text-white disabled:opacity-50"
              disabled={busy || market.isResolved || insufficientBalance}
              onClick={handleBuyNo}
            >
              {buyNo.isPending || buyNo.isConfirming
                ? "Buying…"
                : "Buy No — 1000 TUSD"}
            </button>
          </div>
        )}
      </MintGate>

      {/* Status banners */}
      {(buyYes.isConfirming || buyNo.isConfirming) && confirmingHash && (
        <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-400">
          Confirming…{" "}
          <a
            href={getExplorerTxUrl(confirmingHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View tx
          </a>
        </div>
      )}
      {retryCountdown > 0 && (
        <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-400">
          Transaction failed, retrying in {retryCountdown}s… (attempt{" "}
          {retryAttempt}/3)
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          {error instanceof Error ? error.message : "Transaction failed"}
        </div>
      )}
    </div>
  );
}
