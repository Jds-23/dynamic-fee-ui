import { ResolvePanel } from "@/components/market/ResolvePanel";
import { RedeemPanel } from "@/components/market/RedeemPanel";
import { useMarketList } from "@/hooks/market/useMarketList";
import { useMarketState } from "@/hooks/market/useMarketState";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";
import type { MarketCondition } from "@/types";

export function ResolutionSlideInfo() {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        Resolution
        <span className="block text-lg font-normal text-muted-foreground">
          Collapsing the Multiverse
        </span>
      </h2>
      <p className="text-sm text-muted-foreground">
        When the real-world outcome is known, an oracle calls{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
          resolve()
        </code>{" "}
        to collapse the multiverse down to a single timeline.
      </p>

      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono leading-relaxed">
{`resolve(conditionId, winner)
  → winning token redeems 1 : 1 for collateral
  → losing tokens become worthless`}
      </pre>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Example:</strong> A market asks
          "Who wins the 2024 election?" After the result is certified, the
          oracle resolves the market. Holders of the winning token redeem each
          token for 1 unit of collateral; the losing side receives nothing.
        </p>
        <p>
          All Uniswap V4 pool liquidity is withdrawn at resolution — no
          residual positions remain.
        </p>
      </div>

      <p className="border-t border-border/30 pt-3 text-xs italic text-muted-foreground">
        Inspired by the multiverse finance framework from Paradigm.
      </p>
    </div>
  );
}

export function ResolutionSlidePanel() {
  const { markets, isLoading } = useMarketList();
  const firstMarket = markets[0] ?? null;

  if (isLoading && markets.length === 0) {
    return (
      <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-8">
        <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!firstMarket) {
    return (
      <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-8">
        <p className="text-sm text-muted-foreground">No markets available</p>
      </div>
    );
  }

  return (
    <div className="min-h-[28rem] overflow-y-auto rounded-2xl border border-border/50 bg-card/30 p-6">
      <ResolutionSlideInner condition={firstMarket.condition} />
    </div>
  );
}

function ResolutionSlideInner({ condition }: { condition: MarketCondition }) {
  const market = useMarketState(condition);

  const winnerToken = market.isResolved && market.state
    ? market.resolvedOutcome === "YES"
      ? market.state.yesTokenAddress
      : market.state.noTokenAddress
    : undefined;

  const { balance: winnerBalance } = useTokenBalance(winnerToken);

  return (
    <div className="space-y-4">
      <ResolvePanel market={market} />
      {market.isResolved && winnerToken && market.resolvedOutcome && (
        <RedeemPanel
          resolvedOutcome={market.resolvedOutcome}
          winnerToken={winnerToken}
          winnerBalance={winnerBalance ?? 0n}
        />
      )}
    </div>
  );
}
