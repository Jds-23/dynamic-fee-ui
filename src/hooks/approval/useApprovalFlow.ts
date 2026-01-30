import { useMemo } from "react";
import type { Address } from "viem";
import { useChainId } from "wagmi";
import { getAddress } from "@/constants/addresses";
import type { ApprovalStep } from "@/types";
import { useErc20Allowance } from "./useErc20Allowance";
import { usePermit2Allowance } from "./usePermit2Allowance";

interface UseApprovalFlowParams {
  token0Address?: Address;
  token1Address?: Address;
  amount0Max: bigint;
  amount1Max: bigint;
  targetContract?: "POSITION_MANAGER" | "UNIVERSAL_ROUTER";
}

interface ApprovalStatus {
  token0ToPermit2: boolean;
  token1ToPermit2: boolean;
  permit2Token0ToManager: boolean;
  permit2Token1ToManager: boolean;
}

export function useApprovalFlow({
  token0Address,
  token1Address,
  amount0Max,
  amount1Max,
  targetContract = "POSITION_MANAGER",
}: UseApprovalFlowParams) {
  const chainId = useChainId();

  let permit2Address: Address | undefined;
  let targetAddress: Address | undefined;

  try {
    permit2Address = getAddress(chainId, "PERMIT2");
    targetAddress = getAddress(chainId, targetContract);
  } catch {
    // Chain not supported
  }

  // Check ERC20 allowances to Permit2
  const { allowance: erc20Allowance0, refetch: refetchErc20_0 } =
    useErc20Allowance(token0Address, permit2Address);

  const { allowance: erc20Allowance1, refetch: refetchErc20_1 } =
    useErc20Allowance(token1Address, permit2Address);

  // Check Permit2 allowances to target contract
  const { allowance: permit2Allowance0, refetch: refetchPermit2_0 } =
    usePermit2Allowance(token0Address, targetAddress);

  const { allowance: permit2Allowance1, refetch: refetchPermit2_1 } =
    usePermit2Allowance(token1Address, targetAddress);

  // Determine approval status
  const approvalStatus: ApprovalStatus = useMemo(
    () => ({
      token0ToPermit2: (erc20Allowance0 ?? 0n) >= amount0Max,
      token1ToPermit2: (erc20Allowance1 ?? 0n) >= amount1Max,
      permit2Token0ToManager: (permit2Allowance0 ?? 0n) >= amount0Max,
      permit2Token1ToManager: (permit2Allowance1 ?? 0n) >= amount1Max,
    }),
    [
      erc20Allowance0,
      erc20Allowance1,
      permit2Allowance0,
      permit2Allowance1,
      amount0Max,
      amount1Max,
    ],
  );

  // Determine current step
  const currentStep: ApprovalStep = useMemo(() => {
    if (amount0Max === 0n && amount1Max === 0n) return "ready";
    if (amount0Max > 0n && !approvalStatus.token0ToPermit2)
      return "token0_to_permit2";
    if (amount1Max > 0n && !approvalStatus.token1ToPermit2)
      return "token1_to_permit2";
    if (amount0Max > 0n && !approvalStatus.permit2Token0ToManager)
      return "permit2_token0";
    if (amount1Max > 0n && !approvalStatus.permit2Token1ToManager)
      return "permit2_token1";
    return "ready";
  }, [approvalStatus, amount0Max, amount1Max]);

  const refetchAllowances = () => {
    refetchErc20_0();
    refetchErc20_1();
    refetchPermit2_0();
    refetchPermit2_1();
  };

  return {
    approvalStatus,
    currentStep,
    refetchAllowances,
    permit2Address,
    targetAddress,
  };
}
