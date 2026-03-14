import type { Address } from "viem";
import { encodeFunctionData } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { PM_CONTRACTS } from "@/constants/markets";
import { useKernelTransaction } from "@/hooks/transaction/useKernelTransaction";

interface UseRedeemParams {
  token: Address;
  amount: bigint;
}

export function useRedeem({ token, amount }: UseRedeemParams) {
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(unichainSepolia.id);

  function redeem() {
    send([{
      to: PM_CONTRACTS.conditionalMarkets,
      data: encodeFunctionData({
        abi: conditionalMarketsAbi,
        functionName: "redeem",
        args: [token, amount],
      }),
    }]);
  }

  return { redeem, hash, isPending, isConfirming, isSuccess, error, reset };
}
