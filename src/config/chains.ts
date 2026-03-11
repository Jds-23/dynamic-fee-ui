import { sepolia, unichainSepolia } from "wagmi/chains";

export const supportedChains = [sepolia, unichainSepolia] as const;

export type SupportedChainId = (typeof supportedChains)[number]["id"];
