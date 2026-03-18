import type { Address } from "viem";
import { encodeFunctionData } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { multiverseMarketsAbi } from "@/abi/multiverseMarkets";
import { PM_CONTRACTS } from "@/constants/markets";
import {
  type TransactionCallbacks,
  useKernelTransaction,
} from "@/hooks/transaction/useKernelTransaction";

interface UseResolveMarketParams {
  universeId: `0x${string}`;
  winner: Address;
}

export function useResolveMarket({
  universeId,
  winner,
}: UseResolveMarketParams) {
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(unichainSepolia.id);

  function resolve(options?: TransactionCallbacks) {
    send(
      [
        {
          to: PM_CONTRACTS.multiverseMarkets,
          data: encodeFunctionData({
            abi: multiverseMarketsAbi,
            functionName: "resolve",
            args: [universeId, winner],
          }),
        },
      ],
      options,
    );
  }

  return { resolve, hash, isPending, isConfirming, isSuccess, error, reset };
}
