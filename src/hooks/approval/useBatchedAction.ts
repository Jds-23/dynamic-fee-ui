import { useCallback } from "react";
import type { Address, Hex } from "viem";
import { encodeFunctionData } from "viem";
import { useReadContract } from "wagmi";
import { erc20Abi } from "@/abi/erc20";
import { permit2Abi } from "@/abi/permit2";
import { MAX_UINT160, MAX_UINT256 } from "@/constants/defaults";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useKernelTransaction, type TransactionCallbacks } from "@/hooks/transaction/useKernelTransaction";

interface UseBatchedActionParams {
  chainId: number;
  tokenAddress?: Address;
  permit2Address?: Address;
  targetAddress?: Address;
  amount: bigint;
}

export function useBatchedAction({
  chainId,
  tokenAddress,
  permit2Address,
  targetAddress,
  amount,
}: UseBatchedActionParams) {
  const { address } = useSmartAccount();
  const tx = useKernelTransaction(chainId);

  // ERC20 allowance to Permit2
  const { data: erc20Allowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && permit2Address ? [address, permit2Address] : undefined,
    chainId,
    query: { enabled: !!tokenAddress && !!address && !!permit2Address },
  });

  // Permit2 allowance to target
  const { data: permit2Data } = useReadContract({
    address: permit2Address,
    abi: permit2Abi,
    functionName: "allowance",
    args: address && tokenAddress && targetAddress ? [address, tokenAddress, targetAddress] : undefined,
    chainId,
    query: { enabled: !!permit2Address && !!tokenAddress && !!targetAddress && !!address },
  });
  const permit2Allowance = permit2Data?.[0];

  const buildApprovalCalls = useCallback((): { to: Hex; data: Hex; value?: bigint }[] => {
    const calls: { to: Hex; data: Hex; value?: bigint }[] = [];
    if (!tokenAddress || !permit2Address || !targetAddress || amount === 0n) return calls;

    // ERC20 → Permit2 approval
    if (erc20Allowance === undefined || erc20Allowance < amount) {
      calls.push({
        to: tokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [permit2Address, MAX_UINT256],
        }),
      });
    }

    // Permit2 → target approval
    if (permit2Allowance === undefined || permit2Allowance < amount) {
      const expiration = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      calls.push({
        to: permit2Address,
        data: encodeFunctionData({
          abi: permit2Abi,
          functionName: "approve",
          args: [tokenAddress, targetAddress, MAX_UINT160, expiration],
        }),
      });
    }

    return calls;
  }, [tokenAddress, permit2Address, targetAddress, amount, erc20Allowance, permit2Allowance]);

  const sendWithApprovals = useCallback(
    (actionCalls: { to: Hex; data?: Hex; value?: bigint }[], options?: TransactionCallbacks) => {
      const approvalCalls = buildApprovalCalls();
      tx.send([...approvalCalls, ...actionCalls], options);
    },
    [buildApprovalCalls, tx],
  );

  return {
    sendWithApprovals,
    hash: tx.hash,
    isPending: tx.isPending,
    isConfirming: tx.isConfirming,
    isSuccess: tx.isSuccess,
    error: tx.error,
    reset: tx.reset,
  };
}
