import type { Address } from "viem";

export interface TokenData {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}
