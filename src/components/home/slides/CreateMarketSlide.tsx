import { CreateMarketForm } from "@/components/market/CreateMarketForm";

export function CreateMarketSlideInfo() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        Create a Market
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Launch your own prediction market in seconds. Define a question,
        fund liquidity, and let others trade on the outcome.
      </p>
    </div>
  );
}

export function CreateMarketSlidePanel() {
  return (
    <div className="min-h-[28rem] overflow-y-auto rounded-2xl border border-border/50 bg-card/30 p-6">
      <CreateMarketForm />
    </div>
  );
}
