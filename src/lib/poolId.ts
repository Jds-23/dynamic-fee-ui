import type { Address } from "viem";
import { encodeAbiParameters, keccak256 } from "viem";
import type { PoolKey } from "@/types";

/**
 * Compute the pool ID from a pool key
 * Pool ID is keccak256 of the encoded pool key
 */
export function computePoolId(poolKey: PoolKey): `0x${string}` {
  const encoded = encodeAbiParameters(
    [
      { type: "address", name: "currency0" },
      { type: "address", name: "currency1" },
      { type: "uint24", name: "fee" },
      { type: "int24", name: "tickSpacing" },
      { type: "address", name: "hooks" },
    ],
    [
      poolKey.currency0,
      poolKey.currency1,
      poolKey.fee,
      poolKey.tickSpacing,
      poolKey.hooks,
    ],
  );

  return keccak256(encoded);
}

/**
 * Sort tokens to ensure currency0 < currency1
 */
export function sortTokens(
  tokenA: Address,
  tokenB: Address,
): [Address, Address] {
  return tokenA.toLowerCase() < tokenB.toLowerCase()
    ? [tokenA, tokenB]
    : [tokenB, tokenA];
}
