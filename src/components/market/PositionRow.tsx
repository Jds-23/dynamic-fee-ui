import { formatUnits } from "viem";
import { Button } from "@/components/ui/Button";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { TUSD } from "@/constants/markets";
import type { PortfolioPosition } from "@/hooks/market/usePortfolio";

interface PositionRowProps {
  position: PortfolioPosition;
  onRedeem?: () => void;
}

export function PositionRow({ position, onRedeem }: PositionRowProps) {
  const { market, yesBalance, noBalance, yesValue, noValue, redeemable } = position;
  const decimals = TUSD.decimals;

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{market.condition.question}</h3>
        <MarketStatusBadge
          isResolved={market.isResolved}
          resolvedOutcome={market.resolvedOutcome}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <div className="text-muted-foreground">YES</div>
          <div className="font-mono">{formatUnits(yesBalance, decimals)}</div>
          <div className="text-xs text-muted-foreground">
            ~{formatUnits(yesValue, decimals)} {TUSD.symbol}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground">NO</div>
          <div className="font-mono">{formatUnits(noBalance, decimals)}</div>
          <div className="text-xs text-muted-foreground">
            ~{formatUnits(noValue, decimals)} {TUSD.symbol}
          </div>
        </div>
      </div>

      {redeemable && onRedeem && (
        <Button size="sm" className="w-full" onClick={onRedeem}>
          Redeem
        </Button>
      )}
    </div>
  );
}
