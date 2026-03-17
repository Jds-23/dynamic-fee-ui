import { Cuer } from "cuer";

export function ThankYouSlideInfo() {
  return (
    <div className="flex flex-col items-center space-y-8 text-center">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
        Thank You!
      </h2>

      <div className="rounded-2xl p-4">
        <Cuer
          value="https://multiverse.joydeeeep.com/"
          size={220}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Scan to try it live
      </p>

      <a
        href="https://github.com/Jds-23/multiverse-market-hook"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        GitHub Repository
      </a>
    </div>
  );
}

export function ThankYouSlidePanel() {
  return (
    <div className="flex h-full min-h-[28rem] flex-col items-center justify-center gap-12 rounded-2xl border border-border/50 bg-card/30 p-8">
      <h3 className="text-lg font-semibold text-muted-foreground">
        Powered By
      </h3>

      <div className="flex flex-col items-center gap-14">
        <img
          src="/uniswap_full.png"
          alt="Uniswap"
          className="h-auto max-w-[280px]"
        />
        <img
          src="/unichain_full.png"
          alt="Unichain"
          className="h-auto max-w-[280px]"
        />
        <img
          src="/atrium_full.png"
          alt="Atrium"
          className="h-auto max-w-[280px]"
        />
      </div>
    </div>
  );
}
