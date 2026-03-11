import { useState, useMemo } from "react";
import { parseUnits } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTokenApproval } from "@/hooks/approval/useTokenApproval";
import { useSplitMerge } from "@/hooks/market/useSplitMerge";
import { PM_CONTRACTS, TUSD } from "@/constants/markets";
import { getExplorerTxUrl } from "@/utils/explorer";
import type { MarketWithPrices } from "@/types";

interface SplitMergePanelProps {
  market: MarketWithPrices;
}

export function SplitMergePanel({ market }: SplitMergePanelProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"split" | "merge">("split");
  const [amountStr, setAmountStr] = useState("");

  const decimals = TUSD.decimals;
  const amount = useMemo(() => {
    if (!amountStr || Number.isNaN(Number(amountStr))) return 0n;
    return parseUnits(amountStr, decimals);
  }, [amountStr, decimals]);

  const conditionId = market.condition.conditionId;

  // Split: approve collateral → ConditionalMarkets
  const splitApproval = useTokenApproval({
    tokenAddress: market.state?.collateralAddress,
    spender: PM_CONTRACTS.conditionalMarkets,
    amount,
  });

  // Merge: approve YES + NO → ConditionalMarkets
  const mergeYesApproval = useTokenApproval({
    tokenAddress: market.state?.yesTokenAddress,
    spender: PM_CONTRACTS.conditionalMarkets,
    amount,
  });
  const mergeNoApproval = useTokenApproval({
    tokenAddress: market.state?.noTokenAddress,
    spender: PM_CONTRACTS.conditionalMarkets,
    amount,
  });

  const op = useSplitMerge({ conditionId, amount, mode });

  const needsApproval =
    mode === "split"
      ? splitApproval.needsApproval
      : mergeYesApproval.needsApproval || mergeNoApproval.needsApproval;

  const isApproving =
    splitApproval.isPending || splitApproval.isConfirming ||
    mergeYesApproval.isPending || mergeYesApproval.isConfirming ||
    mergeNoApproval.isPending || mergeNoApproval.isConfirming;

  function handleApprove() {
    if (mode === "split") {
      splitApproval.approve();
    } else {
      if (mergeYesApproval.needsApproval) mergeYesApproval.approve();
      else if (mergeNoApproval.needsApproval) mergeNoApproval.approve();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
        onClick={() => setOpen(true)}
      >
        Split / Merge
      </button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Split / Merge</CardTitle>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === "split" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("split")}
          >
            Split
          </Button>
          <Button
            variant={mode === "merge" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("merge")}
          >
            Merge
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {mode === "split"
            ? "Split collateral into equal YES + NO tokens"
            : "Merge equal YES + NO tokens back into collateral"}
        </p>

        <input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />

        {needsApproval && amount > 0n ? (
          <Button className="w-full" onClick={handleApprove} disabled={isApproving}>
            {isApproving ? "Approving..." : "Approve"}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={op.execute}
            disabled={op.isPending || op.isConfirming || amount === 0n}
          >
            {op.isPending || op.isConfirming ? "Executing..." : mode === "split" ? "Split" : "Merge"}
          </Button>
        )}

        {op.isSuccess && op.hash && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
            {mode === "split" ? "Split" : "Merge"} successful!{" "}
            <a href={getExplorerTxUrl(op.hash)} target="_blank" rel="noopener noreferrer" className="underline">
              View tx
            </a>
          </div>
        )}
        {op.error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            {(op.error as Error).message?.slice(0, 100)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
