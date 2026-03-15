import { useState, useMemo } from "react";
import { parseUnits, formatUnits } from "viem";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";
import { useMarketTrade } from "@/hooks/market/useMarketTrade";
import { TUSD } from "@/constants/markets";
import { DEFAULT_SLIPPAGE_TOLERANCE } from "@/constants/defaults";
import { getExplorerTxUrl } from "@/utils/explorer";
import type { MarketWithPrices } from "@/types";

interface TradeFormProps {
  market: MarketWithPrices & { refetch: () => void };
}

const QUICK_AMOUNTS = [1, 5, 10, 100] as const;

export function TradeForm({ market }: TradeFormProps) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [amountStr, setAmountStr] = useState("1000");

  const decimals = TUSD.decimals;
  const amountIn = useMemo(() => {
    if (!amountStr || Number.isNaN(Number(amountStr))) return 0n;
    return parseUnits(amountStr, decimals);
  }, [amountStr, decimals]);

  const minAmountOut = useMemo(() => {
    if (amountIn === 0n) return 0n;
    return amountIn - (amountIn * BigInt(DEFAULT_SLIPPAGE_TOLERANCE)) / 10000n;
  }, [amountIn]);

  const trade = useMarketTrade({ market, side, direction, amountIn, minAmountOut });

  const isPending = trade.isPending || trade.isConfirming;

  const yesPrice = market.yesProb !== null ? Math.round(market.yesProb * 100) : null;
  const noPrice = market.noProb !== null ? Math.round(market.noProb * 100) : null;

  function addAmount(increment: number) {
    const current = Number(amountStr) || 0;
    setAmountStr(String(current + increment));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Market header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-muted" />
        <h3 className="text-base font-semibold leading-tight">
          {market.condition.question}
        </h3>
      </div>

      {/* Buy / Sell tabs */}
      <Tabs
        value={direction}
        onValueChange={(v) => setDirection(v as "buy" | "sell")}
      >
        <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="buy"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Yes / No outcome buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setSide("YES")}
          className={cn(
            "flex-1 rounded-lg py-3 text-center text-sm font-semibold transition-colors",
            side === "YES"
              ? "bg-green-600 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          Yes {yesPrice !== null && `${yesPrice}¢`}
        </button>
        <button
          type="button"
          onClick={() => setSide("NO")}
          className={cn(
            "flex-1 rounded-lg py-3 text-center text-sm font-semibold transition-colors",
            side === "NO"
              ? "bg-red-600 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          No {noPrice !== null && `${noPrice}¢`}
        </button>
      </div>

      {/* Amount input */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Amount</span>
          <div className="relative">
            <span className="pointer-events-none text-4xl font-semibold">
              ${amountStr || "0"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="absolute inset-0 w-full bg-transparent text-right text-4xl font-semibold opacity-0"
            />
          </div>
        </div>

        {/* Quick-add buttons */}
        <div className="mt-3 flex justify-end gap-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => addAmount(amt)}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
            >
              +${amt}
            </button>
          ))}
          <button
            type="button"
            className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
          >
            Max
          </button>
        </div>
      </div>

      {/* Min output display */}
      {amountIn > 0n && (
        <div className="text-xs text-muted-foreground">
          Min output: {formatUnits(minAmountOut, decimals)} ({DEFAULT_SLIPPAGE_TOLERANCE / 100}% slippage)
        </div>
      )}

      {/* Trade button */}
      <Button
        className="w-full"
        onClick={() => trade.trade()}
        disabled={isPending || amountIn === 0n || !market.state}
      >
        {isPending ? "Trading..." : `${direction === "buy" ? "Buy" : "Sell"} ${side}`}
      </Button>

      {/* Status messages */}
      {trade.isSuccess && trade.hash && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
          Trade successful!{" "}
          <a
            href={getExplorerTxUrl(trade.hash, 1301)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View tx
          </a>
        </div>
      )}
      {trade.error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          {(trade.error as Error).message?.slice(0, 100)}
        </div>
      )}
    </div>
  );
}
