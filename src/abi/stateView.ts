export const stateViewAbi = [
  {
    type: "function",
    name: "getSlot0",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "protocolFee", type: "uint24" },
      { name: "lpFee", type: "uint24" },
    ],
  },
  {
    type: "function",
    name: "getLiquidity",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [{ name: "liquidity", type: "uint128" }],
  },
  {
    type: "function",
    name: "getPositionInfo",
    stateMutability: "view",
    inputs: [
      { name: "poolId", type: "bytes32" },
      { name: "positionId", type: "bytes32" },
    ],
    outputs: [
      { name: "liquidity", type: "uint128" },
      { name: "feeGrowthInside0LastX128", type: "uint256" },
      { name: "feeGrowthInside1LastX128", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "getTickInfo",
    stateMutability: "view",
    inputs: [
      { name: "poolId", type: "bytes32" },
      { name: "tick", type: "int24" },
    ],
    outputs: [
      { name: "liquidityGross", type: "uint128" },
      { name: "liquidityNet", type: "int128" },
      { name: "feeGrowthOutside0X128", type: "uint256" },
      { name: "feeGrowthOutside1X128", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "getTickBitmap",
    stateMutability: "view",
    inputs: [
      { name: "poolId", type: "bytes32" },
      { name: "tick", type: "int16" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getFeeGrowthGlobals",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [
      { name: "feeGrowthGlobal0", type: "uint256" },
      { name: "feeGrowthGlobal1", type: "uint256" },
    ],
  },
] as const;
