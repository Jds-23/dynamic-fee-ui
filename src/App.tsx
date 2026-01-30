import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MintPage } from "@/pages/MintPage";
import { SwapPage } from "@/pages/SwapPage";
import { Providers } from "@/providers";

type Page = "home" | "mint" | "swap";

function AppContent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const renderPage = () => {
    switch (currentPage) {
      case "mint":
        return <MintPage />;
      case "swap":
        return <SwapPage />;
      default:
        return (
          <div className="py-8">
            <Card className="mx-auto max-w-md">
              <CardHeader>
                <CardTitle>Uniswap V4 UI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Manage liquidity and swap tokens on Uniswap V4.
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
                  <Button
                    className="flex-1"
                    onClick={() => setCurrentPage("mint")}
                  >
                    Add Liquidity
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => setCurrentPage("swap")}
                  >
                    Swap
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="text-xl font-bold"
              onClick={() => setCurrentPage("home")}
            >
              Uniswap V4
            </button>
            <nav className="flex gap-4">
              <button
                type="button"
                className={`${currentPage === "home" ? "text-foreground" : "text-muted-foreground"} hover:text-foreground`}
                onClick={() => setCurrentPage("home")}
              >
                Home
              </button>
              <button
                type="button"
                className={`${currentPage === "mint" ? "text-foreground" : "text-muted-foreground"} hover:text-foreground`}
                onClick={() => setCurrentPage("mint")}
              >
                Add Liquidity
              </button>
              <button
                type="button"
                className={`${currentPage === "swap" ? "text-foreground" : "text-muted-foreground"} hover:text-foreground`}
                onClick={() => setCurrentPage("swap")}
              >
                Swap
              </button>
            </nav>
          </div>
          <Header />
        </div>
      </header>
      <main className="container mx-auto px-4">{renderPage()}</main>
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
