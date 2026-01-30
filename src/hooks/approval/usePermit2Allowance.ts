import type { Address } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { permit2Abi } from "@/abi/permit2";
import { getAddress } from "@/constants/addresses";

interface UsePermit2AllowanceResult {
  allowance: bigint | undefined;
  expiration: number | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePermit2Allowance(
  tokenAddress?: Address,
  spenderAddress?: Address,
): UsePermit2AllowanceResult {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();

  let permit2Address: Address | undefined;
  try {
    permit2Address = getAddress(chainId, "PERMIT2");
  } catch {
    permit2Address = undefined;
  }

  const { data, isLoading, error, refetch } = useReadContract({
    address: permit2Address,
    abi: permit2Abi,
    functionName: "allowance",
    args:
      userAddress && tokenAddress && spenderAddress
        ? [userAddress, tokenAddress, spenderAddress]
        : undefined,
    chainId,
    query: {
      enabled:
        !!permit2Address && !!tokenAddress && !!spenderAddress && !!userAddress,
    },
  });

  return {
    allowance: data?.[0],
    expiration: data?.[1] !== undefined ? Number(data[1]) : undefined,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
