import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import { v4SwapRouterAbi } from "@/abi/v4SwapRouter";
import { PM_CONTRACTS } from "@/constants/markets";
import { DEFAULT_DEADLINE_MINUTES } from "@/constants/defaults";
import { buildMarketPoolKey } from "@/lib/market";
import type { MarketWithPrices } from "@/types";

interface UseMarketTradeParams {
  market: MarketWithPrices;
  side: "YES" | "NO";
  direction: "buy" | "sell";
  amountIn: bigint;
  minAmountOut: bigint;
}

export function useMarketTrade({ market, side, direction, amountIn, minAmountOut }: UseMarketTradeParams) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: unichainSepolia.id,
  });

  function trade() {
    if (!market.state || !address) return;

    const outcomeToken = side === "YES" ? market.state.yesTokenAddress : market.state.noTokenAddress;
    const collateral = market.state.collateralAddress;

    // buy: collateral → outcome, sell: outcome → collateral
    const inputToken = direction === "buy" ? collateral : outcomeToken;
    const poolKey = buildMarketPoolKey(collateral, outcomeToken, PM_CONTRACTS.conditionalLMSRHook);

    // zeroForOne = true when input is currency0
    const zeroForOne = inputToken.toLowerCase() === poolKey.currency0.toLowerCase();

    const deadline = BigInt(Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_MINUTES * 60);

    writeContract({
      address: PM_CONTRACTS.v4SwapRouter,
      abi: v4SwapRouterAbi,
      functionName: "swapExactTokensForTokens",
      args: [amountIn, minAmountOut, zeroForOne, poolKey, "0x", address, deadline],
      chainId: unichainSepolia.id,
    });
  }

  return { trade, hash, isPending, isConfirming, isSuccess, error, reset };
}
