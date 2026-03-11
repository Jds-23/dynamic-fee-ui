import { useState, useMemo } from "react";
import { parseUnits, formatUnits } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTokenApproval } from "@/hooks/approval/useTokenApproval";
import { useMarketTrade } from "@/hooks/market/useMarketTrade";
import { PM_CONTRACTS, TUSD } from "@/constants/markets";
import { DEFAULT_SLIPPAGE_TOLERANCE } from "@/constants/defaults";
import { formatProbability } from "@/lib/market";
import { getExplorerTxUrl } from "@/utils/explorer";
import type { MarketWithPrices } from "@/types";

interface TradeFormProps {
  market: MarketWithPrices;
}

export function TradeForm({ market }: TradeFormProps) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [amountStr, setAmountStr] = useState("");

  const decimals = TUSD.decimals; // both collateral and outcome tokens use same decimals
  const amountIn = useMemo(() => {
    if (!amountStr || Number.isNaN(Number(amountStr))) return 0n;
    return parseUnits(amountStr, decimals);
  }, [amountStr, decimals]);

  const minAmountOut = useMemo(() => {
    // simple slippage: amountIn * (1 - slippage)
    if (amountIn === 0n) return 0n;
    return amountIn - (amountIn * BigInt(DEFAULT_SLIPPAGE_TOLERANCE)) / 10000n;
  }, [amountIn]);

  // Input token: buy = collateral, sell = outcome token
  const inputToken = useMemo(() => {
    if (!market.state) return undefined;
    if (direction === "buy") return market.state.collateralAddress;
    return side === "YES" ? market.state.yesTokenAddress : market.state.noTokenAddress;
  }, [market.state, direction, side]);

  const approval = useTokenApproval({
    tokenAddress: inputToken,
    spender: PM_CONTRACTS.v4SwapRouter,
    amount: amountIn,
  });

  const trade = useMarketTrade({ market, side, direction, amountIn, minAmountOut });

  const isPending = trade.isPending || trade.isConfirming;
  const isApproving = approval.isPending || approval.isConfirming;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Probability display */}
        {market.yesProb !== null && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>YES: {formatProbability(market.yesProb)}</span>
            <span>NO: {formatProbability(market.noProb!)}</span>
          </div>
        )}

        {/* Side toggle */}
        <div className="flex gap-2">
          <Button
            variant={side === "YES" ? "default" : "outline"}
            className={`flex-1 ${side === "YES" ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={() => setSide("YES")}
          >
            YES
          </Button>
          <Button
            variant={side === "NO" ? "default" : "outline"}
            className={`flex-1 ${side === "NO" ? "bg-red-600 hover:bg-red-700" : ""}`}
            onClick={() => setSide("NO")}
          >
            NO
          </Button>
        </div>

        {/* Direction toggle */}
        <div className="flex gap-2">
          <Button
            variant={direction === "buy" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setDirection("buy")}
          >
            Buy
          </Button>
          <Button
            variant={direction === "sell" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setDirection("sell")}
          >
            Sell
          </Button>
        </div>

        {/* Amount input */}
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Amount ({direction === "buy" ? TUSD.symbol : `${side} Token`})
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Min output display */}
        {amountIn > 0n && (
          <div className="text-xs text-muted-foreground">
            Min output: {formatUnits(minAmountOut, decimals)} ({DEFAULT_SLIPPAGE_TOLERANCE / 100}% slippage)
          </div>
        )}

        {/* Action buttons */}
        {approval.needsApproval && amountIn > 0n ? (
          <Button
            className="w-full"
            onClick={approval.approve}
            disabled={isApproving}
          >
            {isApproving ? "Approving..." : `Approve ${direction === "buy" ? TUSD.symbol : `${side} Token`}`}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={trade.trade}
            disabled={isPending || amountIn === 0n || !market.state}
          >
            {isPending ? "Trading..." : `${direction === "buy" ? "Buy" : "Sell"} ${side}`}
          </Button>
        )}

        {/* Status */}
        {trade.isSuccess && trade.hash && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
            Trade successful!{" "}
            <a
              href={getExplorerTxUrl(trade.hash)}
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
      </CardContent>
    </Card>
  );
}
