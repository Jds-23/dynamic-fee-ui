import { Percent } from "@uniswap/sdk-core";
import type { Position } from "@uniswap/v4-sdk";
import { V4PositionManager } from "@uniswap/v4-sdk";
import { useCallback } from "react";
import type { Hex } from "viem";
import {
  useAccount,
  useChainId,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { getAddress } from "@/constants/addresses";
import { DEFAULT_DEADLINE_MINUTES } from "@/constants/defaults";

interface UseMintPositionParams {
  position?: Position;
  slippageTolerance: number; // In bps (100 = 1%)
}

export function useMintPosition({
  position,
  slippageTolerance,
}: UseMintPositionParams) {
  const { address: recipient } = useAccount();
  const chainId = useChainId();

  let positionManagerAddress: `0x${string}` | undefined;
  try {
    positionManagerAddress = getAddress(chainId, "POSITION_MANAGER");
  } catch {
    // Chain not supported
  }

  const {
    sendTransaction,
    data: hash,
    isPending,
    error: sendError,
    reset,
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  const mint = useCallback(() => {
    if (!position || !recipient || !positionManagerAddress) {
      console.error("Missing required parameters for mint");
      return;
    }

    try {
      // Calculate deadline (current time + minutes)
      const deadline = BigInt(
        Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_MINUTES * 60,
      );

      // Generate calldata using SDK
      const { calldata, value } = V4PositionManager.addCallParameters(
        position,
        {
          slippageTolerance: new Percent(slippageTolerance, 10000),
          deadline: deadline.toString(),
          recipient,
        },
      );

      // Send transaction
      sendTransaction({
        to: positionManagerAddress,
        data: calldata as Hex,
        value: BigInt(value),
      });
    } catch (error) {
      console.error("Error preparing mint transaction:", error);
    }
  }, [
    position,
    recipient,
    slippageTolerance,
    positionManagerAddress,
    sendTransaction,
  ]);

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: sendError || confirmError,
    reset,
  };
}
