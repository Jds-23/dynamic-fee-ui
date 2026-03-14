import { Link } from "@tanstack/react-router";
import { BarChart3, Zap, Shield, Coins } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

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

const features = [
  { icon: <BarChart3 className="h-5 w-5" />, title: "LMSR Pricing", description: "Automated market maker with logarithmic scoring" },
  { icon: <Zap className="h-5 w-5" />, title: "Dynamic Fees", description: "Fees adjust based on market volatility" },
  { icon: <Shield className="h-5 w-5" />, title: "Smart Accounts", description: "Gasless transactions via EIP-7702" },
  { icon: <Coins className="h-5 w-5" />, title: "On-chain Settlement", description: "Trustless resolution and redemption" },
];

export function HeroSlideInfo() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs">
          Built on Uniswap V4
        </span>
        <span className="ml-1 inline-block rounded-full bg-secondary px-3 py-1 text-xs">
          Deployed on Unichain
        </span>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          The Multiverse Market
          <span className="block text-muted-foreground">
            A Uniswap v4 Hook for Conditional Finance
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
        {features.map((f) => (
          <FeatureCard
            key={f.title}
            icon={f.icon}
            title={f.title}
            description={f.description}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroSlidePanel() {
  return (
    <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-8">
      <h2 className="text-lg font-semibold">Demo</h2>
    </div>
  );
}
