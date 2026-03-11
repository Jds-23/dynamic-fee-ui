import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaucetPage } from "@/pages/FaucetPage";
import { MintCollateralPage } from "@/pages/MintCollateralPage";
import { MintPage } from "@/pages/MintPage";
import { MarketsPage } from "@/pages/MarketsPage";
import { MarketTradePage } from "@/pages/MarketTradePage";
import { CreateMarketPage } from "@/pages/CreateMarketPage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { PositionsPage } from "@/pages/PositionsPage";
import { SwapPage } from "@/pages/SwapPage";
import { Providers } from "@/providers";
import { APP_MODE, type AppMode } from "@/constants/appMode";

type Page = "home" | "mint" | "swap" | "positions" | "faucet" | "mint-collateral" | "markets" | "market-trade" | "create-market" | "portfolio";

interface NavItem {
  label: string;
  page: Page;
  modes: AppMode[];
  activePages?: Page[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", page: "home", modes: ["prediction", "dynamic"] },
  { label: "Markets", page: "markets", modes: ["prediction"], activePages: ["markets", "market-trade"] },
  { label: "Create Market", page: "create-market", modes: ["prediction"] },
  { label: "Portfolio", page: "portfolio", modes: ["prediction"] },
  { label: "Add Liquidity", page: "mint", modes: ["dynamic"] },
  { label: "Swap", page: "swap", modes: ["dynamic"] },
  { label: "My Positions", page: "positions", modes: ["dynamic"] },
  { label: "Mint Collateral", page: "mint-collateral", modes: ["prediction"] },
  { label: "Faucet", page: "faucet", modes: ["dynamic"] },
];

const filteredNavItems = NAV_ITEMS.filter((item) => item.modes.includes(APP_MODE));

function AppContent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedConditionId, setSelectedConditionId] = useState<`0x${string}` | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case "mint":
        return <MintPage />;
      case "swap":
        return <SwapPage />;
      case "positions":
        return <PositionsPage />;
      case "markets":
        return (
          <MarketsPage
            onSelectMarket={(id) => {
              setSelectedConditionId(id);
              setCurrentPage("market-trade");
            }}
          />
        );
      case "market-trade":
        return (
          <MarketTradePage
            conditionId={selectedConditionId!}
            onBack={() => setCurrentPage("markets")}
          />
        );
      case "create-market":
        return <CreateMarketPage />;
      case "portfolio":
        return (
          <PortfolioPage
            onNavigateMarket={(id) => {
              setSelectedConditionId(id);
              setCurrentPage("market-trade");
            }}
          />
        );
      case "mint-collateral":
        return <MintCollateralPage />;
      case "faucet":
        return <FaucetPage />;
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
              {filteredNavItems.map((item) => {
                const activePages = item.activePages ?? [item.page];
                const isActive = activePages.includes(currentPage);
                return (
                  <button
                    key={item.page}
                    type="button"
                    className={`${isActive ? "text-foreground" : "text-muted-foreground"} hover:text-foreground`}
                    onClick={() => setCurrentPage(item.page)}
                  >
                    {item.label}
                  </button>
                );
              })}
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
