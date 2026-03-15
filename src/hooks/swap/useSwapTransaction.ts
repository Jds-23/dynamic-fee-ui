import { CommandType, RoutePlanner } from "@uniswap/universal-router-sdk";
import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { useCallback } from "react";
import type { Address, Hex } from "viem";
import { encodeAbiParameters, encodeFunctionData } from "viem";
import { useChainId } from "wagmi";
import { erc20Abi } from "@/abi/erc20";
import { getAddress } from "@/constants/addresses";
import { DEFAULT_DEADLINE_MINUTES } from "@/constants/defaults";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useKernelTransaction, type TransactionCallbacks } from "@/hooks/transaction/useKernelTransaction";
import type { PoolKey } from "@/types";

interface UseSwapTransactionParams {
  poolKey: PoolKey | undefined;
  tokenIn: Address | undefined;
  zeroForOne: boolean;
  amountIn: bigint;
  amountOutMinimum: bigint;
}

export function useSwapTransaction({
  poolKey,
  tokenIn,
  zeroForOne,
  amountIn,
  amountOutMinimum,
}: UseSwapTransactionParams) {
  const { address: recipient } = useSmartAccount();
  const chainId = useChainId();
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(chainId);

  let universalRouterAddress: `0x${string}` | undefined;
  try {
    universalRouterAddress = getAddress(chainId, "UNIVERSAL_ROUTER");
  } catch {
    // Chain not supported
  }

  const swap = useCallback((options?: TransactionCallbacks) => {
    if (
      !poolKey ||
      !tokenIn ||
      !recipient ||
      !universalRouterAddress ||
      amountIn === 0n ||
      amountOutMinimum === 0n
    ) {
      console.error("Missing required parameters for swap");
      return;
    }

    try {
      const deadline = BigInt(
        Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_MINUTES * 60,
      );

      const v4Planner = new V4Planner();
      const routePlanner = new RoutePlanner();

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

      v4Planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [swapConfig]);

      const currencyIn = zeroForOne ? poolKey.currency0 : poolKey.currency1;
      v4Planner.addAction(Actions.SETTLE, [currencyIn, amountIn.toString(), false]);

      const currencyOut = zeroForOne ? poolKey.currency1 : poolKey.currency0;
      v4Planner.addAction(Actions.TAKE_ALL, [currencyOut, amountOutMinimum.toString()]);

      const encodedActions = v4Planner.finalize();

      routePlanner.addCommand(CommandType.V4_SWAP, [
        v4Planner.actions,
        v4Planner.params,
      ]);

      const commands = routePlanner.commands;
      const inputs = [encodedActions];

      const calldata = encodeAbiParameters(
        [
          { type: "bytes", name: "commands" },
          { type: "bytes[]", name: "inputs" },
          { type: "uint256", name: "deadline" },
        ],
        [commands as Hex, inputs as Hex[], deadline],
      );

      const functionSelector = "0x3593564c" as Hex;
      const fullCalldata = (functionSelector + calldata.slice(2)) as Hex;

      const transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [universalRouterAddress, amountIn],
      });

      send([
        { to: tokenIn, data: transferData, value: 0n },
        { to: universalRouterAddress, data: fullCalldata, value: 0n },
      ], options);
    } catch (error) {
      console.error("Error preparing swap transaction:", error);
    }
  }, [
    poolKey,
    tokenIn,
    recipient,
    zeroForOne,
    amountIn,
    amountOutMinimum,
    universalRouterAddress,
    send,
  ]);

  return { swap, hash, isPending, isConfirming, isSuccess, error, reset };
}
