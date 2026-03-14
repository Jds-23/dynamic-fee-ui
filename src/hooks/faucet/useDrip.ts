import { useCallback, useMemo } from "react";
import { encodeFunctionData } from "viem";
import { useChainId } from "wagmi";
import { faucetAbi } from "@/abi/faucet";
import { getAddress } from "@/constants/addresses";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useKernelTransaction } from "@/hooks/transaction/useKernelTransaction";

export function useDrip() {
  const { address } = useSmartAccount();
  const chainId = useChainId();
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(chainId);

  const faucetAddress = useMemo(() => {
    try {
      return getAddress(chainId, "FAUCET");
    } catch {
      return undefined;
    }
  }, [chainId]);

  const drip = useCallback(() => {
    if (!address || !faucetAddress) {
      console.error("Missing required parameters for drip");
      return;
    }

    send([{
      to: faucetAddress,
      data: encodeFunctionData({
        abi: faucetAbi,
        functionName: "drip",
      }),
    }]);
  }, [address, faucetAddress, send]);

  return { drip, hash, isPending, isConfirming, isSuccess, error, reset };
}
