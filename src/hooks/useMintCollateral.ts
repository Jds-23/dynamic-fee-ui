import { useCallback } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseUnits } from "viem";
import { simpleERC20Abi } from "@/abi/simpleERC20";
import { TUSD } from "@/constants/markets";

export function useMintCollateral() {
  const { address } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  const mint = useCallback(
    (amount: string) => {
      if (!address) {
        console.error("Wallet not connected");
        return;
      }

      const parsedAmount = parseUnits(amount, TUSD.decimals);

      writeContract({
        address: TUSD.address,
        abi: simpleERC20Abi,
        functionName: "mint",
        args: [address, parsedAmount],
      });
    },
    [address, writeContract],
  );

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || confirmError,
    reset,
  };
}
