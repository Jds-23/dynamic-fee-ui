import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { zeroAddress } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { erc20Abi } from "@/abi/erc20";
import { useMarketList } from "@/hooks/market/useMarketList";
import type { MarketWithPrices } from "@/types";

export interface PortfolioPosition {
  market: MarketWithPrices;
  yesBalance: bigint;
  noBalance: bigint;
  yesValue: bigint; // balance * marginalPrice / 1e18
  noValue: bigint;
  redeemable: boolean;
  winnerToken: `0x${string}` | null;
  winnerBalance: bigint;
}

export function usePortfolio() {
  const { address } = useSmartAccount();
  const { markets, isLoading: marketsLoading } = useMarketList();

  // Build balance read calls for all markets with state
  const balanceCalls = useMemo(() => {
    if (!address) return [];
    return markets.flatMap((m) => {
      if (!m.state) return [];
      return [
        {
          address: m.state.yesTokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf" as const,
          args: [address] as const,
          chainId: unichainSepolia.id,
        },
        {
          address: m.state.noTokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf" as const,
          args: [address] as const,
          chainId: unichainSepolia.id,
        },
      ];
    });
  }, [address, markets]);

  const { data: balanceData, isLoading: balancesLoading } = useReadContracts({
    contracts: balanceCalls,
    query: {
      enabled: balanceCalls.length > 0,
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    },
  });

  const positions = useMemo((): PortfolioPosition[] => {
    if (!balanceData) return [];

    const result: PortfolioPosition[] = [];
    let idx = 0;

    for (const m of markets) {
      if (!m.state) continue;

      const yesResult = balanceData[idx];
      const noResult = balanceData[idx + 1];
      idx += 2;

      const yesBalance = yesResult?.status === "success" ? (yesResult.result as bigint) : 0n;
      const noBalance = noResult?.status === "success" ? (noResult.result as bigint) : 0n;

      if (yesBalance === 0n && noBalance === 0n) continue;

      // value = balance * marginalPrice / 1e18
      const yesPrice = m.yesProb !== null ? BigInt(Math.floor(m.yesProb * 1e18)) : 0n;
      const noPrice = m.noProb !== null ? BigInt(Math.floor(m.noProb * 1e18)) : 0n;
      const yesValue = (yesBalance * yesPrice) / 10n ** 18n;
      const noValue = (noBalance * noPrice) / 10n ** 18n;

      const redeemable =
        m.isResolved &&
        m.state.resolved !== zeroAddress &&
        ((m.resolvedOutcome === "YES" && yesBalance > 0n) ||
          (m.resolvedOutcome === "NO" && noBalance > 0n));

      const winnerToken = m.isResolved
        ? m.resolvedOutcome === "YES"
          ? m.state.yesTokenAddress
          : m.state.noTokenAddress
        : null;

      const winnerBalance = m.isResolved
        ? m.resolvedOutcome === "YES"
          ? yesBalance
          : noBalance
        : 0n;

      result.push({
        market: m,
        yesBalance,
        noBalance,
        yesValue,
        noValue,
        redeemable,
        winnerToken,
        winnerBalance,
      });
    }

    return result;
  }, [markets, balanceData]);

  return { positions, isLoading: marketsLoading || balancesLoading };
}
