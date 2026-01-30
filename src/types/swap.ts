import type { Address } from "viem";

export interface SwapParams {
  tokenIn: Address;
  tokenOut: Address;
  amountIn: string;
  slippageTolerance: number; // bps (100 = 1%)
}

export interface SwapQuoteResult {
  amountOut: bigint;
  minimumAmountOut: bigint;
  priceImpact: number; // percentage
  executionPrice: string; // formatted price
}

export interface SwapConfig {
  poolKey: {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
  };
  zeroForOne: boolean;
  amountIn: bigint;
  amountOutMinimum: bigint;
  hookData: `0x${string}`;
}
