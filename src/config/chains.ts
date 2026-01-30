import { sepolia } from "wagmi/chains";

export const supportedChains = [sepolia] as const;

export type SupportedChainId = (typeof supportedChains)[number]["id"];
