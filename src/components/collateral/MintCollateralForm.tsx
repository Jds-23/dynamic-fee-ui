import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { erc20Abi } from "@/abi/erc20";
import { TUSD } from "@/constants/markets";
import { useMintCollateral } from "@/hooks/useMintCollateral";
import { getExplorerTxUrl } from "@/utils/explorer";

export function MintCollateralForm() {
  const { address, isConnected } = useSmartAccount();
  const [amount, setAmount] = useState("");

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: TUSD.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { mint, hash, isPending, isConfirming, isSuccess, error, reset } =
    useMintCollateral();

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("TUSD minted!", {
        description: `${amount} TUSD sent to your wallet`,
        action: {
          label: "View tx",
          onClick: () => window.open(getExplorerTxUrl(hash, 1301), "_blank"),
        },
        duration: 10000,
      });
      setAmount("");
      refetchBalance();
    }
  }, [isSuccess, hash, refetchBalance, amount]);

  useEffect(() => {
    if (error) {
      toast.error("Mint failed", {
        description: error.message?.slice(0, 100) || "Transaction failed",
        duration: 8000,
      });
    }
  }, [error]);

  const handleMint = () => {
    reset();
    mint(amount);
  };

  const parsedAmount = Number(amount);
  const validAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;

  const getButtonText = () => {
    if (!isConnected) return "Initializing...";
    if (isPending) return "Confirm in wallet...";
    if (isConfirming) return "Minting...";
    if (!amount) return "Enter amount";
    if (!validAmount) return "Invalid amount";
    return "Mint TUSD";
  };

  const canMint = isConnected && validAmount && !isPending && !isConfirming;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Mint TUSD</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Mint test TUSD collateral to use with prediction markets.
        </p>

        {!isConnected && (
          <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
            Initializing...
          </div>
        )}

        {isConnected && (
          <>
            <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your TUSD balance</span>
                <span>
                  {balance !== undefined
                    ? formatUnits(balance as bigint, TUSD.decimals)
                    : "—"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="mint-amount" className="text-sm font-medium">
                Amount
              </label>
              <input
                id="mint-amount"
                type="number"
                min="0"
                step="any"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
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
          disabled={!canMint}
          onClick={handleMint}
        >
          {(isPending || isConfirming) && (
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
