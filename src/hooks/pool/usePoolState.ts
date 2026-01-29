import { useMemo } from "react";
import { useChainId, useReadContracts } from "wagmi";
import { stateViewAbi } from "@/abi/stateView";
import { getAddress } from "@/constants/addresses";
import { computePoolId } from "@/lib/poolId";
import type { PoolKey, PoolState } from "@/types";

export function usePoolState(poolKey: PoolKey | undefined) {
  const chainId = useChainId();

  // Get StateView address for the current chain
  const stateView = useMemo(() => {
    try {
      return getAddress(chainId, "STATE_VIEW");
    } catch {
      return undefined;
    }
  }, [chainId]);

  // Compute pool ID from pool key
  const poolId = useMemo(() => {
    if (!poolKey) return undefined;
    return computePoolId(poolKey);
  }, [poolKey]);

  // Fetch slot0 and liquidity in parallel
  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        address: stateView,
        abi: stateViewAbi,
        functionName: "getSlot0",
        args: poolId ? [poolId] : undefined,
        chainId,
      },
      {
        address: stateView,
        abi: stateViewAbi,
        functionName: "getLiquidity",
        args: poolId ? [poolId] : undefined,
        chainId,
      },
    ],
    query: {
      enabled: !!poolId && !!stateView,
    },
  });

  const poolState: PoolState | undefined = useMemo(() => {
    if (!data || !poolId) return undefined;

    const slot0Result = data[0];
    const liquidityResult = data[1];

    if (slot0Result?.status !== "success" || !slot0Result.result) {
      return undefined;
    }

    const [sqrtPriceX96, tick, protocolFee, lpFee] = slot0Result.result;
    const liquidity =
      liquidityResult?.status === "success" && liquidityResult.result
        ? liquidityResult.result
        : 0n;

    return {
      poolId: poolId as `0x${string}`,
      sqrtPriceX96: BigInt(sqrtPriceX96),
      tick: Number(tick),
      protocolFee: Number(protocolFee),
      lpFee: Number(lpFee),
      liquidity: BigInt(liquidity),
    };
  }, [data, poolId]);

  return {
    poolState,
    poolId,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
