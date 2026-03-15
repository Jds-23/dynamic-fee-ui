import { encodeFunctionData } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { PM_CONTRACTS } from "@/constants/markets";
import { useKernelTransaction, type TransactionCallbacks } from "@/hooks/transaction/useKernelTransaction";

interface UseSplitMergeParams {
  conditionId: `0x${string}`;
  amount: bigint;
  mode: "split" | "merge";
}

export function useSplitMerge({ conditionId, amount, mode }: UseSplitMergeParams) {
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(unichainSepolia.id);

  function execute(options?: TransactionCallbacks) {
    send([{
      to: PM_CONTRACTS.conditionalMarkets,
      data: encodeFunctionData({
        abi: conditionalMarketsAbi,
        functionName: mode,
        args: [conditionId, amount],
      }),
    }], options);
  }

  return { execute, hash, isPending, isConfirming, isSuccess, error, reset };
}
