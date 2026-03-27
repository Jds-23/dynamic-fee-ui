import { useNavigate } from "@tanstack/react-router";
import { CreateMarketForm } from "@/components/market/CreateMarketForm";

export function CreateMarketSlideInfo() {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        Step 1: Create Your Market
      </h2>
      <p className="text-sm text-muted-foreground">
        Type any yes/no question, choose how much to subsidize (your{" "}
        <strong className="text-foreground">$100–500 budget</strong>), and hit
        create. One transaction does everything:
      </p>

      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>
          <strong className="text-foreground">Deploys outcome tokens</strong> —
          YES and NO ERC-20 tokens are minted for your question.
        </li>
        <li>
          <strong className="text-foreground">Seeds liquidity</strong> — Your
          subsidy becomes the initial pool, so traders can immediately buy and
          sell.
        </li>
        <li>
          <strong className="text-foreground">Sets fair starting prices</strong>{" "}
          — LMSR pricing starts both outcomes at 50/50, ready for the crowd to
          move.
        </li>
      </ol>

      <p className="text-sm text-muted-foreground">
        A higher subsidy (the <strong className="text-foreground">b</strong>{" "}
        parameter) means the market can absorb more trading volume before prices
        swing wildly — giving you a more stable, accurate estimate.
      </p>

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
    <div className="flex h-full min-h-0 items-center justify-center overflow-y-auto rounded-2xl border border-border/50 bg-card/30 p-4 lg:min-h-[28rem] lg:p-6">
      <CreateMarketForm
        onCreated={(universeId) =>
          navigate({ to: "/", search: { market: universeId } })
        }
      />
    </div>
  );
}
