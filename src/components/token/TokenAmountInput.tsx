import { formatUnits } from "viem";
import { Input } from "@/components/ui/Input";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";
import type { TokenData } from "@/types";
import { TokenSelector } from "./TokenSelector";

interface TokenAmountInputProps {
  token?: TokenData;
  amount: string;
  onAmountChange: (amount: string) => void;
  onTokenSelect: (token: TokenData) => void;
  tokens: TokenData[];
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export function TokenAmountInput({
  token,
  amount,
  onAmountChange,
  onTokenSelect,
  tokens,
  label,
  disabled,
  readOnly,
}: TokenAmountInputProps) {
  const { balance } = useTokenBalance(token?.address);

  const formattedBalance =
    balance !== undefined && token ? formatUnits(balance, token.decimals) : "0";

  const handleMaxClick = () => {
    if (formattedBalance && !readOnly) {
      onAmountChange(formattedBalance);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      {label && (
        <div className="mb-2 text-sm text-muted-foreground">{label}</div>
      )}
      <div className="flex items-center gap-4">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(e) => {
            const value = e.target.value;
            // Allow only valid decimal input
            if (/^[0-9]*\.?[0-9]*$/.test(value) || value === "") {
              onAmountChange(value);
            }
          }}
          disabled={disabled}
          readOnly={readOnly}
          className="border-0 bg-transparent text-2xl font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <TokenSelector
          selectedToken={token}
          onSelect={onTokenSelect}
          tokens={tokens}
          disabled={disabled}
        />
      </div>
      {token && (
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Balance:{" "}
            {parseFloat(formattedBalance).toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })}
          </span>
          {!readOnly && (
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={handleMaxClick}
              disabled={disabled}
            >
              MAX
            </button>
          )}
        </div>
      )}
    </div>
  );
}
