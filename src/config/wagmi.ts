import { createConfig, http } from "wagmi";
import { sepolia, unichainSepolia } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [sepolia, unichainSepolia],
  transports: {
    [sepolia.id]: http(),
    [unichainSepolia.id]: http(),
  },
});
