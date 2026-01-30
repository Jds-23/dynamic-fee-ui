import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v4-sdk";
import { useMemo } from "react";
import type { Address } from "viem";
import type { SwapQuoteResult } from "@/types";

interface UseSwapQuoteParams {
  chainId: number;
  tokenIn: { address: Address; decimals: number; symbol?: string } | undefined;
  tokenOut: { address: Address; decimals: number; symbol?: string } | undefined;
  fee: number;
  tickSpacing: number;
  hooks: Address;
  sqrtPriceX96: bigint;
  liquidity: bigint;
  tick: number;
  amountIn: string;
  slippageTolerance: number; // bps (100 = 1%)
}

interface QuoteResult {
  quote: SwapQuoteResult | undefined;
  pool: Pool | undefined;
  zeroForOne: boolean;
}

/**
 * Parse a decimal string amount to bigint with given decimals
 */
function parseAmount(amount: string, decimals: number): bigint {
  try {
    if (!amount || amount === "0" || amount === "") return 0n;
    const [whole, fraction = ""] = amount.split(".");
    const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
    const combined = (whole || "0") + paddedFraction;
    return BigInt(combined);
  } catch {
    return 0n;
  }
}

export function useSwapQuote(params: UseSwapQuoteParams): QuoteResult {
  const {
    chainId,
    tokenIn,
    tokenOut,
    fee,
    tickSpacing,
    hooks,
    sqrtPriceX96,
    liquidity,
    tick,
    amountIn,
    slippageTolerance,
  } = params;

  return useMemo(() => {
    const emptyResult: QuoteResult = {
      quote: undefined,
      pool: undefined,
      zeroForOne: true,
    };

    if (!tokenIn || !tokenOut || sqrtPriceX96 === 0n || liquidity === 0n) {
      return emptyResult;
    }

    const parsedAmountIn = parseAmount(amountIn, tokenIn.decimals);
    if (parsedAmountIn === 0n) {
      return emptyResult;
    }

    try {
      // Create SDK Token instances
      const currencyIn = new Token(
        chainId,
        tokenIn.address,
        tokenIn.decimals,
        tokenIn.symbol,
      );
      const currencyOut = new Token(
        chainId,
        tokenOut.address,
        tokenOut.decimals,
        tokenOut.symbol,
      );

      // Determine token order for the pool (currency0 < currency1)
      const isToken0 =
        tokenIn.address.toLowerCase() < tokenOut.address.toLowerCase();
      const currency0 = isToken0 ? currencyIn : currencyOut;
      const currency1 = isToken0 ? currencyOut : currencyIn;
      const zeroForOne = isToken0;

      // Create Pool instance
      const pool = new Pool(
        currency0,
        currency1,
        fee,
        tickSpacing,
        hooks,
        sqrtPriceX96.toString(),
        liquidity.toString(),
        tick,
      );

      // For pools with hooks, getOutputAmount may not work directly
      // We'll calculate based on the pool's current price
      // This is a simplified calculation - for production, use the Quoter contract
      const priceRaw = zeroForOne
        ? pool.token0Price.toSignificant(18)
        : pool.token1Price.toSignificant(18);

      const priceNum = parseFloat(priceRaw);
      const amountInNum = parseFloat(amountIn);
      const amountOutNum = amountInNum * priceNum;

      // Apply a small fee impact estimate based on the pool fee
      const feePercent = fee / 1_000_000; // fee is in hundredths of a bip
      const amountOutAfterFee = amountOutNum * (1 - feePercent);

      // Convert back to bigint
      const amountOutBigInt = parseAmount(
        amountOutAfterFee.toFixed(tokenOut.decimals),
        tokenOut.decimals,
      );

      // Calculate minimum amount out with slippage
      const slippageMultiplier = 10000n - BigInt(slippageTolerance);
      const minimumAmountOut = (amountOutBigInt * slippageMultiplier) / 10000n;

      // Simple price impact estimate (0% for small amounts, increases with size)
      // In production, this would be calculated based on liquidity depth
      const priceImpact = 0.0;

      // Format execution price
      const executionPrice = `1 ${tokenIn.symbol || "Token"} = ${priceNum.toFixed(6)} ${tokenOut.symbol || "Token"}`;

      return {
        quote: {
          amountOut: amountOutBigInt,
          minimumAmountOut,
          priceImpact,
          executionPrice,
        },
        pool,
        zeroForOne,
      };
    } catch (error) {
      console.error("Error calculating swap quote:", error);
      return emptyResult;
    }
  }, [
    chainId,
    tokenIn,
    tokenOut,
    fee,
    tickSpacing,
    hooks,
    sqrtPriceX96,
    liquidity,
    tick,
    amountIn,
    slippageTolerance,
  ]);
}
