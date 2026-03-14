import { Card, CardContent } from "@/components/ui/Card";
import { ProbabilityBar } from "@/components/market/ProbabilityBar";
import { useMarketList } from "@/hooks/market/useMarketList";

export function LMSRSlideInfo() {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        The LMSR
      </h2>
      <p className="text-sm text-muted-foreground">
        The{" "}
        <strong className="text-foreground">
          Logarithmic Market Scoring Rule
        </strong>{" "}
        is the cost function that prices every swap. It guarantees bounded loss
        for the market maker and smooth price discovery for traders.
      </p>

      <div className="rounded-lg bg-muted p-4 text-center font-mono text-sm leading-relaxed">
        C(q) = b · ln( Σ exp(qᵢ / b) )
      </div>

      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Marginal cost = probability.</strong>{" "}
            The derivative of the cost function with respect to each outcome
            gives its current market price, which sums to 1 across all outcomes.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            Buy pressure on YES <strong className="text-foreground">raises</strong>{" "}
            its price and <strong className="text-foreground">lowers</strong> NO
            — and vice versa.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            The <strong className="text-foreground">b</strong> parameter controls
            liquidity depth — a higher b means larger trades are needed to move
            the price.
          </span>
        </li>
      </ul>
    </div>
  );
}

export function LMSRSlidePanel() {
  return (
    <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-6">
      <LivePricePanel />
    </div>
  );
}

function LivePricePanel() {
  const { markets, isLoading } = useMarketList();
  const firstMarket = markets[0] ?? null;

  if (isLoading && markets.length === 0) {
    return <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />;
  }

  if (!firstMarket) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No markets yet — create one to see live prices.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          Live Probabilities
        </h3>
        <p className="text-lg font-semibold">
          {firstMarket.condition.question}
        </p>
        <ProbabilityBar
          yesProb={firstMarket.yesProb}
          noProb={firstMarket.noProb}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>YES</span>
          <span>NO</span>
        </div>
      </CardContent>
    </Card>
  );
}
