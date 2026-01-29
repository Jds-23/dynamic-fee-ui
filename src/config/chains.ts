import { arbitrum, base, mainnet, optimism } from "wagmi/chains";

export const supportedChains = [arbitrum, base, mainnet, optimism] as const;

export type SupportedChainId = (typeof supportedChains)[number]["id"];
