import type { Address } from "viem";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/Button";
import { TUSD } from "@/constants/markets";
import { useRedeem } from "@/hooks/market/useRedeem";
import { getExplorerTxUrl } from "@/utils/explorer";

interface RedeemPanelProps {
  resolvedOutcome: "YES" | "NO";
  winnerToken: Address;
  winnerBalance: bigint;
}

export function RedeemPanel({
  resolvedOutcome,
  winnerToken,
  winnerBalance,
}: RedeemPanelProps) {
  const decimals = TUSD.decimals;

  const { redeem, hash, isPending, isConfirming, isSuccess, error } = useRedeem(
    {
      token: winnerToken,
      amount: winnerBalance,
    },
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h3 className="text-base font-semibold leading-tight">Redeem</h3>
      </div>

      <div className="rounded-md bg-blue-500/10 p-3 text-sm text-blue-400">
        Resolved: <strong>{resolvedOutcome}</strong> wins. Redeem 1:1 for{" "}
        {TUSD.symbol}.
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Expected payout</span>
        <span className="font-mono">
          {formatUnits(winnerBalance, decimals)} {TUSD.symbol}
        </span>
      </div>

      <Button
        className="w-full"
        onClick={() => redeem()}
        disabled={isPending || isConfirming || winnerBalance === 0n}
      >
        {isPending || isConfirming ? "Redeeming..." : "Redeem"}
      </Button>

      {/* Status banners */}
      {isSuccess && hash && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
          Redeemed!{" "}
          <a
            href={getExplorerTxUrl(hash, 1301)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View tx
          </a>
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          {(error as Error).message?.slice(0, 100)}
        </div>
      )}
    </div>
  );
}
