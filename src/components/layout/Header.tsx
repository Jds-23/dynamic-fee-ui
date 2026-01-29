import { ConnectButton } from "@/components/wallet/ConnectButton";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Uniswap V4</h1>
          <nav className="flex gap-4">
            <a href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </a>
            <a
              href="/mint"
              className="text-muted-foreground hover:text-foreground"
            >
              Add Liquidity
            </a>
            <a
              href="/swap"
              className="text-muted-foreground hover:text-foreground"
            >
              Swap
            </a>
          </nav>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
