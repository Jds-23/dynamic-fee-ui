import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomePage } from "@/pages/HomePage";
import { FaucetPage } from "@/pages/FaucetPage";
import { MintCollateralPage } from "@/pages/MintCollateralPage";
import { MintPage } from "@/pages/MintPage";
import { MarketsPage } from "@/pages/MarketsPage";
import { MarketTradePage } from "@/pages/MarketTradePage";
import { CreateMarketPage } from "@/pages/CreateMarketPage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { PositionsPage } from "@/pages/PositionsPage";
import { SwapPage } from "@/pages/SwapPage";
import { ResolvePage } from "@/pages/ResolvePage";
import { APP_MODE, type AppMode } from "@/constants/appMode";

interface NavItem {
  label: string;
  to: string;
  modes: AppMode[];
  activeOptions?: { exact?: boolean };
}

const NAV_ITEMS: NavItem[] = [
  { label: "Markets", to: "/markets", modes: ["prediction"] },
  { label: "Create Market", to: "/create-market", modes: ["prediction"] },
  { label: "Portfolio", to: "/portfolio", modes: ["prediction"] },
  { label: "Add Liquidity", to: "/mint", modes: ["dynamic"] },
  { label: "Swap", to: "/swap", modes: ["dynamic"] },
  { label: "My Positions", to: "/positions", modes: ["dynamic"] },
  { label: "Mint Collateral", to: "/mint-collateral", modes: ["prediction"] },
  { label: "Faucet", to: "/faucet", modes: ["dynamic"] },
];

const filteredNavItems = NAV_ITEMS.filter((item) => item.modes.includes(APP_MODE));

function RootLayout() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="border-b border-border backdrop-blur-sm bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" search={{ market: undefined }} className="text-xl font-bold">
              Uniswap V4
            </Link>
            <nav className="flex gap-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={item.activeOptions}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground [&.active]:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Header />
        </div>
      </header>
      <main className="container mx-auto px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
  validateSearch: (search: Record<string, unknown>) => ({
    market: (search.market as string) || undefined,
  }),
});

const marketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/markets",
  component: MarketsPage,
});

const marketTradeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/markets/$conditionId",
  component: MarketTradePage,
});

const marketResolveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/markets/$conditionId/resolve",
  component: ResolvePage,
});

const createMarketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-market",
  component: CreateMarketPage,
});

const portfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portfolio",
  component: PortfolioPage,
});

const mintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mint",
  component: MintPage,
});

const swapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/swap",
  component: SwapPage,
});

const positionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/positions",
  component: PositionsPage,
});

const faucetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faucet",
  component: FaucetPage,
});

const mintCollateralRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mint-collateral",
  component: MintCollateralPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  marketsRoute,
  marketTradeRoute,
  marketResolveRoute,
  createMarketRoute,
  portfolioRoute,
  mintRoute,
  swapRoute,
  positionsRoute,
  faucetRoute,
  mintCollateralRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
