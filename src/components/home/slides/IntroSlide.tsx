export function MultiverseSlideInfo() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        What is Multiverse Finance?
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Prediction markets are a subset of a more general framework called{" "}
        <strong className="text-foreground">multiverse finance</strong> —
        financial instruments that let you take positions on mutually exclusive
        future states of the world.
      </p>
      <ul className="space-y-3 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            Each outcome spawns <strong className="text-foreground">parallel-universe tokens</strong>{" "}
            representing conditional claims on collateral.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            Traders hold <strong className="text-foreground">conditional positions</strong> —
            bundles of tokens whose value depends on which universe materialises.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            The framework generalises beyond binary markets to arbitrary
            outcome sets, combinatorial bets, and cross-condition swaps.
          </span>
        </li>
      </ul>
      <blockquote className="border-l-2 border-primary/40 pl-4 text-xs italic text-muted-foreground">
        "Multiverse finance is financial infrastructure for parallel
        universes."
        <br />
        — Dave White, Paradigm
      </blockquote>
    </div>
  );
}

export function MultiverseSlidePanel() {
  return (
    <div className="flex h-full min-h-[28rem] items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-8">
      <div className="flex h-64 w-full items-center justify-center rounded-xl bg-muted">
        <span className="text-sm text-muted-foreground">Image coming soon</span>
      </div>
    </div>
  );
}
