import type { Address } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { erc20Abi } from "@/abi/erc20";

interface UseErc20AllowanceResult {
  allowance: bigint | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useErc20Allowance(
  tokenAddress?: Address,
  spenderAddress?: Address,
): UseErc20AllowanceResult {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args:
      userAddress && spenderAddress ? [userAddress, spenderAddress] : undefined,
    chainId,
    query: {
      enabled: !!tokenAddress && !!spenderAddress && !!userAddress,
    },
  });

  return {
    allowance: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
