import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { TICK_RANGE_FULL } from "@/constants/defaults";

interface TickRangeSelectorProps {
  tickLower: number;
  tickUpper: number;
  tickSpacing: number;
  currentTick?: number;
  onTickLowerChange: (tick: number) => void;
  onTickUpperChange: (tick: number) => void;
  disabled?: boolean;
}

export function TickRangeSelector({
  tickLower,
  tickUpper,
  tickSpacing,
  currentTick,
  onTickLowerChange,
  onTickUpperChange,
  disabled,
}: TickRangeSelectorProps) {
  const [isFullRange, setIsFullRange] = useState(
    tickLower === TICK_RANGE_FULL.tickLower &&
      tickUpper === TICK_RANGE_FULL.tickUpper,
  );

  // Sync isFullRange state when ticks change externally
  useEffect(() => {
    const isFull =
      tickLower === TICK_RANGE_FULL.tickLower &&
      tickUpper === TICK_RANGE_FULL.tickUpper;
    setIsFullRange(isFull);
  }, [tickLower, tickUpper]);

  const handleFullRangeToggle = (checked: boolean) => {
    setIsFullRange(checked);
    if (checked) {
      onTickLowerChange(TICK_RANGE_FULL.tickLower);
      onTickUpperChange(TICK_RANGE_FULL.tickUpper);
    } else if (currentTick !== undefined) {
      // Set a reasonable default range around current tick
      const range = tickSpacing * 100;
      onTickLowerChange(roundToTickSpacing(currentTick - range, tickSpacing));
      onTickUpperChange(roundToTickSpacing(currentTick + range, tickSpacing));
    }
  };

  const roundToTickSpacing = (tick: number, spacing: number) => {
    return Math.round(tick / spacing) * spacing;
  };

  const handleTickLowerChange = (value: string) => {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      onTickLowerChange(roundToTickSpacing(parsed, tickSpacing));
    }
  };

  const handleTickUpperChange = (value: string) => {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      onTickUpperChange(roundToTickSpacing(parsed, tickSpacing));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="full-range">Full Range</Label>
        <Switch
          id="full-range"
          checked={isFullRange}
          onCheckedChange={handleFullRangeToggle}
          disabled={disabled}
        />
      </div>

      {!isFullRange && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tick-lower">Min Tick</Label>
            <Input
              id="tick-lower"
              type="number"
              value={tickLower}
              onChange={(e) => handleTickLowerChange(e.target.value)}
              step={tickSpacing}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tick-upper">Max Tick</Label>
            <Input
              id="tick-upper"
              type="number"
              value={tickUpper}
              onChange={(e) => handleTickUpperChange(e.target.value)}
              step={tickSpacing}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {currentTick !== undefined && (
        <div className="text-sm text-muted-foreground">
          Current tick: {currentTick}
        </div>
      )}
    </div>
  );
}
