import { Token } from "@uniswap/sdk-core";
import { Pool, Position } from "@uniswap/v4-sdk";
import { useMemo } from "react";
import type { Address } from "viem";

interface UsePositionParams {
  chainId: number;
  token0: { address: Address; decimals: number; symbol?: string } | undefined;
  token1: { address: Address; decimals: number; symbol?: string } | undefined;
  fee: number;
  tickSpacing: number;
  hooks: Address;
  sqrtPriceX96: bigint;
  liquidity: bigint;
  tick: number;
  tickLower: number;
  tickUpper: number;
  amount0: string;
  amount1: string;
  activeInput: "token0" | "token1" | null;
}

interface PositionResult {
  position: Position;
  pool: Pool;
  amount0: bigint;
  amount1: bigint;
  liquidity: bigint;
}

export function usePosition(
  params: UsePositionParams,
): PositionResult | undefined {
  const {
    chainId,
    token0,
    token1,
    fee,
    tickSpacing,
    hooks,
    sqrtPriceX96,
    liquidity,
    tick,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    activeInput,
  } = params;

  return useMemo(() => {
    if (!token0 || !token1 || sqrtPriceX96 === 0n) {
      return undefined;
    }

    try {
      // Create SDK Token instances
      const currency0 = new Token(
        chainId,
        token0.address,
        token0.decimals,
        token0.symbol,
      );
      const currency1 = new Token(
        chainId,
        token1.address,
        token1.decimals,
        token1.symbol,
      );

      // Create Pool instance
      const pool = new Pool(
        currency0,
        currency1,
        fee,
        tickSpacing,
        hooks,
        sqrtPriceX96,
        liquidity,
        tick,
      );

      // Create Position based on which input is active
      let position: Position;

      if (activeInput === "token0" && amount0 && amount0 !== "0") {
        const parsedAmount = parseAmount(amount0, token0.decimals);
        if (parsedAmount === 0n) return undefined;

        position = Position.fromAmount0({
          pool,
          tickLower,
          tickUpper,
          amount0: parsedAmount,
          useFullPrecision: true,
        });
      } else if (activeInput === "token1" && amount1 && amount1 !== "0") {
        const parsedAmount = parseAmount(amount1, token1.decimals);
        if (parsedAmount === 0n) return undefined;

        position = Position.fromAmount1({
          pool,
          tickLower,
          tickUpper,
          amount1: parsedAmount,
        });
      } else {
        return undefined;
      }

      return {
        position,
        pool,
        amount0: BigInt(position.amount0.quotient.toString()),
        amount1: BigInt(position.amount1.quotient.toString()),
        liquidity: BigInt(position.liquidity.toString()),
      };
    } catch (error) {
      console.error("Error creating position:", error);
      return undefined;
    }
  }, [
    chainId,
    token0,
    token1,
    fee,
    tickSpacing,
    hooks,
    sqrtPriceX96,
    liquidity,
    tick,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    activeInput,
  ]);
}

/**
 * Parse a decimal string amount to bigint with given decimals
 */
function parseAmount(amount: string, decimals: number): bigint {
  try {
    const [whole, fraction = ""] = amount.split(".");
    const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
    const combined = (whole || "0") + paddedFraction;
    return BigInt(combined);
  } catch {
    return 0n;
  }
}
