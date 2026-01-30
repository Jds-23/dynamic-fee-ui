import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import type { Address } from "viem";
import {
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi } from "@/abi/erc20";
import { permit2Abi } from "@/abi/permit2";
import { Button } from "@/components/ui/Button";
import { getAddress } from "@/constants/addresses";
import { MAX_UINT160, MAX_UINT256 } from "@/constants/defaults";
import type { ApprovalStep } from "@/types";

interface ApprovalFlowProps {
  currentStep: ApprovalStep;
  token0Address?: Address;
  token1Address?: Address;
  token0Symbol?: string;
  token1Symbol?: string;
  onApprovalComplete: () => void;
  targetContract?: "POSITION_MANAGER" | "UNIVERSAL_ROUTER";
}

const STEP_LABELS: Record<ApprovalStep, string> = {
  token0_to_permit2: "Approve Token 0 for Permit2",
  token1_to_permit2: "Approve Token 1 for Permit2",
  permit2_token0: "Permit Token 0 for Position Manager",
  permit2_token1: "Permit Token 1 for Position Manager",
  ready: "Ready",
};

export function ApprovalFlow({
  currentStep,
  token0Address,
  token1Address,
  token0Symbol,
  token1Symbol,
  onApprovalComplete,
  targetContract = "POSITION_MANAGER",
}: ApprovalFlowProps) {
  const chainId = useChainId();

  let permit2Address: Address | undefined;
  let targetAddress: Address | undefined;

  try {
    permit2Address = getAddress(chainId, "PERMIT2");
    targetAddress = getAddress(chainId, targetContract);
  } catch {
    // Chain not supported
  }

  const targetLabel =
    targetContract === "UNIVERSAL_ROUTER"
      ? "Universal Router"
      : "Position Manager";

  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Refetch allowances when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      onApprovalComplete();
      reset();
    }
  }, [isSuccess, onApprovalComplete, reset]);

  const getStepLabel = (step: ApprovalStep): string => {
    if (step === "token0_to_permit2" && token0Symbol) {
      return `Approve ${token0Symbol} for Permit2`;
    }
    if (step === "token1_to_permit2" && token1Symbol) {
      return `Approve ${token1Symbol} for Permit2`;
    }
    if (step === "permit2_token0" && token0Symbol) {
      return `Permit ${token0Symbol} for ${targetLabel}`;
    }
    if (step === "permit2_token1" && token1Symbol) {
      return `Permit ${token1Symbol} for ${targetLabel}`;
    }
    return STEP_LABELS[step];
  };

  const handleApprove = () => {
    if (!permit2Address || !targetAddress) return;

    if (currentStep === "token0_to_permit2" && token0Address) {
      writeContract({
        address: token0Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [permit2Address, MAX_UINT256],
      });
    } else if (currentStep === "token1_to_permit2" && token1Address) {
      writeContract({
        address: token1Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [permit2Address, MAX_UINT256],
      });
    } else if (currentStep === "permit2_token0" && token0Address) {
      const expiration = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
      writeContract({
        address: permit2Address,
        abi: permit2Abi,
        functionName: "approve",
        args: [token0Address, targetAddress, MAX_UINT160, expiration],
      });
    } else if (currentStep === "permit2_token1" && token1Address) {
      const expiration = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
      writeContract({
        address: permit2Address,
        abi: permit2Abi,
        functionName: "approve",
        args: [token1Address, targetAddress, MAX_UINT160, expiration],
      });
    }
  };

  if (currentStep === "ready") {
    return (
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle className="h-5 w-5" />
        <span>All approvals complete</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        Step: {getStepLabel(currentStep)}
      </div>
      <Button
        type="button"
        onClick={handleApprove}
        disabled={isPending || isConfirming}
        className="w-full"
        variant="secondary"
      >
        {isPending || isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isPending ? "Confirm in wallet..." : "Confirming..."}
          </>
        ) : (
          getStepLabel(currentStep)
        )}
      </Button>
    </div>
  );
}
