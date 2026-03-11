import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import type { Address } from "viem";
import { erc20Abi } from "@/abi/erc20";
import { MAX_UINT256 } from "@/constants/defaults";

interface UseTokenApprovalParams {
  tokenAddress?: Address;
  spender?: Address;
  amount: bigint;
}

export function useTokenApproval({ tokenAddress, spender, amount }: UseTokenApprovalParams) {
  const { address } = useAccount();

  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && spender ? [address, spender] : undefined,
    chainId: unichainSepolia.id,
    query: { enabled: !!tokenAddress && !!spender && !!address },
  });

  const { writeContract, data: hash, isPending, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: unichainSepolia.id,
  });

  // Refetch allowance after approval confirms
  if (isSuccess && hash) {
    refetch();
  }

  const needsApproval =
    !!tokenAddress && !!spender && (allowance === undefined || allowance < amount);

  function approve() {
    if (!tokenAddress || !spender) return;
    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, MAX_UINT256],
      chainId: unichainSepolia.id,
    });
  }

  return { needsApproval, approve, isPending, isConfirming, refetch, reset };
}
