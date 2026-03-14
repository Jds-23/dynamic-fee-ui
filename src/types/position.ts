export interface PositionConfig {
  tickLower: number;
  tickUpper: number;
  amount0: string;
  amount1: string;
}

export interface PositionPreview {
  liquidity: bigint;
  amount0: bigint;
  amount1: bigint;
  amount0Max: bigint;
  amount1Max: bigint;
}
