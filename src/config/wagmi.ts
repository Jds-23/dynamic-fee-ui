import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, unichainSepolia } from "wagmi/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo";

export const wagmiConfig = getDefaultConfig({
  appName: "Uniswap V4 UI",
  projectId,
  chains: [sepolia, unichainSepolia],
  ssr: false,
});
