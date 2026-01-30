import { CommandType, RoutePlanner } from "@uniswap/universal-router-sdk";
import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { useCallback } from "react";
import type { Address, Hex } from "viem";
import { encodeAbiParameters } from "viem";
import {
  useAccount,
  useChainId,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { getAddress } from "@/constants/addresses";
import { DEFAULT_DEADLINE_MINUTES } from "@/constants/defaults";
import type { PoolKey } from "@/types";

interface UseSwapTransactionParams {
  poolKey: PoolKey | undefined;
  zeroForOne: boolean;
  amountIn: bigint;
  amountOutMinimum: bigint;
}

export function useSwapTransaction({
  poolKey,
  zeroForOne,
  amountIn,
  amountOutMinimum,
}: UseSwapTransactionParams) {
  const { address: recipient } = useAccount();
  const chainId = useChainId();

  let universalRouterAddress: Address | undefined;
  try {
    universalRouterAddress = getAddress(chainId, "UNIVERSAL_ROUTER");
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

  const swap = useCallback(() => {
    if (
      !poolKey ||
      !recipient ||
      !universalRouterAddress ||
      amountIn === 0n ||
      amountOutMinimum === 0n
    ) {
      console.error("Missing required parameters for swap");
      return;
    }

    try {
      // Calculate deadline
      const deadline = BigInt(
        Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_MINUTES * 60,
      );

      // Create V4 planner for the swap
      const v4Planner = new V4Planner();
      const routePlanner = new RoutePlanner();

      // Configure the swap
      const swapConfig = {
        poolKey: {
          currency0: poolKey.currency0,
          currency1: poolKey.currency1,
          fee: poolKey.fee,
          tickSpacing: poolKey.tickSpacing,
          hooks: poolKey.hooks,
        },
        zeroForOne,
        amountIn: amountIn.toString(),
        amountOutMinimum: amountOutMinimum.toString(),
        hookData: "0x" as const,
      };

      // Add swap action
      v4Planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [swapConfig]);

      // Settle input token
      const currencyIn = zeroForOne ? poolKey.currency0 : poolKey.currency1;
      v4Planner.addAction(Actions.SETTLE_ALL, [
        currencyIn,
        amountIn.toString(),
      ]);

      // Take output token
      const currencyOut = zeroForOne ? poolKey.currency1 : poolKey.currency0;
      v4Planner.addAction(Actions.TAKE_ALL, [
        currencyOut,
        amountOutMinimum.toString(),
      ]);

      // Finalize the V4 planner
      const encodedActions = v4Planner.finalize();

      // Add to route planner
      routePlanner.addCommand(CommandType.V4_SWAP, [
        v4Planner.actions,
        v4Planner.params,
      ]);

      // Encode the execute call
      const commands = routePlanner.commands;
      const inputs = [encodedActions];

      // Encode calldata manually since we're using sendTransaction
      const calldata = encodeAbiParameters(
        [
          { type: "bytes", name: "commands" },
          { type: "bytes[]", name: "inputs" },
          { type: "uint256", name: "deadline" },
        ],
        [commands as Hex, inputs as Hex[], deadline],
      );

      // Function selector for execute(bytes,bytes[],uint256)
      const functionSelector = "0x3593564c" as Hex;
      const fullCalldata = (functionSelector + calldata.slice(2)) as Hex;

      // Send transaction
      sendTransaction({
        to: universalRouterAddress,
        data: fullCalldata,
        value: 0n,
      });
    } catch (error) {
      console.error("Error preparing swap transaction:", error);
    }
  }, [
    poolKey,
    recipient,
    zeroForOne,
    amountIn,
    amountOutMinimum,
    universalRouterAddress,
    sendTransaction,
  ]);

  return {
    swap,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: sendError || confirmError,
    reset,
  };
}
