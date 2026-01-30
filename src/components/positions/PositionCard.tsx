import { useChainId } from "wagmi";
import { Card, CardContent } from "@/components/ui/Card";
import type { AlchemyNFT } from "@/types/userPosition";

interface PositionCardProps {
  position: AlchemyNFT;
}

function getEtherscanUrl(
  chainId: number,
  tokenId: string,
  contractAddress: string,
): string {
  const baseUrl =
    chainId === 11155111
      ? "https://sepolia.etherscan.io"
      : "https://etherscan.io";
  return `${baseUrl}/nft/${contractAddress}/${tokenId}`;
}

export function PositionCard({ position }: PositionCardProps) {
  const chainId = useChainId();
  const imageUrl = position.image.cachedUrl ?? position.image.originalUrl;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-square w-full bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={position.name ?? `Position #${position.tokenId}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3
          className="truncate text-sm font-medium"
          title={position.name ?? undefined}
        >
          {position.name ?? `Position #${position.tokenId}`}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Token ID: {position.tokenId}
        </p>
        <a
          href={getEtherscanUrl(
            chainId,
            position.tokenId,
            position.contract.address,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-primary hover:underline"
        >
          View on Etherscan
        </a>
      </CardContent>
    </Card>
  );
}
