import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { FaucetPage } from "@/pages/FaucetPage";
import { LandingPage } from "@/pages/LandingPage";
import { MintPage } from "@/pages/MintPage";
import { PositionsPage } from "@/pages/PositionsPage";
import { SwapPage } from "@/pages/SwapPage";
import { Providers } from "@/providers";

type Page = "home" | "mint" | "swap" | "positions" | "faucet";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const isLanding = currentPage === "home";

  const renderPage = () => {
    switch (currentPage) {
      case "mint":
        return <MintPage />;
      case "swap":
        return <SwapPage />;
      case "positions":
        return <PositionsPage />;
      case "faucet":
        return <FaucetPage />;
      default:
        return <LandingPage onNavigate={(p) => setCurrentPage(p as Page)} />;
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header
        className={
          isLanding
            ? "absolute left-0 right-0 top-0 z-40 border-b border-transparent"
            : "border-b border-border"
        }
      >
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
              <button
                type="button"
                className={`${currentPage === "positions" ? "text-foreground" : "text-muted-foreground"} hover:text-foreground`}
                onClick={() => setCurrentPage("positions")}
              >
                My Positions
              </button>
              <button
                type="button"
                className={`${currentPage === "faucet" ? "text-foreground" : "text-muted-foreground"} hover:text-foreground`}
                onClick={() => setCurrentPage("faucet")}
              >
                Faucet
              </button>
            </nav>
          </div>
          <Header />
        </div>
      </header>
      {isLanding ? (
        renderPage()
      ) : (
        <main className="container mx-auto px-4">{renderPage()}</main>
      )}
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
