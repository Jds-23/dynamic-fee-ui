export const multiverseMarketsAbi = [
  {
    type: "function",
    name: "universes",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [
      { name: "collateralToken", type: "address" },
      { name: "yesToken", type: "address" },
      { name: "noToken", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createMarket",
    inputs: [
      { name: "universeId", type: "bytes32" },
      { name: "collateralToken", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "split",
    inputs: [
      { name: "universeId", type: "bytes32" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "merge",
    inputs: [
      { name: "universeId", type: "bytes32" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeem",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolve",
    inputs: [
      { name: "universeId", type: "bytes32" },
      { name: "winner", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolved",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenUniverse",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "collateralBalances",
    inputs: [
      { name: "", type: "bytes32" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creatorOf",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;
