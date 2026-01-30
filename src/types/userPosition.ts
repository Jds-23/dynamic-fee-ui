export interface AlchemyNFTImage {
  cachedUrl: string | null;
  originalUrl: string | null;
  pngUrl?: string | null;
  contentType?: string;
}

export interface AlchemyNFTContract {
  address: string;
  name?: string;
  symbol?: string;
  tokenType: string;
}

export interface AlchemyNFT {
  tokenId: string;
  name: string | null;
  description: string | null;
  image: AlchemyNFTImage;
  contract: AlchemyNFTContract;
  balance: string;
  timeLastUpdated: string;
}

export interface AlchemyNFTResponse {
  ownedNfts: AlchemyNFT[];
  totalCount: number;
  pageKey?: string;
}
