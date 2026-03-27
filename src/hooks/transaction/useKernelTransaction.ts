import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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

const MAX_RETRIES = 3;
const RETRY_DELAY_SECONDS = 3;

const RETRYABLE_ERRORS = [
  "Invalid Smart Account nonce used for User Operation.",
  "The Paymaster contract has not been deployed.",
];

function isRetryableError(error: Error): boolean {
  const msg = error.message ?? "";
  return RETRYABLE_ERRORS.some((e) => msg.includes(e));
}

interface UseKernelTransactionResult {
  send: (calls: Call[], options?: TransactionCallbacks) => void;
  hash: Hex | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | undefined;
  reset: () => void;
  retryCountdown: number;
  retryAttempt: number;
  isRetrying: boolean;
}

export function useKernelTransaction(
  chainId: number,
): UseKernelTransactionResult {
  const { getClient } = useSmartAccount();
  const [isConfirming, setIsConfirming] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [pendingRetry, setPendingRetry] = useState<{
    calls: Call[];
    callbacks?: TransactionCallbacks;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (retryCountdown <= 0) return;

    timerRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [retryCountdown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

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
      setRetryAttempt(0);
      setRetryCountdown(0);
      setPendingRetry(null);
      variables.callbacks?.onSuccess?.(data.hash);
    },
    onError: (error, variables) => {
      setIsConfirming(false);

      if (isRetryableError(error) && retryAttempt < MAX_RETRIES) {
        setRetryAttempt((prev) => prev + 1);
        setPendingRetry(variables);
        setRetryCountdown(RETRY_DELAY_SECONDS);
        return;
      }

      setRetryAttempt(0);
      variables.callbacks?.onError?.(error);
    },
    onSettled: () => {
      setIsConfirming(false);
    },
  });

  // Fire retry when countdown reaches 0
  useEffect(() => {
    if (retryCountdown === 0 && pendingRetry) {
      const args = pendingRetry;
      setPendingRetry(null);
      mutation.mutate(args);
    }
  }, [retryCountdown, pendingRetry]); // eslint-disable-line react-hooks/exhaustive-deps

  function send(calls: Call[], options?: TransactionCallbacks) {
    setRetryAttempt(0);
    setRetryCountdown(0);
    setPendingRetry(null);
    mutation.mutate({ calls, callbacks: options });
  }

  function reset() {
    setIsConfirming(false);
    setRetryAttempt(0);
    setRetryCountdown(0);
    setPendingRetry(null);
    mutation.reset();
  }

  const isRetryPending = retryCountdown > 0 || pendingRetry !== null;

  return {
    send,
    hash: mutation.data?.hash,
    isPending: mutation.isPending,
    isConfirming,
    isSuccess: mutation.isSuccess,
    error: isRetryPending ? undefined : (mutation.error ?? undefined),
    reset,
    retryCountdown,
    retryAttempt,
    isRetrying: isRetryPending || (retryAttempt > 0 && mutation.isPending),
  };
}
