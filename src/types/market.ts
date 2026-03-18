import type { Address } from "viem";

export interface MarketUniverse {
  universeId: `0x${string}`;
  question: string;
  collateralAddress: Address;
}

export interface MarketState {
  universeId: `0x${string}`;
  collateralAddress: Address;
  yesTokenAddress: Address;
  noTokenAddress: Address;
  reserveYes: bigint;
  reserveNo: bigint;
  reserveCollateral: bigint;
  funding: bigint;
  resolved: Address; // address(0) if unresolved, winner token address if resolved
}

export interface MarketWithPrices {
  universe: MarketUniverse;
  state: MarketState | null;
  yesProb: number | null;
  noProb: number | null;
  isResolved: boolean;
  resolvedOutcome: "YES" | "NO" | null;
}
