import type { Address } from "viem";
import { encodeFunctionData } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { erc20Abi } from "@/abi/erc20";
import { MAX_UINT256 } from "@/constants/defaults";
import { PM_CONTRACTS } from "@/constants/markets";
import {
  type TransactionCallbacks,
  useKernelTransaction,
} from "@/hooks/transaction/useKernelTransaction";

interface UseRedeemParams {
  token: Address;
  amount: bigint;
}

export function useRedeem({ token, amount }: UseRedeemParams) {
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(unichainSepolia.id);

  function redeem(options?: TransactionCallbacks) {
    send(
      [
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
      ],
      options,
    );
  }

  return { redeem, hash, isPending, isConfirming, isSuccess, error, reset };
}
