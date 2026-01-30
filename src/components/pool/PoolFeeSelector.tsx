import { FEE_TIERS } from "@/constants/defaults";
import { cn } from "@/lib/utils";

interface PoolFeeSelectorProps {
  selectedFee: number;
  onSelect: (fee: number, tickSpacing: number) => void;
  disabled?: boolean;
}

export function PoolFeeSelector({
  selectedFee,
  onSelect,
  disabled,
}: PoolFeeSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {FEE_TIERS.map((tier) => (
        <button
          key={tier.fee}
          type="button"
          onClick={() => onSelect(tier.fee, tier.tickSpacing)}
          disabled={disabled}
          className={cn(
            "rounded-lg border p-3 text-center transition-colors",
            selectedFee === tier.fee
              ? "border-primary bg-primary/10"
              : "hover:border-primary/50",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <div className="font-medium">{tier.label}</div>
          <div className="text-xs text-muted-foreground">
            {tier.tickSpacing} tick
          </div>
        </button>
      ))}
    </div>
  );
}
