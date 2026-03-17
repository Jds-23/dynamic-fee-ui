import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { TUSD } from "@/constants/markets";
import { useMintCollateral } from "@/hooks/useMintCollateral";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";

interface MintGateProps {
  amountNeeded: bigint;
  children: (opts: { insufficientBalance: boolean }) => ReactNode;
}

export function MintGate({ amountNeeded, children }: MintGateProps) {
  const { balance, refetch } = useTokenBalance(TUSD.address);
  const { mint, isPending, isConfirming } = useMintCollateral();

  const insufficientBalance =
    balance !== undefined && amountNeeded > 0n && balance < amountNeeded;
  const isMinting = isPending || isConfirming;

  return (
    <>
      {insufficientBalance && (
        <div className="space-y-2">
          <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-400">
            Insufficient TUSD balance. Mint test tokens to continue.
          </div>
          <Button
            variant="outline"
            className="w-full"
            disabled={isMinting}
            onClick={() => mint("1000000", { onSuccess: () => refetch() })}
          >
            {isMinting ? "Minting..." : "Mint 1M TUSD"}
          </Button>
        </div>
      )}
      {children({ insufficientBalance })}
    </>
  );
}
