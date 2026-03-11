import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { PM_CONTRACTS } from "@/constants/markets";

interface UseSplitMergeParams {
  conditionId: `0x${string}`;
  amount: bigint;
  mode: "split" | "merge";
}

export function useSplitMerge({ conditionId, amount, mode }: UseSplitMergeParams) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: unichainSepolia.id,
  });

  function execute() {
    writeContract({
      address: PM_CONTRACTS.conditionalMarkets,
      abi: conditionalMarketsAbi,
      functionName: mode,
      args: [conditionId, amount],
      chainId: unichainSepolia.id,
    });
  }

  return { execute, hash, isPending, isConfirming, isSuccess, error, reset };
}
