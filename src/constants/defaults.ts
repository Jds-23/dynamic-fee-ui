// Dynamic fee pool configuration for Sepolia
// Fee 0x800000 (8388608) is the dynamic fee flag in Uniswap V4
export const DEFAULT_POOL = {
  fee: 0x800000,
  tickSpacing: 120,
  hooks: "0x9A411c87d79059d99ebB1F229289593713Ace080" as const,
};

// Dynamic fee - no selectable fee tiers
export const FEE_TIERS = [
  { fee: 0x800000, tickSpacing: 120, label: "Dynamic Fee" },
] as const;

export const TICK_RANGE_FULL = {
  tickLower: -887220,
  tickUpper: 887220,
};

export const DEFAULT_SLIPPAGE_TOLERANCE = 100; // 1% in bps
export const DEFAULT_DEADLINE_MINUTES = 20;

export const MAX_UINT160 = 2n ** 160n - 1n;
export const MAX_UINT256 = 2n ** 256n - 1n;
