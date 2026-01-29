import type { Address } from "viem";

export interface PoolKey {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}

export interface PoolState {
  poolId: Address;
  sqrtPriceX96: bigint;
  tick: number;
  protocolFee: number;
  lpFee: number;
  liquidity: bigint;
}

export interface PoolConfig {
  token0: Address;
  token1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}
