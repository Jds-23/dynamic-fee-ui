import { useCallback, useState } from "react";
import type { Hex } from "viem";
import { useSmartAccount } from "@/hooks/useSmartAccount";

interface Call {
  to: Hex;
  data?: Hex;
  value?: bigint;
}

interface UseKernelTransactionResult {
  send: (calls: Call[]) => void;
  hash: Hex | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | undefined;
  reset: () => void;
}

export function useKernelTransaction(chainId: number): UseKernelTransactionResult {
  const { getClient } = useSmartAccount();
  const [hash, setHash] = useState<Hex>();
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error>();

  const reset = useCallback(() => {
    setHash(undefined);
    setIsPending(false);
    setIsConfirming(false);
    setIsSuccess(false);
    setError(undefined);
  }, []);

  const send = useCallback(
    async (calls: Call[]) => {
      const client = getClient(chainId);
      if (!client) {
        setError(new Error("Smart account client not available"));
        return;
      }

      setIsPending(true);
      setError(undefined);
      setIsSuccess(false);
      setHash(undefined);

      try {
        const userOpHash = await client.sendUserOperation({
          callData: await client.account.encodeCalls(
            calls.map((c) => ({
              to: c.to,
              data: c.data ?? "0x",
              value: c.value ?? 0n,
            })),
          ),
        });

        setIsPending(false);
        setIsConfirming(true);

        const receipt = await client.waitForUserOperationReceipt({
          hash: userOpHash,
        });

        setHash(receipt.receipt.transactionHash);
        setIsConfirming(false);
        setIsSuccess(true);
      } catch (err) {
        setIsPending(false);
        setIsConfirming(false);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [chainId, getClient],
  );

  return { send, hash, isPending, isConfirming, isSuccess, error, reset };
}
