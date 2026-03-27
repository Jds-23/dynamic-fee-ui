import { useCallback } from "react";
import { encodeFunctionData, parseUnits } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { simpleERC20Abi } from "@/abi/simpleERC20";
import { TUSD } from "@/constants/markets";
import {
  type TransactionCallbacks,
  useKernelTransaction,
} from "@/hooks/transaction/useKernelTransaction";
import { useSmartAccount } from "@/hooks/useSmartAccount";

export function useMintCollateral() {
  const { address } = useSmartAccount();
  const {
    send,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
    retryCountdown,
    retryAttempt,
    isRetrying,
  } = useKernelTransaction(unichainSepolia.id);

  const mint = useCallback(
    (amount: string, options?: TransactionCallbacks) => {
      if (!address) {
        console.error("Wallet not connected");
        return;
      }

      const parsedAmount = parseUnits(amount, TUSD.decimals);

      send(
        [
          {
            to: TUSD.address,
            data: encodeFunctionData({
              abi: simpleERC20Abi,
              functionName: "mint",
              args: [address, parsedAmount],
            }),
          },
        ],
        options,
      );
    },
    [address, send],
  );

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
    retryCountdown,
    retryAttempt,
    isRetrying,
  };
}
