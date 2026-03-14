import { useEffect, useRef, useState } from "react";
import {
  GitBranch,
  Layers,
  Code2,
  Rocket,
  Split,
  Calculator,
  ArrowRightLeft,
  CheckCircle,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

function AnimatedSlide({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
    >
      {children}
    </div>
  );
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll<HTMLElement>("[data-slide]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.slide,
            );
            setActiveSlide(index);
          }
        }
      },
      { root: container, threshold: 0.5 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen snap-y snap-proximity overflow-y-scroll"
    >
      {/* Dot indicator */}
      <div className="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2">
        {Array.from({ length: 9 }, (_, i) => i).map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-all ${
              activeSlide === i
                ? "scale-125 bg-primary"
                : "bg-muted-foreground/40 hover:bg-muted-foreground/70"
            }`}
            onClick={() =>
              containerRef.current
                ?.querySelectorAll("[data-slide]")
                [i]?.scrollIntoView({ behavior: "smooth" })
            }
          />
        ))}
      </div>

      {/* Slide 0: Hero */}
      <section
        data-slide="0"
        className="flex min-h-screen snap-start items-center justify-center py-16"
      >
        <AnimatedSlide>
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex flex-col items-center gap-6 text-center">
              <GitBranch className="h-12 w-12 text-primary/80" />
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                The Multiverse Hook
              </h1>
              <p className="text-xl text-muted-foreground sm:text-2xl">
                Conditional Finance as a Uniswap v4 Hook
              </p>
              <p className="max-w-2xl italic text-muted-foreground">
                "What if you could trade in parallel financial universes?"
              </p>
              <p className="max-w-2xl text-left text-muted-foreground">
                It's election night. You want to short the market — but only if
                your candidate loses. Today, you can't express that. Your
                financial position exists in one reality.{" "}
                <strong className="text-foreground">Multiverse Finance</strong>{" "}
                splits the financial system into conditional worlds. Each
                possible outcome creates a parallel universe with its own token
                economy. You trade, hedge, and compose positions{" "}
                <em>within</em> each universe — before reality is decided.
              </p>
              <p className="max-w-2xl text-left text-sm text-muted-foreground/80">
                This project implements Multiverse Finance as a Uniswap v4 hook:
                native routing, no separate contracts, full DeFi composability
                from day one. Concept by Dave White, Paradigm (2025).
              </p>
              <Button
                size="lg"
                className="mt-4 text-base"
                onClick={() => onNavigate("swap")}
              >
                Explore the Multiverse
              </Button>
            </div>
          </div>
        </AnimatedSlide>
      </section>

      {/* Slide 1: What is Multiverse Finance? */}
      <section
        data-slide="1"
        className="flex min-h-screen snap-start items-center justify-center py-16"
      >
        <AnimatedSlide>
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-8 flex items-center gap-3">
              <Layers className="h-8 w-8 text-primary/80" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                What is Multiverse Finance?
              </h2>
            </div>
            <p className="mb-6 text-lg text-muted-foreground">
              Prediction markets let you bet on outcomes.{" "}
              <strong className="text-foreground">
                Multiverse Finance goes further.
              </strong>
            </p>
            <ul className="mb-8 space-y-4 text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  <strong className="text-foreground">
                    Conditional tokens split reality:
                  </strong>{" "}
                  each outcome creates a parallel financial universe
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  Each outcome universe has its own token economy — you can hold,
                  trade, or compose positions <strong className="text-foreground">across</strong> these
                  universes
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  Prediction markets are a <em>subset</em> — Multiverse Finance
                  is the general framework
                </span>
              </li>
            </ul>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">Key Insight</p>
              <p className="mt-1 text-muted-foreground">
                Instead of betting on outcomes, you build{" "}
                <strong className="text-foreground">
                  conditional financial positions
                </strong>
                . A short that only activates if your candidate loses. A hedge
                that only exists in the universe where rates rise.
              </p>
            </div>
          </div>
        </AnimatedSlide>
      </section>

      {/* Slide 2: How It Works in a Hook */}
      <section
        data-slide="2"
        className="flex min-h-screen snap-start items-center justify-center py-16"
      >
        <AnimatedSlide>
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-8 flex items-center gap-3">
              <Code2 className="h-8 w-8 text-primary/80" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                How It Works in a Hook
              </h2>
            </div>
            <Card className="mb-8 border-border/50 bg-card/50">
              <CardContent className="p-0">
                <pre className="overflow-x-auto p-4 text-sm font-mono">
                  <code>{`┌─────────────────────────────────────────────┐
│              ConditionalLMSRMarketHook       │
│                                              │
│   beforeSwap + beforeSwapReturnDelta         │
│   ─ hook controls ALL token deltas           │
│   ─ x·y·k pricing is bypassed entirely       │
│                                              │
│   One hook contract, N pools per market:     │
│     • collateral ↔ YES                       │
│     • collateral ↔ NO                        │
│     • YES ↔ NO                               │
│                                              │
│   tokenToCondition reverse lookup            │
│   routes any swap to the right market        │
└─────────────────────────────────────────────┘`}</code>
                </pre>
              </CardContent>
            </Card>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    beforeSwap
                  </code>{" "}
                  intercepts every swap — the hook computes prices and token
                  flows
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  Standard Uniswap routers and aggregators work{" "}
                  <strong className="text-foreground">unmodified</strong>
                </span>
              </li>
            </ul>
          </div>
        </AnimatedSlide>
      </section>

      {/* Slide 3: Market Creation */}
      <section
        data-slide="3"
        className="flex min-h-screen snap-start items-center justify-center py-16"
      >
        <AnimatedSlide>
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-8 flex items-center gap-3">
              <Rocket className="h-8 w-8 text-primary/80" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                Market Creation — Splitting Reality
              </h2>
            </div>
            <pre className="mb-6 rounded-lg bg-muted p-4 text-sm font-mono overflow-x-auto">
              <code>createMarket(conditionId, collateral, b)</code>
            </pre>
            <p className="mb-4 text-muted-foreground">
              One transaction creates a conditional universe:
            </p>
            <ol className="mb-8 space-y-2 text-muted-foreground list-decimal pl-6">
              <li>
                <strong className="text-foreground">Deploy</strong> YES + NO
                outcome tokens (deterministic addresses from conditionId)
              </li>
              <li>
                <strong className="text-foreground">Seed</strong> initial
                liquidity into the LMSR market maker
              </li>
              <li>
                <strong className="text-foreground">Initialize</strong> 3
                Uniswap v4 pools (collateral↔YES, collateral↔NO, YES↔NO)
              </li>
            </ol>
            <table className="w-full border-collapse text-sm mb-6">
              <thead>
                <tr>
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                    Contract
                  </th>
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-3 py-2">
                    <code className="text-sm">ConditionalLMSRMarketHook</code>
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    Hook + swap routing
                  </td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">
                    <code className="text-sm">ConditionalMarkets</code>
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    Collateral escrow, split/merge
                  </td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">
                    <code className="text-sm">LMSRMath</code>
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    On-chain pricing engine
                  </td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">
                    <code className="text-sm">OutcomeToken</code>
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    Mintable/burnable ERC-20
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground/80">
              4 contracts, ~1,000 LOC total
            </p>
          </div>
        </AnimatedSlide>
      </section>

      {/* Slide 4: How Buys Differ (The Split) */}
      <section
        data-slide="4"
        className="flex min-h-screen snap-start items-center justify-center py-16"
      >
        <AnimatedSlide>
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-8 flex items-center gap-3">
              <Split className="h-8 w-8 text-primary/80" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                How Buys Differ — The Split
              </h2>
            </div>
            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Traditional AMM</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Swap token A for token B from existing reserves. Supply is
                    constant.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Multiverse Hook</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Every buy <strong className="text-foreground">mints new supply</strong>.
                    Collateral is split into YES + NO tokens.
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="mb-6 text-muted-foreground">
              This is why{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                x·y=k
              </code>{" "}
              doesn't work — supply changes on every trade. You need a pricing
              function that handles minting and tracks quantities across
              outcomes.
            </p>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">
                Election example
              </p>
              <p className="mt-1 text-muted-foreground">
                Buy 100 YES → split mints 100 YES + 100 NO → you get YES, hook
                keeps NO. The cost is determined by LMSR, not by a
                constant-product curve.
              </p>
            </div>
          </div>
        </AnimatedSlide>
      </section>

      {/* Slide 5: LMSR Pricing */}
      <section
        data-slide="5"
        className="flex min-h-screen snap-start items-center justify-center py-16"
      >
        <AnimatedSlide>
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-8 flex items-center gap-3">
              <Calculator className="h-8 w-8 text-primary/80" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                LMSR Pricing
              </h2>
            </div>
            <p className="mb-4 text-muted-foreground">
              Hanson's Logarithmic Market Scoring Rule (2003):
            </p>
            <pre className="mb-6 rounded-lg bg-muted p-4 text-sm font-mono overflow-x-auto">
              <code>C(q) = b · ln( Σ exp(qᵢ / b) )</code>
            </pre>
            <ul className="mb-8 space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  <strong className="text-foreground">Cost of a trade</strong> ={" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    C(q_after) - C(q_before)
                  </code>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  <strong className="text-foreground">
                    Prices = probabilities
                  </strong>{" "}
                  that always sum to 1
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  Prices move along a{" "}
                  <strong className="text-foreground">sigmoid</strong> as shares
                  are bought/sold
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    b
                  </code>{" "}
                  controls liquidity depth — higher b = deeper book, bounded
                  loss ≤{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    b · ln(n)
                  </code>
                </span>
              </li>
            </ul>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                    Function
                  </th>
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                    Mode
                  </th>
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-3 py-2">
                    <code className="text-sm">calcNetCost</code>
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    exact-output
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    "I want X tokens — what do I pay?"
                  </td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">
                    <code className="text-sm">calcTradeAmountBinary</code>
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    exact-input
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    "I have X collateral — how many tokens?"
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AnimatedSlide>
      </section>

      {/* Slide 6: beforeSwap Token Flow */}
      <section
        data-slide="6"
        className="flex min-h-screen snap-start items-center justify-center py-16"
      >
        <AnimatedSlide>
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-8 flex items-center gap-3">
              <ArrowRightLeft className="h-8 w-8 text-primary/80" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                beforeSwap — Token Flow
              </h2>
            </div>
            <div className="mb-8 space-y-4">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-primary">
                    Buy (split path)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="rounded bg-muted p-3 text-sm font-mono overflow-x-auto">
                    <code>
                      take collateral from PoolManager → split() mints YES+NO →
                      settle requested token to user
                    </code>
                  </pre>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-primary">
                    Sell (merge path)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="rounded bg-muted p-3 text-sm font-mono overflow-x-auto">
                    <code>
                      take outcome tokens from PoolManager → merge() burns
                      YES+NO → settle collateral to user
                    </code>
                  </pre>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-primary">
                    YES ↔ NO swap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="rounded bg-muted p-3 text-sm font-mono overflow-x-auto">
                    <code>
                      calcTokenSwapBinary — zero-cost swap, no collateral
                      movement
                    </code>
                  </pre>
                </CardContent>
              </Card>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              <strong className="text-foreground">
                BeforeSwapDelta sign convention:
              </strong>{" "}
              Negative = hook owes the pool (sends tokens). Positive = pool owes
              the hook (receives tokens).
            </p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold" />
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                    Exact Input
                  </th>
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                    Exact Output
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border bg-muted px-3 py-2 font-semibold">
                    Buy
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    "I have X collateral → how many tokens?"
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    "I want X tokens → what do I pay?"
                  </td>
                </tr>
                <tr>
                  <td className="border border-border bg-muted px-3 py-2 font-semibold">
                    Sell
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    "I have X tokens → how much collateral?"
                  </td>
                  <td className="border border-border px-3 py-2 text-muted-foreground">
                    "I want X collateral → how many tokens?"
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AnimatedSlide>
      </section>

      {/* Slide 7: Resolution & Redemption */}
      <section
        data-slide="7"
        className="flex min-h-screen snap-start items-center justify-center py-16"
      >
        <AnimatedSlide>
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-8 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-primary/80" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                Resolution & Redemption
              </h2>
            </div>
            <p className="mb-4 text-lg text-muted-foreground">
              The oracle declares which universe is real. The multiverse
              collapses.
            </p>
            <pre className="mb-6 rounded-lg bg-muted p-4 text-sm font-mono overflow-x-auto">
              <code>resolve(conditionId, winner)</code>
            </pre>
            <ul className="mb-8 space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  <strong className="text-foreground">Winning tokens</strong>{" "}
                  redeem 1:1 against collateral
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  <strong className="text-foreground">Losing tokens</strong>{" "}
                  become worthless — that universe ceased to exist
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-primary">•</span>
                <span>
                  Post-resolution sells{" "}
                  <strong className="text-foreground">auto-upgrade</strong> to
                  direct 1:1 redemptions (no LMSR needed)
                </span>
              </li>
            </ul>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">
                Election example, concluded
              </p>
              <p className="mt-1 text-muted-foreground">
                Your candidate wins. Your YES tokens — bought at $0.60 when the
                market was uncertain — now redeem at $1.00 each. The NO tokens
                held by others? Collapsed to zero.
              </p>
            </div>
          </div>
        </AnimatedSlide>
      </section>

      {/* Slide 8: Expanding the Multiverse (CTA) */}
      <section
        data-slide="8"
        className="flex min-h-screen snap-start items-center justify-center py-16"
      >
        <AnimatedSlide>
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-8 flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary/80" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                Expanding the Multiverse
              </h2>
            </div>
            <div className="mb-8 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="mb-4 text-lg font-semibold">Working Today</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {[
                    "Multi-market creation, all 4 swap directions",
                    "YES↔NO swaps",
                    "Resolution, redemption, post-resolution auto-upgrade",
                    "Full test suite with FFI cross-verification",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold">Vision</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="mt-1 text-primary">•</span>
                    <span>
                      N {">"} 2 outcomes — multiple parallel universes per event
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-primary">•</span>
                    <span>Oracle integration (UMA / Reality.eth)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-primary">•</span>
                    <span>LP fee sharing for liquidity providers</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-primary">•</span>
                    <span>
                      DeFi composability — conditional tokens as collateral in
                      lending, vaults, etc.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">
                Novel Contribution
              </p>
              <p className="mt-1 text-muted-foreground">
                The first LMSR prediction market implemented as a Uniswap v4
                hook — Multiverse Finance meets DeFi infrastructure. The pattern
                generalizes: any pricing function can replace{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  x·y=k
                </code>{" "}
                via{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  beforeSwapReturnDelta
                </code>
                .
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="text-base"
                onClick={() => onNavigate("swap")}
              >
                Start Trading
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base"
                onClick={() => onNavigate("mint")}
              >
                Add Liquidity
              </Button>
            </div>
          </div>
        </AnimatedSlide>
      </section>
    </div>
  );
}
