import { sepolia } from "wagmi/chains";
import type { AlchemyNFTResponse } from "@/types/userPosition";

const ALCHEMY_CHAIN_SUBDOMAINS: Record<number, string> = {
  [sepolia.id]: "eth-sepolia",
};

export function getAlchemyBaseUrl(chainId: number): string | null {
  const subdomain = ALCHEMY_CHAIN_SUBDOMAINS[chainId];
  if (!subdomain) return null;

  const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
  if (!apiKey) return null;

  return `https://${subdomain}.g.alchemy.com/nft/v3/${apiKey}`;
}

export interface FetchNFTsParams {
  owner: string;
  contractAddress: string;
  chainId: number;
  pageKey?: string;
}

export async function fetchNFTsForOwner(
  params: FetchNFTsParams,
): Promise<AlchemyNFTResponse> {
  const { owner, contractAddress, chainId, pageKey } = params;

  const baseUrl = getAlchemyBaseUrl(chainId);
  if (!baseUrl) {
    throw new Error(
      chainId in ALCHEMY_CHAIN_SUBDOMAINS
        ? "Alchemy API key not configured. Please add VITE_ALCHEMY_API_KEY to your .env file."
        : `Chain ${chainId} is not supported for Alchemy NFT API`,
    );
  }

  const url = new URL(`${baseUrl}/getNFTsForOwner`);
  url.searchParams.set("owner", owner);
  url.searchParams.append("contractAddresses[]", contractAddress);
  url.searchParams.set("withMetadata", "true");
  if (pageKey) {
    url.searchParams.set("pageKey", pageKey);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Alchemy API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
