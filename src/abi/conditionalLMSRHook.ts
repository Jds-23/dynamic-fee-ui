export const conditionalLMSRHookAbi = [
  {
    type: "function",
    name: "calcMarginalPrice",
    inputs: [
      { name: "conditionId", type: "bytes32" },
      { name: "token", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "markets",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [
      { name: "collateralToken", type: "address" },
      { name: "yesToken", type: "address" },
      { name: "noToken", type: "address" },
      { name: "funding", type: "uint256" },
      { name: "reserveYes", type: "uint256" },
      { name: "reserveNo", type: "uint256" },
      { name: "reserveCollateral", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenToCondition",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
] as const;
