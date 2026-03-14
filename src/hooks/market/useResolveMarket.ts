import type { Address } from "viem";
import { encodeFunctionData } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { PM_CONTRACTS } from "@/constants/markets";
import { useKernelTransaction } from "@/hooks/transaction/useKernelTransaction";

interface UseResolveMarketParams {
  conditionId: `0x${string}`;
  winner: Address;
}

export function useResolveMarket({ conditionId, winner }: UseResolveMarketParams) {
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(unichainSepolia.id);

  function resolve() {
    send([{
      to: PM_CONTRACTS.conditionalMarkets,
      data: encodeFunctionData({
        abi: conditionalMarketsAbi,
        functionName: "resolve",
        args: [conditionId, winner],
      }),
    }]);
  }

  return { resolve, hash, isPending, isConfirming, isSuccess, error, reset };
}
