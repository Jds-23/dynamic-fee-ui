import type { Address } from "viem";
import type { TokenData } from "@/types";

// Unichain Sepolia (chain 1301) contract addresses
export const PM_CONTRACTS = {
  multiverseMarkets: "0x06fb682A2C6B52e090D2b66621c05494FBb67083" as Address,
  multiverseHook: "0x021823d2B63455fbE66B08a34475Aae8A0ae4A88" as Address,
  universalRouter: "0xf70536B3bcC1bD1a972dc186A2cf84cC6da6Be5D" as Address,
  poolManager: "0x00B036B58a818B1BC34d502D3fE730Db729e62AC" as Address,
  permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3" as Address,
} as const;

export const PM_POOL_CONFIG = {
  fee: 0,
  tickSpacing: 60,
} as const;

export const TUSD: TokenData = {
  address: "0x71fd10Fe172Dd0f5629f7419fB9F2638A240D3e4" as Address,
  symbol: "TUSD",
  name: "Test USD",
  decimals: 6,
};
