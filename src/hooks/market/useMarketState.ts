import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { zeroAddress } from "viem";
import type { Address } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { conditionalLMSRHookAbi } from "@/abi/conditionalLMSRHook";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { PM_CONTRACTS } from "@/constants/markets";
import { wadToProb } from "@/lib/market";
import type { MarketCondition, MarketState, MarketWithPrices } from "@/types";

const chainId = unichainSepolia.id;

export function useMarketState(condition: MarketCondition) {
  const { conditionId } = condition;

  // Batch 1: market struct + resolved status
  const batch1 = useReadContracts({
    contracts: [
      {
        address: PM_CONTRACTS.conditionalLMSRHook,
        abi: conditionalLMSRHookAbi,
        functionName: "markets",
        args: [conditionId],
        chainId,
      },
      {
        address: PM_CONTRACTS.conditionalMarkets,
        abi: conditionalMarketsAbi,
        functionName: "resolved",
        args: [conditionId],
        chainId,
      },
    ],
    query: { refetchInterval: 15000 },
  });

  const { state, yesToken, noToken } = useMemo(() => {
    const marketsResult = batch1.data?.[0];
    const resolvedResult = batch1.data?.[1];

    if (marketsResult?.status !== "success" || !marketsResult.result) {
      return { state: null, yesToken: zeroAddress, noToken: zeroAddress };
    }

    const [collateralToken, yes, no, funding, reserveYes, reserveNo, reserveCollateral] =
      marketsResult.result as [Address, Address, Address, bigint, bigint, bigint, bigint];

    const resolved =
      resolvedResult?.status === "success"
        ? (resolvedResult.result as Address)
        : zeroAddress;

    const ms: MarketState = {
      conditionId,
      collateralAddress: collateralToken,
      yesTokenAddress: yes,
      noTokenAddress: no,
      reserveYes,
      reserveNo,
      reserveCollateral,
      funding,
      resolved,
    };

    return { state: ms, yesToken: yes, noToken: no };
  }, [batch1.data, conditionId]);

  // Batch 2: marginal prices (enabled when we have token addresses)
  const batch2 = useReadContracts({
    contracts: [
      {
        address: PM_CONTRACTS.conditionalLMSRHook,
        abi: conditionalLMSRHookAbi,
        functionName: "calcMarginalPrice",
        args: [conditionId, yesToken],
        chainId,
      },
      {
        address: PM_CONTRACTS.conditionalLMSRHook,
        abi: conditionalLMSRHookAbi,
        functionName: "calcMarginalPrice",
        args: [conditionId, noToken],
        chainId,
      },
    ],
    query: {
      enabled: yesToken !== zeroAddress,
      refetchInterval: 15000,
    },
  });

  const result = useMemo((): MarketWithPrices & { isLoading: boolean } => {
    const isResolved = state !== null && state.resolved !== zeroAddress;
    let resolvedOutcome: "YES" | "NO" | null = null;
    if (isResolved && state) {
      resolvedOutcome = state.resolved === state.yesTokenAddress ? "YES" : "NO";
    }

    let yesProb: number | null = null;
    let noProb: number | null = null;

    const yesPriceResult = batch2.data?.[0];
    const noPriceResult = batch2.data?.[1];

    if (yesPriceResult?.status === "success") {
      yesProb = wadToProb(yesPriceResult.result as bigint);
    }
    if (noPriceResult?.status === "success") {
      noProb = wadToProb(noPriceResult.result as bigint);
    }

    return {
      condition,
      state,
      yesProb,
      noProb,
      isResolved,
      resolvedOutcome,
      isLoading: batch1.isLoading || batch2.isLoading,
    };
  }, [condition, state, batch2.data, batch1.isLoading, batch2.isLoading]);

  return {
    ...result,
    refetch: () => {
      batch1.refetch();
      batch2.refetch();
    },
  };
}
