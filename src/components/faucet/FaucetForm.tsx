import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/Button";
import { useDrip } from "@/hooks/faucet/useDrip";
import { useFaucetState } from "@/hooks/faucet/useFaucetState";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { retryRefetch } from "@/lib/retryRefetch";
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
  const { isConnected } = useSmartAccount();
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

  const { drip, hash, isPending, isConfirming, error, reset } = useDrip();

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

  const handleClaim = () => {
    reset();
    drip({
      onSuccess: () => {
        retryRefetch(refetch);
      },
    });
  };

  const faucetHasTokens =
    faucetBalance0 >= dripAmount0 && faucetBalance1 >= dripAmount1;

  const getButtonText = () => {
    if (!isConnected) return "Initializing...";
    if (isLoading) return "Loading...";
    if (isPending) return "Confirm in wallet...";
    if (isConfirming) return "Claiming tokens...";
    if (!canDrip && countdown > 0n)
      return `Cooldown: ${formatCountdown(countdown)}`;
    if (!faucetHasTokens) return "Faucet Empty";
    return "Claim Tokens";
  };

  const canClaim =
    isConnected &&
    canDrip &&
    faucetHasTokens &&
    !isPending &&
    !isConfirming &&
    !isLoading;

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-muted" />
        <h3 className="text-base font-semibold leading-tight">
          Test Token Faucet
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Claim test tokens to use with the Uniswap V4 pool. Tokens can be claimed
        once per cooldown period.
      </p>

      {!isConnected && (
        <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
          Initializing...
        </div>
      )}

      {isConnected && isLoading && (
        <div className="text-center text-sm text-muted-foreground py-4">
          Loading faucet state...
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

          <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
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
              <div className="mt-2 rounded-md bg-red-500/10 p-2 text-center text-xs text-red-400">
                Faucet does not have enough tokens
              </div>
            )}
          </div>

          {!canDrip && countdown > 0n && (
            <div className="rounded-md bg-yellow-500/10 p-3 text-center text-sm text-yellow-400">
              Next claim available in: {formatCountdown(countdown)}
            </div>
          )}
        </>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={!canClaim}
        onClick={handleClaim}
      >
        {getButtonText()}
      </Button>

      {/* Status banners */}
      {hash && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
          Tokens claimed!{" "}
          <a
            href={getExplorerTxUrl(hash)}
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
          {error.message?.slice(0, 100)}
        </div>
      )}
    </div>
  );
}
