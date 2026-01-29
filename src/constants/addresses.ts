import type { Address } from "viem";
import { arbitrum, base, mainnet, optimism } from "wagmi/chains";

type ChainAddresses = {
  POOL_MANAGER: Address;
  POSITION_MANAGER: Address;
  STATE_VIEW: Address;
  PERMIT2: Address;
  UNIVERSAL_ROUTER: Address;
};

// Uniswap V4 contract addresses by chain
// Note: Replace placeholder addresses with actual deployed addresses
export const ADDRESSES: Record<number, ChainAddresses> = {
  [mainnet.id]: {
    POOL_MANAGER: "0x000000000004444c5dc75cB358380D2e3dE08A90",
    POSITION_MANAGER: "0xbD216513d74C8cf14cf4747E6AaA6420FF64ee9e",
    STATE_VIEW: "0x7fFE42C4a5DEeA5b0feC41C94C136Cf115597227",
    PERMIT2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    UNIVERSAL_ROUTER: "0x66a9893cC07D91D95644AEDD05D03f95e1dBA8Af",
  },
  [arbitrum.id]: {
    POOL_MANAGER: "0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32",
    POSITION_MANAGER: "0xd88F38F930b7952f2DB2432Cb002E7abbF3dD869",
    STATE_VIEW: "0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990",
    PERMIT2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    UNIVERSAL_ROUTER: "0xA51afAFe0263b40EdaEf0Df8781eA9aa03E381a3",
  },
  [base.id]: {
    POOL_MANAGER: "0x498581fF718922c3f8e6A244956aF099B2652b2b",
    POSITION_MANAGER: "0x7C5f5A4bBd8fD63184577525326123B519429bDc",
    STATE_VIEW: "0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71",
    PERMIT2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    UNIVERSAL_ROUTER: "0x6fF5693b99212Da76ad316178A184AB56D299b43",
  },
  [optimism.id]: {
    POOL_MANAGER: "0x9a13F98Cb987694C9F086b1F5eB990EeA8264Ec3",
    POSITION_MANAGER: "0x3C3Ea4B57a46241e54610e5f022E5c45859A1017",
    STATE_VIEW: "0xc18a3169788f4D6B6548B23d84647f42238684BB",
    PERMIT2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    UNIVERSAL_ROUTER: "0x851116D9223fabED8E56C0E6b8Ad0c31d98B3507",
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
