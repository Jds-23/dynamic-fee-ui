import { ArrowDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId } from "wagmi";
import { ApprovalFlow } from "@/components/approval/ApprovalFlow";
import { TokenAmountInput } from "@/components/token/TokenAmountInput";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DEFAULT_POOL, DEFAULT_SLIPPAGE_TOLERANCE } from "@/constants/defaults";
import { COMMON_TOKENS } from "@/constants/tokens";
import { useApprovalFlow } from "@/hooks/approval/useApprovalFlow";
import { usePoolState } from "@/hooks/pool/usePoolState";
import { useSwapQuote } from "@/hooks/swap/useSwapQuote";
import { useSwapTransaction } from "@/hooks/swap/useSwapTransaction";
import { sortTokens } from "@/lib/poolId";
import type { PoolKey, TokenData } from "@/types";

export function SwapForm() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const tokens = COMMON_TOKENS[chainId] ?? [];

  // Form state
  const [tokenIn, setTokenIn] = useState<TokenData | undefined>(tokens[0]);
  const [tokenOut, setTokenOut] = useState<TokenData | undefined>(tokens[1]);
  const [amountIn, setAmountIn] = useState("");
  const [fee] = useState(DEFAULT_POOL.fee);
  const [tickSpacing] = useState(DEFAULT_POOL.tickSpacing);

  // Sort tokens to get correct currency0/currency1 order for the pool
  const sortedTokens =
    tokenIn && tokenOut
      ? sortTokens(tokenIn.address, tokenOut.address)
      : undefined;

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

  // Calculate swap quote
  const { quote, zeroForOne } = useSwapQuote({
    chainId,
    tokenIn: tokenIn
      ? {
          address: tokenIn.address,
          decimals: tokenIn.decimals,
          symbol: tokenIn.symbol,
        }
      : undefined,
    tokenOut: tokenOut
      ? {
          address: tokenOut.address,
          decimals: tokenOut.decimals,
          symbol: tokenOut.symbol,
        }
      : undefined,
    fee,
    tickSpacing,
    hooks: DEFAULT_POOL.hooks,
    sqrtPriceX96: poolState?.sqrtPriceX96 ?? 0n,
    liquidity: poolState?.liquidity ?? 0n,
    tick: poolState?.tick ?? 0,
    amountIn,
    slippageTolerance: DEFAULT_SLIPPAGE_TOLERANCE,
  });

  // Parse amount for approvals
  const parsedAmountIn =
    amountIn && tokenIn ? parseUnits(amountIn || "0", tokenIn.decimals) : 0n;

  // For swaps, we only need to approve the input token
  // Use token0/token1 based on swap direction
  const approvalToken0 = zeroForOne ? tokenIn : undefined;
  const approvalToken1 = zeroForOne ? undefined : tokenIn;
  const amount0Max = zeroForOne ? parsedAmountIn : 0n;
  const amount1Max = zeroForOne ? 0n : parsedAmountIn;

  // Approval flow - targeting Universal Router for swaps
  const { currentStep, refetchAllowances } = useApprovalFlow({
    token0Address: approvalToken0?.address,
    token1Address: approvalToken1?.address,
    amount0Max,
    amount1Max,
    targetContract: "UNIVERSAL_ROUTER",
  });

  // Swap transaction
  const {
    swap,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: swapError,
    reset: resetSwap,
  } = useSwapTransaction({
    poolKey,
    zeroForOne,
    amountIn: parsedAmountIn,
    amountOutMinimum: quote?.minimumAmountOut ?? 0n,
  });

  // Reset form after successful swap
  useEffect(() => {
    if (isSuccess) {
      setAmountIn("");
    }
  }, [isSuccess]);

  const handleAmountInChange = useCallback(
    (value: string) => {
      setAmountIn(value);
      resetSwap();
    },
    [resetSwap],
  );

  const handleTokenInSelect = useCallback((token: TokenData) => {
    setTokenIn(token);
    setAmountIn("");
  }, []);

  const handleTokenOutSelect = useCallback((token: TokenData) => {
    setTokenOut(token);
    setAmountIn("");
  }, []);

  const handleSwapDirection = useCallback(() => {
    const tempToken = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(tempToken);
    setAmountIn("");
    resetSwap();
  }, [tokenIn, tokenOut, resetSwap]);

  const canSwap =
    isConnected &&
    quote &&
    currentStep === "ready" &&
    !isPending &&
    !isConfirming;

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (!amountIn || amountIn === "0") return "Enter an amount";
    if (poolLoading) return "Loading...";
    if (!quote) return "Insufficient liquidity";
    if (currentStep !== "ready") return "Approve token first";
    if (isPending) return "Confirm in wallet...";
    if (isConfirming) return "Swapping...";
    if (isSuccess) return "Success!";
    return "Swap";
  };

  // Format output amount for display
  const amountOut =
    quote && tokenOut ? formatUnits(quote.amountOut, tokenOut.decimals) : "";

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Swap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TokenAmountInput
          label="You pay"
          token={tokenIn}
          amount={amountIn}
          onAmountChange={handleAmountInChange}
          onTokenSelect={handleTokenInSelect}
          tokens={tokens.filter((t) => t.address !== tokenOut?.address)}
          disabled={!isConnected || isPending || isConfirming}
        />

        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full p-2"
            onClick={handleSwapDirection}
            disabled={isPending || isConfirming}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        <TokenAmountInput
          label="You receive"
          token={tokenOut}
          amount={amountOut}
          onAmountChange={() => {}}
          onTokenSelect={handleTokenOutSelect}
          tokens={tokens.filter((t) => t.address !== tokenIn?.address)}
          disabled={!isConnected || isPending || isConfirming}
          readOnly
        />

        {poolLoading && (
          <div className="text-center text-sm text-muted-foreground">
            Loading pool state...
          </div>
        )}

        {quote && (
          <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span>{quote.executionPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum received</span>
              <span>
                {tokenOut
                  ? formatUnits(quote.minimumAmountOut, tokenOut.decimals)
                  : "0"}{" "}
                {tokenOut?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slippage tolerance</span>
              <span>{DEFAULT_SLIPPAGE_TOLERANCE / 100}%</span>
            </div>
          </div>
        )}

        {isConnected && currentStep !== "ready" && tokenIn && (
          <ApprovalFlow
            currentStep={currentStep}
            token0Address={zeroForOne ? tokenIn.address : undefined}
            token1Address={zeroForOne ? undefined : tokenIn.address}
            token0Symbol={zeroForOne ? tokenIn.symbol : undefined}
            token1Symbol={zeroForOne ? undefined : tokenIn.symbol}
            onApprovalComplete={refetchAllowances}
            targetContract="UNIVERSAL_ROUTER"
          />
        )}

        {swapError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {swapError.message}
          </div>
        )}

        <Button
          type="button"
          className="w-full"
          disabled={!canSwap}
          onClick={swap}
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
