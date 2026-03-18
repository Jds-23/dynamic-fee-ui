import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Address } from "viem";
import { zeroAddress } from "viem";
import { useReadContracts } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import { multiverseHookAbi } from "@/abi/multiverseHook";
import { multiverseMarketsAbi } from "@/abi/multiverseMarkets";
import { PM_CONTRACTS } from "@/constants/markets";
import { fetchMarkets } from "@/lib/api";
import { wadToProb } from "@/lib/market";
import type { MarketState, MarketWithPrices } from "@/types";

const chainId = unichainSepolia.id;

export function useMarketList() {
  const { data: universes = [], isLoading: isLoadingUniverses } = useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
  });

  // Batch 1: markets() + resolved() for every universe
  const batch1Contracts = universes.flatMap((m) => [
    {
      address: PM_CONTRACTS.multiverseHook,
      abi: multiverseHookAbi,
      functionName: "markets" as const,
      args: [m.universeId] as const,
      chainId,
    },
    {
      address: PM_CONTRACTS.multiverseMarkets,
      abi: multiverseMarketsAbi,
      functionName: "resolved" as const,
      args: [m.universeId] as const,
      chainId,
    },
  ]);

  const batch1 = useReadContracts({
    contracts: batch1Contracts,
    query: {
      enabled: universes.length > 0,
      refetchInterval: 15000,
    },
  });

  // Parse batch 1 → MarketState[] + token addresses for batch 2
  const { states, tokenPairs } = useMemo(() => {
    const states: (MarketState | null)[] = [];
    const tokenPairs: { yes: Address; no: Address }[] = [];

    for (let i = 0; i < universes.length; i++) {
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
        universeId: universes[i]?.universeId,
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
  }, [batch1.data, universes]);

  // Batch 2: calcMarginalPrice for each token
  const anyTokens = tokenPairs.some((p) => p.yes !== zeroAddress);

  const batch2Contracts = universes.flatMap((m, i) => [
    {
      address: PM_CONTRACTS.multiverseHook,
      abi: multiverseHookAbi,
      functionName: "calcMarginalPrice" as const,
      args: [m.universeId, tokenPairs[i]?.yes ?? zeroAddress] as const,
      chainId,
    },
    {
      address: PM_CONTRACTS.multiverseHook,
      abi: multiverseHookAbi,
      functionName: "calcMarginalPrice" as const,
      args: [m.universeId, tokenPairs[i]?.no ?? zeroAddress] as const,
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
    return universes.map((universe, i) => {
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

      return { universe, state, yesProb, noProb, isResolved, resolvedOutcome };
    });
  }, [universes, states, batch2.data]);

  return {
    markets,
    isLoading: isLoadingUniverses || batch1.isLoading || batch2.isLoading,
    refetch: () => {
      batch1.refetch();
      batch2.refetch();
    },
  };
}
