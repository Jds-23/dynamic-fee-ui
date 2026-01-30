import { sepolia } from "wagmi/chains";

export function getExplorerTxUrl(hash: string, _chainId?: number): string {
  // For now, default to Sepolia
  const chain = sepolia;
  return `${chain.blockExplorers.default.url}/tx/${hash}`;
}
