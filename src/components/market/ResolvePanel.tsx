import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useResolveMarket } from "@/hooks/market/useResolveMarket";
import { getExplorerTxUrl } from "@/utils/explorer";
import type { MarketWithPrices } from "@/types";

interface ResolvePanelProps {
  market: MarketWithPrices;
  onResolved?: (outcome: "YES" | "NO") => void;
}

export function ResolvePanel({ market, onResolved }: ResolvePanelProps) {
  const [selected, setSelected] = useState<"YES" | "NO" | null>(null);

  const winner = selected === "YES"
    ? market.state?.yesTokenAddress
    : selected === "NO"
      ? market.state?.noTokenAddress
      : undefined;

  const { resolve, hash, isPending, isConfirming, isSuccess, error } = useResolveMarket({
    conditionId: market.condition.conditionId,
    winner: winner ?? "0x0000000000000000000000000000000000000000",
  });

  const handleResolve = () => {
    if (!selected) return;
    resolve({ onSuccess: () => onResolved?.(selected) });
  };

  if (market.isResolved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
            Resolved: <strong>{market.resolvedOutcome}</strong> wins
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
            Resolved: <strong>{selected}</strong> wins!{" "}
            {hash && (
              <a href={getExplorerTxUrl(hash, 1301)} target="_blank" rel="noopener noreferrer" className="underline">
                View tx
              </a>
            )}
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/markets/$conditionId" params={{ conditionId: market.condition.conditionId }}>
              Go to Redeem
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Resolve Market</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Select the winning outcome:</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelected("YES")}
            className={`rounded-md border p-3 text-center text-sm font-medium transition-colors ${
              selected === "YES"
                ? "border-green-500 bg-green-500/10 text-green-400"
                : "border-input hover:border-foreground/20"
            }`}
          >
            YES
            {market.yesProb != null && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({(market.yesProb * 100).toFixed(0)}%)
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSelected("NO")}
            className={`rounded-md border p-3 text-center text-sm font-medium transition-colors ${
              selected === "NO"
                ? "border-red-500 bg-red-500/10 text-red-400"
                : "border-input hover:border-foreground/20"
            }`}
          >
            NO
            {market.noProb != null && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({(market.noProb * 100).toFixed(0)}%)
              </span>
            )}
          </button>
        </div>

        <p className="text-xs text-yellow-500">This action is irreversible.</p>

        <Button
          className="w-full"
          onClick={handleResolve}
          disabled={!selected || isPending || isConfirming}
        >
          {isPending || isConfirming ? "Resolving..." : "Resolve Market"}
        </Button>

        {error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            {(error as Error).message?.includes("ConditionAlreadyResolved")
              ? "This market has already been resolved."
              : (error as Error).message?.slice(0, 100)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
