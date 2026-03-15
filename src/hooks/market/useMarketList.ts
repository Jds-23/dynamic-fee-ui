import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Address } from "viem";
import { zeroAddress } from "viem";
import { useReadContracts } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import { conditionalLMSRHookAbi } from "@/abi/conditionalLMSRHook";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { PM_CONTRACTS } from "@/constants/markets";
import { fetchMarkets } from "@/lib/api";
import { wadToProb } from "@/lib/market";
import type { MarketState, MarketWithPrices } from "@/types";

const chainId = unichainSepolia.id;

export function useMarketList() {
  const { data: conditions = [], isLoading: isLoadingConditions } = useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
  });

  // Batch 1: markets() + resolved() for every condition
  const batch1Contracts = conditions.flatMap((m) => [
    {
      address: PM_CONTRACTS.conditionalLMSRHook,
      abi: conditionalLMSRHookAbi,
      functionName: "markets" as const,
      args: [m.conditionId] as const,
      chainId,
    },
    {
      address: PM_CONTRACTS.conditionalMarkets,
      abi: conditionalMarketsAbi,
      functionName: "resolved" as const,
      args: [m.conditionId] as const,
      chainId,
    },
  ]);

  const batch1 = useReadContracts({
    contracts: batch1Contracts,
    query: {
      enabled: conditions.length > 0,
      refetchInterval: 15000,
    },
  });

  // Parse batch 1 → MarketState[] + token addresses for batch 2
  const { states, tokenPairs } = useMemo(() => {
    const states: (MarketState | null)[] = [];
    const tokenPairs: { yes: Address; no: Address }[] = [];

    for (let i = 0; i < conditions.length; i++) {
      const marketsResult = batch1.data?.[i * 2];
      const resolvedResult = batch1.data?.[i * 2 + 1];

      if (marketsResult?.status !== "success" || !marketsResult.result) {
        states.push(null);
        tokenPairs.push({ yes: zeroAddress, no: zeroAddress });
        continue;
      }

      const [
        collateralToken,
        yes,
        no,
        funding,
        reserveYes,
        reserveNo,
        reserveCollateral,
      ] = marketsResult.result as [
        Address,
        Address,
        Address,
        bigint,
        bigint,
        bigint,
        bigint,
      ];

      const resolved =
        resolvedResult?.status === "success"
          ? (resolvedResult.result as Address)
          : zeroAddress;

      states.push({
        // @ts-ignore
        conditionId: conditions[i]?.conditionId,
        collateralAddress: collateralToken,
        yesTokenAddress: yes,
        noTokenAddress: no,
        reserveYes,
        reserveNo,
        reserveCollateral,
        funding,
        resolved,
      });

      tokenPairs.push({ yes, no });
    }

    return { states, tokenPairs };
  }, [batch1.data, conditions]);

  // Batch 2: calcMarginalPrice for each token
  const anyTokens = tokenPairs.some((p) => p.yes !== zeroAddress);

  const batch2Contracts = conditions.flatMap((m, i) => [
    {
      address: PM_CONTRACTS.conditionalLMSRHook,
      abi: conditionalLMSRHookAbi,
      functionName: "calcMarginalPrice" as const,
      args: [m.conditionId, tokenPairs[i]?.yes ?? zeroAddress] as const,
      chainId,
    },
    {
      address: PM_CONTRACTS.conditionalLMSRHook,
      abi: conditionalLMSRHookAbi,
      functionName: "calcMarginalPrice" as const,
      args: [m.conditionId, tokenPairs[i]?.no ?? zeroAddress] as const,
      chainId,
    },
  ]);

  const batch2 = useReadContracts({
    contracts: batch2Contracts,
    query: {
      enabled: anyTokens,
      refetchInterval: 15000,
    },
  });

  const markets = useMemo((): MarketWithPrices[] => {
    return conditions.map((condition, i) => {
      const state = states[i] ?? null;
      const isResolved = state !== null && state.resolved !== zeroAddress;
      let resolvedOutcome: "YES" | "NO" | null = null;
      if (isResolved && state) {
        resolvedOutcome =
          state.resolved === state.yesTokenAddress ? "YES" : "NO";
      }

      let yesProb: number | null = null;
      let noProb: number | null = null;

      const yesPriceResult = batch2.data?.[i * 2];
      const noPriceResult = batch2.data?.[i * 2 + 1];

      if (yesPriceResult?.status === "success") {
        yesProb = wadToProb(yesPriceResult.result as bigint);
      }
      if (noPriceResult?.status === "success") {
        noProb = wadToProb(noPriceResult.result as bigint);
      }

      return { condition, state, yesProb, noProb, isResolved, resolvedOutcome };
    });
  }, [conditions, states, batch2.data]);

  return {
    markets,
    isLoading: isLoadingConditions || batch1.isLoading || batch2.isLoading,
    refetch: () => {
      batch1.refetch();
      batch2.refetch();
    },
  };
}
