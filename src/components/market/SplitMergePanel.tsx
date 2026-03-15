import { useMemo, useState } from "react";
import { parseUnits } from "viem";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PM_CONTRACTS, TUSD } from "@/constants/markets";
import { useTokenApproval } from "@/hooks/approval/useTokenApproval";
import { useSplitMerge } from "@/hooks/market/useSplitMerge";
import type { MarketWithPrices } from "@/types";
import { getExplorerTxUrl } from "@/utils/explorer";

const QUICK_AMOUNTS = [1, 5, 10, 100] as const;

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
  }, [amountStr]);

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
    splitApproval.isPending ||
    splitApproval.isConfirming ||
    mergeYesApproval.isPending ||
    mergeYesApproval.isConfirming ||
    mergeNoApproval.isPending ||
    mergeNoApproval.isConfirming;

  function handleApprove() {
    if (mode === "split") {
      splitApproval.approve();
    } else {
      if (mergeYesApproval.needsApproval) mergeYesApproval.approve();
      else if (mergeNoApproval.needsApproval) mergeNoApproval.approve();
    }
  }

  function addAmount(increment: number) {
    const current = Number(amountStr) || 0;
    setAmountStr(String(current + increment));
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
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-lg bg-muted" />
          <h3 className="text-base font-semibold leading-tight">
            Split / Merge
          </h3>
        </div>
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>

      {/* Mode toggle — underline Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as "split" | "merge")}>
        <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="split"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Split
          </TabsTrigger>
          <TabsTrigger
            value="merge"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Merge
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        {mode === "split"
          ? "Split collateral into equal YES + NO tokens"
          : "Merge equal YES + NO tokens back into collateral"}
      </p>

      {/* Amount input */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Amount
          </span>
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

      {needsApproval && amount > 0n ? (
        <Button
          className="w-full"
          onClick={handleApprove}
          disabled={isApproving}
        >
          {isApproving ? "Approving..." : "Approve"}
        </Button>
      ) : (
        <Button
          className="w-full"
          onClick={() => op.execute()}
          disabled={op.isPending || op.isConfirming || amount === 0n}
        >
          {op.isPending || op.isConfirming
            ? "Executing..."
            : mode === "split"
              ? "Split"
              : "Merge"}
        </Button>
      )}

      {/* Status banners */}
      {op.isSuccess && op.hash && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
          {mode === "split" ? "Split" : "Merge"} successful!{" "}
          <a
            href={getExplorerTxUrl(op.hash, 1301)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View tx
          </a>
        </div>
      )}
      {op.error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          {(op.error as Error).message?.slice(0, 100)}
        </div>
      )}
    </div>
  );
}
