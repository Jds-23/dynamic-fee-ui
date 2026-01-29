import { useAccount, useChainId } from "wagmi";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Providers } from "@/providers";

function AppContent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Uniswap V4 UI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Phase 3 complete - Web3 integration with wagmi and RainbowKit.
            </p>
            {isConnected ? (
              <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connected:</span>
                  <span className="font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain ID:</span>
                  <span>{chainId}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                Connect your wallet to get started
              </div>
            )}
            <div className="flex gap-2">
              <Button className="flex-1" disabled={!isConnected}>
                Add Liquidity
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                disabled={!isConnected}
              >
                Swap
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}

export default App;
