import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import type { TokenData } from "@/types";

interface TokenSelectorProps {
  selectedToken?: TokenData;
  onSelect: (token: TokenData) => void;
  tokens: TokenData[];
  disabled?: boolean;
}

export function TokenSelector({
  selectedToken,
  onSelect,
  tokens,
  disabled,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.address.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 min-w-[140px]"
          disabled={disabled}
        >
          {selectedToken ? (
            <>
              <span className="font-medium">{selectedToken.symbol}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </>
          ) : (
            <>
              <span>Select Token</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by name, symbol, or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-72 overflow-y-auto">
          {filteredTokens.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No tokens found
            </div>
          ) : (
            filteredTokens.map((token) => (
              <button
                key={token.address}
                type="button"
                className="flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-accent"
                onClick={() => {
                  onSelect(token);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {token.logoURI ? (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {token.symbol.slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-sm text-muted-foreground">
                    {token.name}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
