import type { Address } from "viem";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import { erc20Abi } from "@/abi/erc20";
import { permit2Abi } from "@/abi/permit2";
import { PM_CONTRACTS } from "@/constants/markets";
import { MAX_UINT160, MAX_UINT256 } from "@/constants/defaults";

interface UseMarketTradeApprovalParams {
  tokenAddress?: Address;
  amount: bigint;
}

export function useMarketTradeApproval({ tokenAddress, amount }: UseMarketTradeApprovalParams) {
  const { address: userAddress } = useAccount();
  const permit2Address = PM_CONTRACTS.permit2;
  const routerAddress = PM_CONTRACTS.universalRouter;

  // ERC20 allowance to Permit2
  const { data: erc20Allowance, refetch: refetchErc20 } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: userAddress && permit2Address ? [userAddress, permit2Address] : undefined,
    chainId: unichainSepolia.id,
    query: { enabled: !!tokenAddress && !!userAddress },
  });

  // Permit2 allowance to Universal Router
  const { data: permit2Data, refetch: refetchPermit2 } = useReadContract({
    address: permit2Address,
    abi: permit2Abi,
    functionName: "allowance",
    args: userAddress && tokenAddress ? [userAddress, tokenAddress, routerAddress] : undefined,
    chainId: unichainSepolia.id,
    query: { enabled: !!tokenAddress && !!userAddress },
  });
  const permit2Allowance = permit2Data?.[0];

  const needsErc20Approval =
    !!tokenAddress && amount > 0n && (erc20Allowance === undefined || erc20Allowance < amount);

  const needsPermit2Approval =
    !!tokenAddress && amount > 0n && !needsErc20Approval && (permit2Allowance === undefined || permit2Allowance < amount);

  const { writeContract, data: hash, isPending, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: unichainSepolia.id,
  });

  // Refetch after confirmation
  if (isSuccess && hash) {
    refetchErc20();
    refetchPermit2();
  }

  function approveErc20() {
    if (!tokenAddress) return;
    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [permit2Address, MAX_UINT256],
      chainId: unichainSepolia.id,
    });
  }

  function approvePermit2() {
    if (!tokenAddress) return;
    const expiration = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
    writeContract({
      address: permit2Address,
      abi: permit2Abi,
      functionName: "approve",
      args: [tokenAddress, routerAddress, MAX_UINT160, expiration],
      chainId: unichainSepolia.id,
    });
  }

  return {
    needsErc20Approval,
    needsPermit2Approval,
    approveErc20,
    approvePermit2,
    isPending,
    isConfirming,
    reset,
  };
}
