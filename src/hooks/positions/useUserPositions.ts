import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import { getAddress } from "@/constants/addresses";
import { fetchNFTsForOwner } from "@/lib/alchemy";
import type { AlchemyNFT } from "@/types/userPosition";

interface UseUserPositionsResult {
  positions: AlchemyNFT[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  hasNextPage: boolean;
  pageKey: string | undefined;
}

export function useUserPositions(): UseUserPositionsResult {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const query = useQuery({
    queryKey: ["userPositions", address, chainId],
    queryFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const positionManager = getAddress(chainId, "POSITION_MANAGER");

      return fetchNFTsForOwner({
        owner: address,
        contractAddress: positionManager,
        chainId,
      });
    },
    enabled: isConnected && !!address,
    staleTime: 30_000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });

  return {
    positions: query.data?.ownedNfts ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    hasNextPage: !!query.data?.pageKey,
    pageKey: query.data?.pageKey,
  };
}
