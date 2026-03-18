import type { Address } from "viem";
import { keccak256, toBytes, toHex } from "viem";
import { PM_POOL_CONFIG } from "@/constants/markets";
import { sortTokens } from "@/lib/poolId";
import type { PoolKey } from "@/types";

export function computeUniverseId(question: string): `0x${string}` {
  return keccak256(toBytes(question));
}

export function randomUniverseId(): `0x${string}` {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

export function buildMarketPoolKey(
  collateral: Address,
  outcomeToken: Address,
  hookAddr: Address,
): PoolKey {
  const [currency0, currency1] = sortTokens(collateral, outcomeToken);
  return {
    currency0,
    currency1,
    fee: PM_POOL_CONFIG.fee,
    tickSpacing: PM_POOL_CONFIG.tickSpacing,
    hooks: hookAddr,
  };
}

export function wadToProb(wadPrice: bigint): number {
  return Number(wadPrice) / 1e18;
}

export function formatProbability(prob: number): string {
  return `${(prob * 100).toFixed(1)}%`;
}
