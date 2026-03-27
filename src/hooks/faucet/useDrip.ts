import { useCallback, useMemo } from "react";
import { encodeFunctionData } from "viem";
import { useChainId } from "wagmi";
import { faucetAbi } from "@/abi/faucet";
import { getAddress } from "@/constants/addresses";
import {
  type TransactionCallbacks,
  useKernelTransaction,
} from "@/hooks/transaction/useKernelTransaction";
import { useSmartAccount } from "@/hooks/useSmartAccount";

export function useDrip() {
  const { address } = useSmartAccount();
  const chainId = useChainId();
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
  } = useKernelTransaction(chainId);

  const faucetAddress = useMemo(() => {
    try {
      return getAddress(chainId, "FAUCET");
    } catch {
      return undefined;
    }
  }, [chainId]);

  const drip = useCallback(
    (options?: TransactionCallbacks) => {
      if (!address || !faucetAddress) {
        console.error("Missing required parameters for drip");
        return;
      }

      send(
        [
          {
            to: faucetAddress,
            data: encodeFunctionData({
              abi: faucetAbi,
              functionName: "drip",
            }),
          },
        ],
        options,
      );
    },
    [address, faucetAddress, send],
  );

  return {
    drip,
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
