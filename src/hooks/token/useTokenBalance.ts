import type { Address } from "viem";
import { useReadContract } from "wagmi";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { erc20Abi } from "@/abi/erc20";
import { unichainSepolia } from "viem/chains";

interface UseTokenBalanceResult {
  balance: bigint | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTokenBalance(tokenAddress?: Address): UseTokenBalanceResult {
  const { address: userAddress } = useSmartAccount();
  const chainId = unichainSepolia.id;

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
