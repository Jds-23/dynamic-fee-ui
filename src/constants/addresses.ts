import type { Address } from "viem";
import { sepolia } from "wagmi/chains";

type ChainAddresses = {
  POOL_MANAGER: Address;
  POSITION_MANAGER: Address;
  STATE_VIEW: Address;
  PERMIT2: Address;
  UNIVERSAL_ROUTER: Address;
  FAUCET: Address;
};

// Uniswap V4 contract addresses for Sepolia testnet
export const ADDRESSES: Record<number, ChainAddresses> = {
  [sepolia.id]: {
    POOL_MANAGER: "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543",
    POSITION_MANAGER: "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4",
    STATE_VIEW: "0xe1dd9c3fa50edb962e442f60dfbc432e24537e4c",
    PERMIT2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    UNIVERSAL_ROUTER: "0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b",
    FAUCET: "0x55391a64c26c312FB57046474656959C37B08538",
  },
};

export function getAddress(
  chainId: number,
  contract: keyof ChainAddresses,
): Address {
  const addresses = ADDRESSES[chainId];
  if (!addresses) throw new Error(`Unsupported chain: ${chainId}`);
  return addresses[contract];
}
