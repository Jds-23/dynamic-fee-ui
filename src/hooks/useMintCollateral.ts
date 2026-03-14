import { useCallback } from "react";
import { encodeFunctionData, parseUnits } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { simpleERC20Abi } from "@/abi/simpleERC20";
import { TUSD } from "@/constants/markets";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useKernelTransaction } from "@/hooks/transaction/useKernelTransaction";

export function useMintCollateral() {
  const { address } = useSmartAccount();
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(unichainSepolia.id);

  const mint = useCallback(
    (amount: string) => {
      if (!address) {
        console.error("Wallet not connected");
        return;
      }

      const parsedAmount = parseUnits(amount, TUSD.decimals);

      send([{
        to: TUSD.address,
        data: encodeFunctionData({
          abi: simpleERC20Abi,
          functionName: "mint",
          args: [address, parsedAmount],
        }),
      }]);
    },
    [address, send],
  );

  return { mint, hash, isPending, isConfirming, isSuccess, error, reset };
}
