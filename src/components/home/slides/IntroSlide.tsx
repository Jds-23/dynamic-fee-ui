export function MultiverseSlideInfo() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        What is Multiverse Markets?
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Prediction markets let you bet on outcomes — but your position is stuck
        as a payout claim. Multiverse Markets starts where prediction markets
        end. Your positions are{" "}
        <strong className="text-foreground">real tokens</strong> you can
        actually use.
      </p>
      <ul className="space-y-3 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Collateral beyond USDC</strong>{" "}
            — Back your positions with any token — ETH, BTC, stablecoins — not
            just USDC.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">
              Trade them like any other token
            </strong>{" "}
            — Swap, LP, or move your conditional positions freely across DeFi.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Build on top</strong> — Use
            multiverse tokens to create leveraged markets, lending & borrowing
            pools, and more complex instruments.
          </span>
        </li>
      </ul>
      
    </div>
  );
}

export function MultiverseSlidePanel() {
  return (
    <div className="flex flex-col h-full min-h-[28rem] items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-8">
      <video
        className="w-full rounded-xl mix-blend-lighten"
        src="https://ik.imagekit.io/pradipto/64a113d811768b7c91ef0fb6915c87608db54df8.mp4?tr=orig"
        autoPlay
        loop
        muted
        playsInline
      />
      <blockquote className="border-l-2 border-primary/40 pl-4 text-xs italic text-muted-foreground">
        "Multiverse finance is financial infrastructure for parallel universes."
        <br />— Dave White, Paradigm
      </blockquote>
    </div>
  );
}
