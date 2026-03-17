import { motion } from "framer-motion";
import { Check, ExternalLink } from "lucide-react";
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
  const formattedPayout = formatUnits(winnerBalance, decimals);

  const { redeem, hash, isPending, isConfirming, isSuccess, error } = useRedeem(
    {
      token: winnerToken,
      amount: winnerBalance,
    },
  );

  const transition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const };

  if (isSuccess && hash) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transition}
        className="rounded-xl border border-border bg-card p-5 w-full flex flex-col items-center justify-center gap-5 py-10"
      >
        {/* Animated checkmark */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-success/10 blur-md" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...transition, delay: 0.25 }}
            >
              <Check className="h-8 w-8 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.15 }}
          className="text-xl font-semibold"
        >
          Redeemed!
        </motion.h3>

        {/* Payout amount */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.25 }}
          className="text-2xl font-mono text-success"
        >
          {formattedPayout} {TUSD.symbol}
        </motion.p>

        {/* Explorer link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...transition, delay: 0.35 }}
        >
          <Button variant="ghost" asChild>
            <a
              href={getExplorerTxUrl(hash, 1301)}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              View on Explorer
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </motion.div>
    );
  }

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
          {formattedPayout} {TUSD.symbol}
        </span>
      </div>

      <Button
        className="w-full"
        onClick={() => redeem()}
        disabled={isPending || isConfirming || winnerBalance === 0n}
      >
        {isPending || isConfirming ? "Redeeming..." : "Redeem"}
      </Button>

      {error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          {(error as Error).message?.slice(0, 100)}
        </div>
      )}
    </div>
  );
}
