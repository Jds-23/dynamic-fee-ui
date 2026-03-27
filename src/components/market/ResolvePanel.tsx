import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useResolveMarket } from "@/hooks/market/useResolveMarket";
import { cn } from "@/lib/utils";
import type { MarketWithPrices } from "@/types";
import { getExplorerTxUrl } from "@/utils/explorer";

interface ResolvePanelProps {
  market: MarketWithPrices;
  onResolved?: (outcome: "YES" | "NO") => void;
}

export function ResolvePanel({ market, onResolved }: ResolvePanelProps) {
  const [selected, setSelected] = useState<"YES" | "NO" | null>(null);

  const winner =
    selected === "YES"
      ? market.state?.yesTokenAddress
      : selected === "NO"
        ? market.state?.noTokenAddress
        : undefined;

  const {
    resolve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    retryCountdown,
    retryAttempt,
  } = useResolveMarket({
    universeId: market.universe.universeId,
    winner: winner ?? "0x0000000000000000000000000000000000000000",
  });

  const handleResolve = () => {
    if (!selected) return;
    resolve({ onSuccess: () => onResolved?.(selected) });
  };

  if (market.isResolved) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold leading-tight">Resolution</h3>
        </div>
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
          Resolved: <strong>{market.resolvedOutcome}</strong> wins
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold leading-tight">Resolution</h3>
        </div>
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
          Resolved: <strong>{selected}</strong> wins!{" "}
          {hash && (
            <a
              href={getExplorerTxUrl(hash, 1301)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View tx
            </a>
          )}
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link
            to="/markets/$universeId"
            params={{ universeId: market.universe.universeId }}
          >
            Go to Redeem
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-muted" />
        <h3 className="text-base font-semibold leading-tight">
          Resolve Market
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Select the winning outcome:
      </p>

      {/* YES / NO outcome buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setSelected("YES")}
          className={cn(
            "flex-1 rounded-lg py-3 text-center text-sm font-semibold transition-colors",
            selected === "YES"
              ? "bg-success text-white"
              : "bg-success/15 text-success hover:bg-success/25",
          )}
        >
          YES
          {market.yesProb != null && (
            <span className="ml-1 text-xs">
              ({(market.yesProb * 100).toFixed(0)}%)
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSelected("NO")}
          className={cn(
            "flex-1 rounded-lg py-3 text-center text-sm font-semibold transition-colors",
            selected === "NO"
              ? "bg-destructive text-white"
              : "bg-destructive/15 text-destructive hover:bg-destructive/25",
          )}
        >
          NO
          {market.noProb != null && (
            <span className="ml-1 text-xs">
              ({(market.noProb * 100).toFixed(0)}%)
            </span>
          )}
        </button>
      </div>

      <p className="text-xs text-yellow-400">This action is irreversible.</p>

      <Button
        className="w-full"
        onClick={handleResolve}
        disabled={!selected || isPending || isConfirming}
      >
        {isPending || isConfirming ? "Resolving..." : "Resolve Market"}
      </Button>

      {retryCountdown > 0 && (
        <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-400">
          Transaction failed, retrying in {retryCountdown}s… (attempt{" "}
          {retryAttempt}/3)
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          {(error as Error).message?.includes("ConditionAlreadyResolved")
            ? "This market has already been resolved."
            : (error as Error).message?.slice(0, 100)}
        </div>
      )}
    </div>
  );
}
