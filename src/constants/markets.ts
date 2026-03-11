import type { Address } from "viem";
import { keccak256, toBytes } from "viem";
import type { MarketCondition } from "@/types";
import type { TokenData } from "@/types";

// Unichain Sepolia (chain 1301) contract addresses
export const PM_CONTRACTS = {
  conditionalMarkets: "0x02035cC65763c755FEa322B4984f2678608AAAf8" as Address,
  conditionalLMSRHook: "0xA2b04282706Ea52B002EECc387C30b9348c1ca88" as Address,
  v4SwapRouter: "0x9cD2b0a732dd5e023a5539921e0FD1c30E198Dba" as Address,
  poolManager: "0x00B036B58a818B1BC34d502D3fE730Db729e62AC" as Address,
  permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3" as Address,
} as const;

export const PM_POOL_CONFIG = {
  fee: 0,
  tickSpacing: 60,
} as const;

export const TUSD: TokenData = {
  address: "0x0E23213E046b8B3fa4ec8B41A4726231A7C47320" as Address,
  symbol: "TUSD",
  name: "Test USD",
  decimals: 6,
};

export const MARKETS: MarketCondition[] = [
  {
    conditionId: keccak256(toBytes("test-market-1")),
    question: "test-market-1",
    collateralAddress: TUSD.address,
  },
];
