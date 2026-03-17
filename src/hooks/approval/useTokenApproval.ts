import type { Address } from "viem";
import { encodeFunctionData } from "viem";
import { useReadContract } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import { erc20Abi } from "@/abi/erc20";
import { MAX_UINT256 } from "@/constants/defaults";
import { useKernelTransaction } from "@/hooks/transaction/useKernelTransaction";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { retryRefetch } from "@/lib/retryRefetch";

interface UseTokenApprovalParams {
  tokenAddress?: Address;
  spender?: Address;
  amount: bigint;
}

export function useTokenApproval({
  tokenAddress,
  spender,
  amount,
}: UseTokenApprovalParams) {
  const { address } = useSmartAccount();

  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && spender ? [address, spender] : undefined,
    chainId: unichainSepolia.id,
    query: { enabled: !!tokenAddress && !!spender && !!address },
  });

  const { send, isPending, isConfirming, reset } = useKernelTransaction(
    unichainSepolia.id,
  );

  const needsApproval =
    !!tokenAddress &&
    !!spender &&
    (allowance === undefined || allowance < amount);

  function approve() {
    if (!tokenAddress || !spender) return;
    send(
      [
        {
          to: tokenAddress,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [spender, MAX_UINT256],
          }),
        },
      ],
      { onSuccess: () => retryRefetch(refetch) },
    );
  }

  return { needsApproval, approve, isPending, isConfirming, refetch, reset };
}
