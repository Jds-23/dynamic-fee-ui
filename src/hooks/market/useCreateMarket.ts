import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import type { Address } from "viem";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { PM_CONTRACTS } from "@/constants/markets";

interface UseCreateMarketParams {
  conditionId: `0x${string}`;
  collateralAddress: Address;
  fundingAmount: bigint;
}

export function useCreateMarket({ conditionId, collateralAddress, fundingAmount }: UseCreateMarketParams) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: unichainSepolia.id,
  });

  function createMarket() {
    writeContract({
      address: PM_CONTRACTS.conditionalMarkets,
      abi: conditionalMarketsAbi,
      functionName: "createMarket",
      args: [conditionId, collateralAddress, fundingAmount],
      chainId: unichainSepolia.id,
    });
  }

  return { createMarket, hash, isPending, isConfirming, isSuccess, error, reset };
}
