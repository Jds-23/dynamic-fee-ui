import type { Address, Hex } from "viem";
import { encodeFunctionData } from "viem";
import { useReadContract } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import { conditionalMarketsAbi } from "@/abi/conditionalMarkets";
import { erc20Abi } from "@/abi/erc20";
import { MAX_UINT256 } from "@/constants/defaults";
import { PM_CONTRACTS } from "@/constants/markets";
import {
  type TransactionCallbacks,
  useKernelTransaction,
} from "@/hooks/transaction/useKernelTransaction";
import { useSmartAccount } from "@/hooks/useSmartAccount";

interface UseCreateMarketParams {
  conditionId: `0x${string}`;
  collateralAddress: Address;
  fundingAmount: bigint;
}

export function useCreateMarket({
  conditionId,
  collateralAddress,
  fundingAmount,
}: UseCreateMarketParams) {
  const { address } = useSmartAccount();
  const spender = PM_CONTRACTS.conditionalMarkets;

  const { data: allowance } = useReadContract({
    address: collateralAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, spender] : undefined,
    chainId: unichainSepolia.id,
    query: { enabled: !!address },
  });

  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(unichainSepolia.id);

  function createMarket(options?: TransactionCallbacks) {
    const calls: { to: Hex; data: Hex }[] = [];

    // Prepend approve if allowance insufficient
    if (allowance === undefined || allowance < fundingAmount) {
      calls.push({
        to: collateralAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, MAX_UINT256],
        }),
      });
    }

    calls.push({
      to: spender,
      data: encodeFunctionData({
        abi: conditionalMarketsAbi,
        functionName: "createMarket",
        args: [conditionId, collateralAddress, fundingAmount],
      }),
    });

    send(calls, options);
  }

  return {
    createMarket,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
