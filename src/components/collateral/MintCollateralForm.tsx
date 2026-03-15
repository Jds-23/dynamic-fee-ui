import { useState } from "react";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import { erc20Abi } from "@/abi/erc20";
import { Button } from "@/components/ui/Button";
import { TUSD } from "@/constants/markets";
import { useMintCollateral } from "@/hooks/useMintCollateral";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { getExplorerTxUrl } from "@/utils/explorer";

const QUICK_AMOUNTS = [1, 5, 10, 100] as const;

export function MintCollateralForm() {
  const { address, isConnected } = useSmartAccount();
  const [amount, setAmount] = useState("");

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: TUSD.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: unichainSepolia.id,
    query: { enabled: !!address },
  });

  const { mint, hash, isPending, isConfirming, isSuccess, error, reset } =
    useMintCollateral();

  const handleMint = () => {
    const currentAmount = amount;
    reset();
    mint(currentAmount, {
      onSuccess: () => {
        setAmount("");
        refetchBalance();
      },
    });
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

  function addAmount(increment: number) {
    const current = Number(amount) || 0;
    setAmount(String(current + increment));
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-muted" />
        <h3 className="text-base font-semibold leading-tight">Mint TUSD</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Mint test TUSD collateral to use with prediction markets.
      </p>

      {!isConnected && (
        <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
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

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Amount
              </span>
              <div className="relative">
                <span className="pointer-events-none text-4xl font-semibold">
                  {amount || "0"}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
        </>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={!canMint}
        onClick={handleMint}
      >
        {getButtonText()}
      </Button>

      {/* Status banners */}
      {isSuccess && hash && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
          TUSD minted!{" "}
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
          {error.message?.slice(0, 100)}
        </div>
      )}
    </div>
  );
}
