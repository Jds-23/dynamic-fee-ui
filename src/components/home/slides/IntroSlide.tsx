export function IntroSlideInfo() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Welcome</h2>
      <p className="max-w-lg text-muted-foreground">
        Discover prediction markets powered by Uniswap V4 hooks.
      </p>
    </div>
  );
}

export function IntroSlidePanel() {
  return (
    <div className="flex h-full min-h-[28rem] items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-8">
      <div className="flex h-64 w-full items-center justify-center rounded-xl bg-muted">
        <span className="text-sm text-muted-foreground">Image coming soon</span>
      </div>
    </div>
  );
}
