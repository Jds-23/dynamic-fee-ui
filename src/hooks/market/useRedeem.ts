import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import type { Address } from "viem";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { PM_CONTRACTS } from "@/constants/markets";

interface UseRedeemParams {
  token: Address;
  amount: bigint;
}

export function useRedeem({ token, amount }: UseRedeemParams) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: unichainSepolia.id,
  });

  function redeem() {
    writeContract({
      address: PM_CONTRACTS.conditionalMarkets,
      abi: conditionalMarketsAbi,
      functionName: "redeem",
      args: [token, amount],
      chainId: unichainSepolia.id,
    });
  }

  return { redeem, hash, isPending, isConfirming, isSuccess, error, reset };
}
