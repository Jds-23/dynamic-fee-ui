import { formatUnits } from "viem";
import type { Address } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRedeem } from "@/hooks/market/useRedeem";
import { TUSD } from "@/constants/markets";
import { getExplorerTxUrl } from "@/utils/explorer";

interface RedeemPanelProps {
  resolvedOutcome: "YES" | "NO";
  winnerToken: Address;
  winnerBalance: bigint;
}

export function RedeemPanel({ resolvedOutcome, winnerToken, winnerBalance }: RedeemPanelProps) {
  const decimals = TUSD.decimals;

  const { redeem, hash, isPending, isConfirming, isSuccess, error } = useRedeem({
    token: winnerToken,
    amount: winnerBalance,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Redeem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-blue-500/10 p-3 text-sm text-blue-400">
          Resolved: <strong>{resolvedOutcome}</strong> wins. Redeem 1:1 for {TUSD.symbol}.
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Expected payout</span>
          <span className="font-mono">{formatUnits(winnerBalance, decimals)} {TUSD.symbol}</span>
        </div>

        <Button
          className="w-full"
          onClick={() => redeem()}
          disabled={isPending || isConfirming || winnerBalance === 0n}
        >
          {isPending || isConfirming ? "Redeeming..." : "Redeem"}
        </Button>

        {isSuccess && hash && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
            Redeemed!{" "}
            <a href={getExplorerTxUrl(hash, 1301)} target="_blank" rel="noopener noreferrer" className="underline">
              View tx
            </a>
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            {(error as Error).message?.slice(0, 100)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
