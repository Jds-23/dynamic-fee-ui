import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useAccount, useChainId } from "wagmi";
import { ApprovalFlow } from "@/components/approval/ApprovalFlow";
import { TickRangeSelector } from "@/components/position/TickRangeSelector";
import { TokenAmountInput } from "@/components/token/TokenAmountInput";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import {
  DEFAULT_POOL,
  DEFAULT_SLIPPAGE_TOLERANCE,
  TICK_RANGE_FULL,
} from "@/constants/defaults";
import { COMMON_TOKENS } from "@/constants/tokens";
import { useApprovalFlow } from "@/hooks/approval/useApprovalFlow";
import { usePoolState } from "@/hooks/pool/usePoolState";
import { usePosition } from "@/hooks/position/usePosition";
import { useMintPosition } from "@/hooks/transaction/useMintPosition";
import { sortTokens } from "@/lib/poolId";
import type { PoolKey, TokenData } from "@/types";
import { getExplorerTxUrl } from "@/utils/explorer";

export function MintForm() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const tokens = COMMON_TOKENS[chainId] ?? [];

  // Form state
  const [token0, setToken0] = useState<TokenData | undefined>(tokens[0]);
  const [token1, setToken1] = useState<TokenData | undefined>(tokens[1]);
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [tickLower, setTickLower] = useState(TICK_RANGE_FULL.tickLower);
  const [tickUpper, setTickUpper] = useState(TICK_RANGE_FULL.tickUpper);
  const [activeInput, setActiveInput] = useState<"token0" | "token1" | null>(
    null,
  );

  // Use fixed pool configuration (dynamic fee pool)
  const fee = DEFAULT_POOL.fee;
  const tickSpacing = DEFAULT_POOL.tickSpacing;

  // Prevent infinite loops when syncing amounts
  const isCalculatingRef = useRef(false);

  // Sort tokens to get correct currency0/currency1 order
  const sortedTokens =
    token0 && token1 ? sortTokens(token0.address, token1.address) : undefined;

  const currency0 = sortedTokens?.[0];
  const currency1 = sortedTokens?.[1];

  // Pool key for fetching state
  const poolKey: PoolKey | undefined =
    currency0 && currency1
      ? {
          currency0,
          currency1,
          fee,
          tickSpacing,
          hooks: DEFAULT_POOL.hooks,
        }
      : undefined;

  // Pool state from chain
  const { poolState, isLoading: poolLoading } = usePoolState(poolKey);

  // Calculate position from SDK
  const positionData = usePosition({
    chainId,
    token0: token0
      ? {
          address: token0.address,
          decimals: token0.decimals,
          symbol: token0.symbol,
        }
      : undefined,
    token1: token1
      ? {
          address: token1.address,
          decimals: token1.decimals,
          symbol: token1.symbol,
        }
      : undefined,
    fee,
    tickSpacing,
    hooks: DEFAULT_POOL.hooks,
    sqrtPriceX96: poolState?.sqrtPriceX96 ?? 0n,
    liquidity: poolState?.liquidity ?? 0n,
    tick: poolState?.tick ?? 0,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    activeInput,
  });

  // Sync the other amount when position is calculated
  useEffect(() => {
    if (isCalculatingRef.current || !positionData) return;

    isCalculatingRef.current = true;

    if (activeInput === "token0" && positionData.amount1 !== undefined) {
      const formatted = formatUnits(
        positionData.amount1,
        token1?.decimals ?? 18,
      );
      setAmount1(formatted);
    } else if (activeInput === "token1" && positionData.amount0 !== undefined) {
      const formatted = formatUnits(
        positionData.amount0,
        token0?.decimals ?? 18,
      );
      setAmount0(formatted);
    }

    isCalculatingRef.current = false;
  }, [positionData, activeInput, token0?.decimals, token1?.decimals]);

  // Approval flow
  const { currentStep, refetchAllowances } = useApprovalFlow({
    token0Address: token0?.address,
    token1Address: token1?.address,
    amount0Max: positionData?.amount0 ?? 0n,
    amount1Max: positionData?.amount1 ?? 0n,
  });

  // Mint transaction
  const {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: mintError,
    reset: resetMint,
  } = useMintPosition({
    position: positionData?.position,
    slippageTolerance: DEFAULT_SLIPPAGE_TOLERANCE,
  });

  // Reset form and show toast after successful mint
  useEffect(() => {
    if (isSuccess && hash) {
      setAmount0("");
      setAmount1("");
      setActiveInput(null);
      toast.success("Liquidity added!", {
        description: "Transaction confirmed",
        action: {
          label: "View on Etherscan",
          onClick: () => window.open(getExplorerTxUrl(hash), "_blank"),
        },
        duration: 10000,
      });
    }
  }, [isSuccess, hash]);

  // Show toast on mint error
  useEffect(() => {
    if (mintError) {
      toast.error("Add liquidity failed", {
        description: mintError.message?.slice(0, 100) || "Transaction failed",
        duration: 8000,
      });
    }
  }, [mintError]);

  const handleAmount0Change = useCallback(
    (value: string) => {
      setActiveInput("token0");
      setAmount0(value);
      resetMint();
    },
    [resetMint],
  );

  const handleAmount1Change = useCallback(
    (value: string) => {
      setActiveInput("token1");
      setAmount1(value);
      resetMint();
    },
    [resetMint],
  );

  const handleToken0Select = useCallback((token: TokenData) => {
    setToken0(token);
    setAmount0("");
    setAmount1("");
    setActiveInput(null);
  }, []);

  const handleToken1Select = useCallback((token: TokenData) => {
    setToken1(token);
    setAmount0("");
    setAmount1("");
    setActiveInput(null);
  }, []);

  const canMint =
    isConnected &&
    positionData &&
    currentStep === "ready" &&
    !isPending &&
    !isConfirming;

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (!positionData) return "Enter an amount";
    if (currentStep !== "ready") return "Approve tokens first";
    if (isPending) return "Confirm in wallet...";
    if (isConfirming) return "Adding liquidity...";
    if (isSuccess) return "Success!";
    return "Add Liquidity";
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Liquidity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TokenAmountInput
          label="Token 0"
          token={token0}
          amount={amount0}
          onAmountChange={handleAmount0Change}
          onTokenSelect={handleToken0Select}
          tokens={tokens.filter((t) => t.address !== token1?.address)}
          disabled={!isConnected || isPending || isConfirming}
        />

        <TokenAmountInput
          label="Token 1"
          token={token1}
          amount={amount1}
          onAmountChange={handleAmount1Change}
          onTokenSelect={handleToken1Select}
          tokens={tokens.filter((t) => t.address !== token0?.address)}
          disabled={!isConnected || isPending || isConfirming}
        />

        <div>
          <Label className="mb-2 block">Pool Type</Label>
          <div className="rounded-lg border bg-muted/50 px-4 py-3">
            <span className="text-sm font-medium">Dynamic Fee Pool</span>
            <span className="ml-2 text-xs text-muted-foreground">
              (Fee varies per swap)
            </span>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Price Range</Label>
          <TickRangeSelector
            tickLower={tickLower}
            tickUpper={tickUpper}
            tickSpacing={tickSpacing}
            currentTick={poolState?.tick}
            onTickLowerChange={setTickLower}
            onTickUpperChange={setTickUpper}
            disabled={!isConnected || isPending || isConfirming}
          />
        </div>

        {poolLoading && (
          <div className="text-center text-sm text-muted-foreground">
            Loading pool state...
          </div>
        )}

        {positionData && (
          <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Liquidity</span>
              <span>{positionData.liquidity.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {token0?.symbol ?? "Token 0"} Amount
              </span>
              <span>
                {formatUnits(positionData.amount0, token0?.decimals ?? 18)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {token1?.symbol ?? "Token 1"} Amount
              </span>
              <span>
                {formatUnits(positionData.amount1, token1?.decimals ?? 18)}
              </span>
            </div>
          </div>
        )}

        {isConnected && currentStep !== "ready" && (
          <ApprovalFlow
            currentStep={currentStep}
            token0Address={token0?.address}
            token1Address={token1?.address}
            token0Symbol={token0?.symbol}
            token1Symbol={token1?.symbol}
            onApprovalComplete={refetchAllowances}
          />
        )}

        {mintError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {mintError.message}
          </div>
        )}

        <Button
          type="button"
          className="w-full"
          disabled={!canMint}
          onClick={mint}
        >
          {(isPending || isConfirming) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {getButtonText()}
        </Button>

        {hash && (
          <div className="text-center text-sm text-muted-foreground">
            Transaction:{" "}
            <span className="font-mono">
              {hash.slice(0, 10)}...{hash.slice(-8)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
