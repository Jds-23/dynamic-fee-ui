import { type Chain, sepolia, unichainSepolia } from "wagmi/chains";

const CHAINS_BY_ID: Record<number, Chain> = {
  [sepolia.id]: sepolia,
  [unichainSepolia.id]: unichainSepolia,
};

export function getExplorerTxUrl(hash: string, chainId?: number): string {
  const chain = chainId ? CHAINS_BY_ID[chainId] ?? sepolia : sepolia;
  const baseUrl = chain.blockExplorers?.default.url ?? "https://sepolia.etherscan.io";
  return `${baseUrl}/tx/${hash}`;
}
