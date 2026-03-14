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
  return (
    <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-8">
      <p className="text-sm text-muted-foreground">Coming soon</p>
    </div>
  );
}
