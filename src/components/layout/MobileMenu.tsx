import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { APP_MODE, type AppMode } from "@/constants/appMode";

interface NavItem {
  label: string;
  to: string;
  modes: AppMode[];
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

const filteredNavItems = NAV_ITEMS.filter((item) =>
  item.modes.includes(APP_MODE),
);

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent/20"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-background shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
          <DialogPrimitive.Title className="sr-only">
            Navigation menu
          </DialogPrimitive.Title>
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Link
              to="/"
              search={{ market: undefined }}
              className="text-xl font-bold"
              onClick={() => setOpen(false)}
            >
              Uniswap V4
            </Link>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent/20"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div className="px-4 py-4">
            <ConnectButton />
          </div>

          <nav className="flex-1 overflow-y-auto px-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground [&.active]:bg-accent/10 [&.active]:text-foreground"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pb-[env(safe-area-inset-bottom)]" />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
