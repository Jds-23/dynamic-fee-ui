import { Link } from "@tanstack/react-router";
import { BarChart3, Zap, Shield, Coins } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MarketCard } from "@/components/market/MarketCard";
import { useMarketList } from "@/hooks/market/useMarketList";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="p-4">
      <CardContent className="flex items-start gap-3 p-0">
        <div className="text-primary">{icon}</div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LiveMarketPreview() {
  const { markets, isLoading } = useMarketList();
  const previewMarkets = markets.slice(0, 3);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Live Markets</h2>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      </div>

      {isLoading && markets.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : previewMarkets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">No markets yet.</p>
          <Button variant="link" asChild className="mt-2">
            <Link to="/create-market">Create the first one</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {previewMarkets.map((market) => (
            <Link
              key={market.condition.conditionId}
              to="/markets/$conditionId"
              params={{ conditionId: market.condition.conditionId }}
            >
              <MarketCard market={market} />
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 text-center">
        <Button variant="link" asChild>
          <Link to="/markets">View all markets &rarr;</Link>
        </Button>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 items-center gap-12 py-12 lg:grid-cols-2">
      {/* Left column */}
      <div className="space-y-8">
        <div className="space-y-4">
          <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs">
            Built on Uniswap V4
          </span>
          <span className="inline-block rounded-full bg-secondary ml-1 px-3 py-1 text-xs">
            Deployed on Unichain 
          </span>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Prediction Markets
            <span className="block text-muted-foreground">
              with on-chain settlement.
            </span>
          </h1>
          <p className="max-w-lg text-muted-foreground">
            Trade on real-world outcomes using LMSR pricing, dynamic fees that
            adjust to volatility, and gasless transactions via smart accounts.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link to="/markets">Explore Markets</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/create-market">Create Market</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="LMSR Pricing"
            description="Automated market maker with logarithmic scoring"
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Dynamic Fees"
            description="Fees adjust based on market volatility"
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Smart Accounts"
            description="Gasless transactions via EIP-7702"
          />
          <FeatureCard
            icon={<Coins className="h-5 w-5" />}
            title="On-chain Settlement"
            description="Trustless resolution and redemption"
          />
        </div>
      </div>

      {/* Right column */}
      <LiveMarketPreview />
    </div>
  );
}
