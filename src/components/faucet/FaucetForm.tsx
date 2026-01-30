import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useDrip } from "@/hooks/faucet/useDrip";
import { useFaucetState } from "@/hooks/faucet/useFaucetState";
import { getExplorerTxUrl } from "@/utils/explorer";

function formatCountdown(seconds: bigint): string {
  const totalSeconds = Number(seconds);
  if (totalSeconds <= 0) return "0:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function FaucetForm() {
  const { isConnected } = useAccount();
  const {
    canDrip,
    timeUntilNextDrip,
    dripAmount0,
    dripAmount1,
    faucetBalance0,
    faucetBalance1,
    isLoading,
    refetch,
  } = useFaucetState();

  const { drip, hash, isPending, isConfirming, isSuccess, error, reset } =
    useDrip();

  // Local countdown state for smooth UI updates
  const [countdown, setCountdown] = useState<bigint>(0n);

  // Sync countdown with contract state
  useEffect(() => {
    setCountdown(timeUntilNextDrip);
  }, [timeUntilNextDrip]);

  // Decrement countdown locally every second
  useEffect(() => {
    if (countdown <= 0n) return;

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0n ? prev - 1n : 0n));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  // Refetch when countdown reaches zero
  useEffect(() => {
    if (countdown === 0n && timeUntilNextDrip > 0n) {
      refetch();
    }
  }, [countdown, timeUntilNextDrip, refetch]);

  // Show toast on success and refetch state
  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Tokens claimed!", {
        description: "mUSDC and mUSDT have been sent to your wallet",
        action: {
          label: "View on Etherscan",
          onClick: () => window.open(getExplorerTxUrl(hash), "_blank"),
        },
        duration: 10000,
      });
      refetch();
    }
  }, [isSuccess, hash, refetch]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast.error("Claim failed", {
        description: error.message?.slice(0, 100) || "Transaction failed",
        duration: 8000,
      });
    }
  }, [error]);

  const handleClaim = () => {
    reset();
    drip();
  };

  const faucetHasTokens = faucetBalance0 >= dripAmount0 && faucetBalance1 >= dripAmount1;

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (isLoading) return "Loading...";
    if (isPending) return "Confirm in wallet...";
    if (isConfirming) return "Claiming tokens...";
    if (!canDrip && countdown > 0n) return `Cooldown: ${formatCountdown(countdown)}`;
    if (!faucetHasTokens) return "Faucet Empty";
    return "Claim Tokens";
  };

  const canClaim =
    isConnected && canDrip && faucetHasTokens && !isPending && !isConfirming && !isLoading;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Token Faucet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Claim test tokens to use with the Uniswap V4 pool. Tokens can be claimed once per cooldown period.
        </p>

        {!isConnected && (
          <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
            Connect your wallet to claim tokens
          </div>
        )}

        {isConnected && isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isConnected && !isLoading && (
          <>
            <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
              <div className="font-medium">You will receive:</div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">mUSDC</span>
                <span>{formatUnits(dripAmount0, 18)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">mUSDT</span>
                <span>{formatUnits(dripAmount1, 18)}</span>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border p-4 text-sm">
              <div className="font-medium">Faucet Balances:</div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">mUSDC</span>
                <span>{formatUnits(faucetBalance0, 18)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">mUSDT</span>
                <span>{formatUnits(faucetBalance1, 18)}</span>
              </div>
              {!faucetHasTokens && (
                <div className="mt-2 rounded bg-destructive/10 p-2 text-center text-xs text-destructive">
                  Faucet does not have enough tokens
                </div>
              )}
            </div>

            {!canDrip && countdown > 0n && (
              <div className="rounded-lg bg-yellow-500/10 p-3 text-center text-sm text-yellow-600 dark:text-yellow-400">
                Next claim available in: {formatCountdown(countdown)}
              </div>
            )}
          </>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error.message}
          </div>
        )}

        <Button
          type="button"
          className="w-full"
          disabled={!canClaim}
          onClick={handleClaim}
        >
          {(isPending || isConfirming || isLoading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {getButtonText()}
        </Button>

        {hash && (
          <div className="text-center text-sm text-muted-foreground">
            Transaction:{" "}
            <span className="font-mono">
              {hash.slice(0, 10)}...{hash.slice(-8)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
