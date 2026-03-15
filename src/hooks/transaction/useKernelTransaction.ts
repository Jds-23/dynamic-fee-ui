import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { Hex } from "viem";
import { useSmartAccount } from "@/hooks/useSmartAccount";

interface Call {
  to: Hex;
  data?: Hex;
  value?: bigint;
}

export interface TransactionCallbacks {
  onSuccess?: (hash: Hex) => void;
  onError?: (error: Error) => void;
}

interface UseKernelTransactionResult {
  send: (calls: Call[], options?: TransactionCallbacks) => void;
  hash: Hex | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | undefined;
  reset: () => void;
}

export function useKernelTransaction(
  chainId: number,
): UseKernelTransactionResult {
  const { getClient } = useSmartAccount();
  const [isConfirming, setIsConfirming] = useState(false);

  const mutation = useMutation<
    { hash: Hex },
    Error,
    { calls: Call[]; callbacks?: TransactionCallbacks }
  >({
    mutationFn: async ({ calls }) => {
      const client = getClient(chainId);
      if (!client) {
        throw new Error("Smart account client not available");
      }

      const userOpHash = await client.sendUserOperation({
        callData: await client.account.encodeCalls(
          calls.map((c) => ({
            to: c.to,
            data: c.data ?? "0x",
            value: c.value ?? 0n,
          })),
        ),
      });

      setIsConfirming(true);

      const receipt = await client.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      return { hash: receipt.receipt.transactionHash };
    },
    onSuccess: (data, variables) => {
      setIsConfirming(false);
      variables.callbacks?.onSuccess?.(data.hash);
    },
    onError: (error, variables) => {
      setIsConfirming(false);
      variables.callbacks?.onError?.(error);
    },
    onSettled: () => {
      setIsConfirming(false);
    },
  });

  function send(calls: Call[], options?: TransactionCallbacks) {
    mutation.mutate({ calls, callbacks: options });
  }

  function reset() {
    setIsConfirming(false);
    mutation.reset();
  }

  return {
    send,
    hash: mutation.data?.hash,
    isPending: mutation.isPending,
    isConfirming,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? undefined,
    reset,
  };
}
