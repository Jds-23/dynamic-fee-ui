import type { Address } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { erc20Abi } from "@/abi/erc20";

interface UseTokenBalanceResult {
  balance: bigint | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTokenBalance(tokenAddress?: Address): UseTokenBalanceResult {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    chainId,
    query: {
      enabled: !!tokenAddress && !!userAddress,
    },
  });

  return {
    balance: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
