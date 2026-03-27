export function MultiverseSlideInfo() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        The Problem
      </h2>
      <p className="max-w-lg text-muted-foreground">
        You have a question you care about — "Will this product ship by Q3?" or
        "Will ETH hit $10k this year?" — and you'd pay{" "}
        <strong className="text-foreground">$100–500</strong> to get a
        crowd-sourced probability estimate. Today, that's surprisingly hard.
      </p>
      <ul className="space-y-3 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Big platforms won't list your niche question</strong>{" "}
            — Polymarket and Kalshi choose which markets exist. You can't just create one.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">
              Running your own market is a nightmare
            </strong>{" "}
            — You'd need to deploy contracts, bootstrap liquidity, and build a frontend from scratch.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">●</span>
          <span>
            <strong className="text-foreground">Multiverse Markets is the turnkey answer</strong> — Type
            your question, fund it with any token, and get a live probability in
            minutes. No permission needed.
          </span>
        </li>
      </ul>
      
    </div>
  );
}

export function MultiverseSlidePanel() {
  return (
    <div className="flex flex-col h-full min-h-0 items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-4 lg:min-h-[28rem] lg:p-8">
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
