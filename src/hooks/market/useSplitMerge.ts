import { encodeFunctionData } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { multiverseMarketsAbi } from "@/abi/multiverseMarkets";
import { PM_CONTRACTS } from "@/constants/markets";
import {
  type TransactionCallbacks,
  useKernelTransaction,
} from "@/hooks/transaction/useKernelTransaction";

interface UseSplitMergeParams {
  universeId: `0x${string}`;
  amount: bigint;
  mode: "split" | "merge";
}

export function useSplitMerge({
  universeId,
  amount,
  mode,
}: UseSplitMergeParams) {
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(unichainSepolia.id);

  function execute(options?: TransactionCallbacks) {
    send(
      [
        {
          to: PM_CONTRACTS.multiverseMarkets,
          data: encodeFunctionData({
            abi: multiverseMarketsAbi,
            functionName: mode,
            args: [universeId, amount],
          }),
        },
      ],
      options,
    );
  }

  return { execute, hash, isPending, isConfirming, isSuccess, error, reset };
}
