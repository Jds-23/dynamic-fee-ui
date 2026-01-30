import type { Address } from "viem";
import { sepolia } from "wagmi/chains";
import type { TokenData } from "@/types";

// Mock tokens for Sepolia testnet
export const COMMON_TOKENS: Record<number, TokenData[]> = {
  [sepolia.id]: [
    {
      address: "0x8b539520813d25d0abe46619533b184e2d0872c4" as Address,
      symbol: "mUSDT",
      name: "Mock USDT",
      decimals: 18,
    },
    {
      address: "0x95Bedf99Febf2E290C53E1DA16E12eA5FB90c88F" as Address,
      symbol: "mUSDC",
      name: "Mock USDC",
      decimals: 18,
    },
  ],
};
