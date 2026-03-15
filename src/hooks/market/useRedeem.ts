import type { Address } from "viem";
import { encodeFunctionData } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { erc20Abi } from "@/abi/erc20";
import { PM_CONTRACTS } from "@/constants/markets";
import { MAX_UINT256 } from "@/constants/defaults";
import { useKernelTransaction, type TransactionCallbacks } from "@/hooks/transaction/useKernelTransaction";

interface UseRedeemParams {
  token: Address;
  amount: bigint;
}

export function useRedeem({ token, amount }: UseRedeemParams) {
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(unichainSepolia.id);

  function redeem(options?: TransactionCallbacks) {
    send([
      {
        to: token,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [PM_CONTRACTS.conditionalMarkets, MAX_UINT256],
        }),
      },
      {
        to: PM_CONTRACTS.conditionalMarkets,
        data: encodeFunctionData({
          abi: conditionalMarketsAbi,
          functionName: "redeem",
          args: [token, amount],
        }),
      },
    ], { invalidateScopes: ["market-state", "balances"], ...options });
  }

  return { redeem, hash, isPending, isConfirming, isSuccess, error, reset };
}
