import { useCallback, useState } from "react";
import { RedeemPanel } from "@/components/market/RedeemPanel";
import { ResolvePanel } from "@/components/market/ResolvePanel";
import { useMarketList } from "@/hooks/market/useMarketList";
import { useMarketState } from "@/hooks/market/useMarketState";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";
import { retryRefetch } from "@/lib/retryRefetch";
import type { MarketUniverse } from "@/types";

export function ResolutionSlideInfo() {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        Step 3: Get Your Answer
        <span className="block text-lg font-normal text-muted-foreground">
          Resolution & Payout
        </span>
      </h2>
      <p className="text-sm text-muted-foreground">
        When the real-world outcome is known, the market resolves. Winners
        redeem their tokens 1:1 for collateral — losers get nothing. Clean and
        final.
      </p>

      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono leading-relaxed">
        {`resolve(universeId, winner)
  → winning token redeems 1 : 1 for collateral
  → losing tokens become worthless`}
      </pre>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">But you don't have to wait.</strong>{" "}
          The probability estimate is useful the moment trading begins. Check the
          live price at any time — that's your crowd-sourced forecast.
        </p>
        <p>
          <strong className="text-foreground">Your cost?</strong> At most, your
          initial subsidy. In practice, you often recover part of it through the
          spread as traders participate.
        </p>
      </div>

      <p className="border-t border-border/30 pt-3 text-xs italic text-muted-foreground">
        Built on the multiverse finance framework from Paradigm.
      </p>
    </div>
  );
}

export function ResolutionSlidePanel({
  universeId,
}: {
  universeId?: string;
}) {
  const { markets, isLoading } = useMarketList();
  const target = universeId
    ? markets.find((m) => m.universe.universeId === universeId)
    : markets[0];
  const firstMarket = target ?? null;

  if (isLoading && markets.length === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-4 lg:min-h-[28rem] lg:p-8">
        <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!firstMarket) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-4 lg:min-h-[28rem] lg:p-8">
        <p className="text-sm text-muted-foreground">No markets available</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 items-center justify-center overflow-y-auto rounded-2xl border border-border/50 bg-card/30 p-4 lg:min-h-[28rem] lg:p-6">
      <ResolutionSlideInner universe={firstMarket.universe} />
    </div>
  );
}

function ResolutionSlideInner({ universe }: { universe: MarketUniverse }) {
  const market = useMarketState(universe);
  const [optimisticOutcome, setOptimisticOutcome] = useState<
    "YES" | "NO" | null
  >(null);

  const onResolved = useCallback(
    (outcome: "YES" | "NO") => {
      setOptimisticOutcome(outcome);
      retryRefetch(() => market.refetch());
    },
    [market.refetch],
  );

  const resolvedOutcome = market.resolvedOutcome ?? optimisticOutcome;

  const winnerToken =
    resolvedOutcome && market.state
      ? resolvedOutcome === "YES"
        ? market.state.yesTokenAddress
        : market.state.noTokenAddress
      : undefined;

  const { balance: winnerBalance } = useTokenBalance(winnerToken);

  return (
    <div className="space-y-4 w-full">
      {!winnerToken && <ResolvePanel market={market} onResolved={onResolved} />}
      {resolvedOutcome && winnerToken && (
        <RedeemPanel
          resolvedOutcome={resolvedOutcome}
          winnerToken={winnerToken}
          winnerBalance={winnerBalance ?? 0n}
        />
      )}
    </div>
  );
}
