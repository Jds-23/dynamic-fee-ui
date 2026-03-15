import { useNavigate } from "@tanstack/react-router";
import { CreateMarketForm } from "@/components/market/CreateMarketForm";

export function CreateMarketSlideInfo() {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        Market Creation
      </h2>
      <p className="text-sm text-muted-foreground">
        A binary market with <strong className="text-foreground">n</strong>{" "}
        outcomes requires{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
          C(n+1, 2)
        </code>{" "}
        Uniswap V4 pools — one per token pair. For a YES / NO market that means
        3 pools.
      </p>

      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono leading-relaxed">
{`Market(conditionId, collateral, amount)
  → deploy YES & NO tokens
  → fund the hook with collateral
  → initialise 3 pools`}
      </pre>

      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>
          <strong className="text-foreground">Deploy</strong> — ERC-20 outcome
          tokens are created for the condition.
        </li>
        <li>
          <strong className="text-foreground">Fund</strong> — Collateral is
          transferred to the hook contract as initial liquidity.
        </li>
        <li>
          <strong className="text-foreground">Initialise</strong> — Three
          Uniswap V4 pools are spun up with LMSR-derived starting prices.
        </li>
      </ol>

      <div className="overflow-hidden rounded-lg border border-border/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/60">
              <th className="px-3 py-1.5 text-left font-medium">Pool</th>
              <th className="px-3 py-1.5 text-left font-medium">Token 0</th>
              <th className="px-3 py-1.5 text-left font-medium">Token 1</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            <tr>
              <td className="px-3 py-1.5 font-mono">1</td>
              <td className="px-3 py-1.5">Collateral</td>
              <td className="px-3 py-1.5">YES</td>
            </tr>
            <tr>
              <td className="px-3 py-1.5 font-mono">2</td>
              <td className="px-3 py-1.5">Collateral</td>
              <td className="px-3 py-1.5">NO</td>
            </tr>
            <tr>
              <td className="px-3 py-1.5 font-mono">3</td>
              <td className="px-3 py-1.5">YES</td>
              <td className="px-3 py-1.5">NO</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CreateMarketSlidePanel() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[28rem] items-center justify-center overflow-y-auto rounded-2xl border border-border/50 bg-card/30 p-6">
      <CreateMarketForm
        onCreated={(conditionId) =>
          navigate({ to: "/", search: { market: conditionId } })
        }
      />
    </div>
  );
}
