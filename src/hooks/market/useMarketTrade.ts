import { CommandType, RoutePlanner } from "@uniswap/universal-router-sdk";
import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { useCallback } from "react";
import type { Hex } from "viem";
import { encodeAbiParameters, encodeFunctionData } from "viem";
import { unichainSepolia } from "wagmi/chains";
import { erc20Abi } from "@/abi/erc20";
import { DEFAULT_DEADLINE_MINUTES } from "@/constants/defaults";
import { PM_CONTRACTS } from "@/constants/markets";
import {
  type TransactionCallbacks,
  useKernelTransaction,
} from "@/hooks/transaction/useKernelTransaction";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { buildMarketPoolKey } from "@/lib/market";
import type { MarketWithPrices } from "@/types";

interface UseMarketTradeParams {
  market: MarketWithPrices;
  side: "YES" | "NO";
  direction: "buy" | "sell";
  amountIn: bigint;
  minAmountOut: bigint;
}

export function useMarketTrade({
  market,
  side,
  direction,
  amountIn,
  minAmountOut,
}: UseMarketTradeParams) {
  const { address } = useSmartAccount();
  const { send, hash, isPending, isConfirming, isSuccess, error, reset } =
    useKernelTransaction(unichainSepolia.id);

  const buildCalls = useCallback(():
    | { to: Hex; data: Hex; value: bigint }[]
    | null => {
    if (!market.state || !address || amountIn === 0n || minAmountOut === 0n)
      return null;

    const outcomeToken =
      side === "YES"
        ? market.state.yesTokenAddress
        : market.state.noTokenAddress;
    const collateral = market.state.collateralAddress;

    const inputToken = direction === "buy" ? collateral : outcomeToken;
    const poolKey = buildMarketPoolKey(
      collateral,
      outcomeToken,
      PM_CONTRACTS.multiverseHook,
    );

    const zeroForOne =
      inputToken.toLowerCase() === poolKey.currency0.toLowerCase();

    const deadline = BigInt(
      Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_MINUTES * 60,
    );

    const v4Planner = new V4Planner();
    const routePlanner = new RoutePlanner();

    v4Planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
      {
        poolKey: {
          currency0: poolKey.currency0,
          currency1: poolKey.currency1,
          fee: poolKey.fee,
          tickSpacing: poolKey.tickSpacing,
          hooks: poolKey.hooks,
        },
        zeroForOne,
        amountIn: amountIn.toString(),
        amountOutMinimum: minAmountOut.toString(),
        hookData: "0x" as const,
      },
    ]);

    const currencyIn = zeroForOne ? poolKey.currency0 : poolKey.currency1;
    v4Planner.addAction(Actions.SETTLE, [
      currencyIn,
      amountIn.toString(),
      false,
    ]);

    const currencyOut = zeroForOne ? poolKey.currency1 : poolKey.currency0;
    v4Planner.addAction(Actions.TAKE_ALL, [
      currencyOut,
      minAmountOut.toString(),
    ]);

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
      args: [PM_CONTRACTS.universalRouter, amountIn],
    });

    return [
      { to: inputToken as Hex, data: transferData, value: 0n },
      { to: PM_CONTRACTS.universalRouter, data: fullCalldata, value: 0n },
    ];
  }, [market.state, address, side, direction, amountIn, minAmountOut]);

  const trade = useCallback(
    (options?: TransactionCallbacks) => {
      const calls = buildCalls();
      if (calls) send(calls, options);
    },
    [buildCalls, send],
  );

  return {
    trade,
    buildCalls,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
