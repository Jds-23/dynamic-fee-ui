import { useState } from "react";
import { PositionRow } from "@/components/market/PositionRow";
import { RedeemPanel } from "@/components/market/RedeemPanel";
import type { PortfolioPosition } from "@/hooks/market/usePortfolio";
import { usePortfolio } from "@/hooks/market/usePortfolio";
import { useSmartAccount } from "@/hooks/useSmartAccount";

export function PortfolioPage() {
  const { isConnected } = useSmartAccount();
  const { positions, isLoading } = usePortfolio();
  const [redeemPosition, setRedeemPosition] =
    useState<PortfolioPosition | null>(null);

  if (!isConnected) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Initializing...
      </div>
    );
  }

  if (isLoading && positions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading positions...
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Portfolio</h1>

      {positions.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No positions found.
        </div>
      ) : (
        <div className="mx-auto max-w-lg space-y-4">
          {positions.map((pos) => (
            <PositionRow
              key={pos.market.universe.universeId}
              position={pos}
              onRedeem={
                pos.redeemable ? () => setRedeemPosition(pos) : undefined
              }
            />
          ))}
        </div>
      )}

      {redeemPosition?.winnerToken && (
        <div className="mx-auto mt-6 max-w-lg">
          <RedeemPanel
            resolvedOutcome={
              redeemPosition.market.resolvedOutcome as "YES" | "NO"
            }
            winnerToken={redeemPosition.winnerToken}
            winnerBalance={redeemPosition.winnerBalance}
          />
        </div>
      )}
    </div>
  );
}
