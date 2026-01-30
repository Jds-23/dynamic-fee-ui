import { useCallback, useMemo } from "react";
import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { faucetAbi } from "@/abi/faucet";
import { getAddress } from "@/constants/addresses";

export function useDrip() {
  const { address } = useAccount();
  const chainId = useChainId();

  const faucetAddress = useMemo(() => {
    try {
      return getAddress(chainId, "FAUCET");
    } catch {
      return undefined;
    }
  }, [chainId]);

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

  const drip = useCallback(() => {
    if (!address || !faucetAddress) {
      console.error("Missing required parameters for drip");
      return;
    }

    writeContract({
      address: faucetAddress,
      abi: faucetAbi,
      functionName: "drip",
    });
  }, [address, faucetAddress, writeContract]);

  return {
    drip,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || confirmError,
    reset,
  };
}
