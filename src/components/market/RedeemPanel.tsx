import { useState, useMemo } from "react";
import { parseUnits, formatUnits } from "viem";
import type { Address } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTokenApproval } from "@/hooks/approval/useTokenApproval";
import { useRedeem } from "@/hooks/market/useRedeem";
import { PM_CONTRACTS, TUSD } from "@/constants/markets";
import { getExplorerTxUrl } from "@/utils/explorer";

interface RedeemPanelProps {
  resolvedOutcome: "YES" | "NO";
  winnerToken: Address;
  winnerBalance: bigint;
}

export function RedeemPanel({ resolvedOutcome, winnerToken, winnerBalance }: RedeemPanelProps) {
  const [amountStr, setAmountStr] = useState("");
  const decimals = TUSD.decimals;

  const amount = useMemo(() => {
    if (!amountStr || Number.isNaN(Number(amountStr))) return 0n;
    return parseUnits(amountStr, decimals);
  }, [amountStr, decimals]);

  const approval = useTokenApproval({
    tokenAddress: winnerToken,
    spender: PM_CONTRACTS.conditionalMarkets,
    amount,
  });

  const { redeem, hash, isPending, isConfirming, isSuccess, error } = useRedeem({
    token: winnerToken,
    amount,
  });

  const isApproving = approval.isPending || approval.isConfirming;

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
          <span>Winner token balance</span>
          <button
            type="button"
            className="font-mono hover:text-foreground"
            onClick={() => setAmountStr(formatUnits(winnerBalance, decimals))}
          >
            {formatUnits(winnerBalance, decimals)}
          </button>
        </div>

        <input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />

        {approval.needsApproval && amount > 0n ? (
          <Button className="w-full" onClick={approval.approve} disabled={isApproving}>
            {isApproving ? "Approving..." : `Approve ${resolvedOutcome} Token`}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={redeem}
            disabled={isPending || isConfirming || amount === 0n}
          >
            {isPending || isConfirming ? "Redeeming..." : "Redeem"}
          </Button>
        )}

        {isSuccess && hash && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
            Redeemed!{" "}
            <a href={getExplorerTxUrl(hash)} target="_blank" rel="noopener noreferrer" className="underline">
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
