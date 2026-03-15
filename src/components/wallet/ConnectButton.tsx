import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { Button } from "@/components/ui/Button";
import { erc20Abi } from "@/abi/erc20";
import { TUSD } from "@/constants/markets";
import { useMintCollateral } from "@/hooks/useMintCollateral";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { getExplorerTxUrl } from "@/utils/explorer";

const LOW_BALANCE_THRESHOLD = 10_000;
const MINT_AMOUNT = "1000000";

export function ConnectButton() {
  const { address, isConnected, isInitializing, resetAccount } = useSmartAccount();
  const [copied, setCopied] = useState(false);

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: TUSD.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { mint, hash, isPending, isConfirming, isSuccess, error, reset } =
    useMintCollateral();

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Funded!", {
        description: `${Number(MINT_AMOUNT).toLocaleString()} TUSD minted`,
        action: {
          label: "View tx",
          onClick: () => window.open(getExplorerTxUrl(hash, 1301), "_blank"),
        },
      });
      refetchBalance();
      reset();
    }
  }, [isSuccess, hash, refetchBalance, reset]);

  useEffect(() => {
    if (error) {
      toast.error("Funding failed", { description: error.message });
      reset();
    }
  }, [error, reset]);

  if (isInitializing) {
    return (
      <Button variant="outline" size="sm" disabled>
        Initializing...
      </Button>
    );
  }

  if (!isConnected || !address) {
    return (
      <Button variant="outline" size="sm" disabled>
        No Account
      </Button>
    );
  }

  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    if (window.confirm("Reset your account? This will generate a new private key and address.")) {
      resetAccount();
    }
  };

  const isMinting = isPending || isConfirming;
  const formattedBalance = balance !== undefined
    ? Number(formatUnits(balance, TUSD.decimals))
    : undefined;
  const isLowBalance = formattedBalance === undefined || formattedBalance < LOW_BALANCE_THRESHOLD;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy} title="Copy address">
        {copied ? "Copied!" : truncated}
      </Button>

      {isMinting ? (
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Funding...
        </Button>
      ) : isLowBalance ? (
        <Button variant="default" size="sm" onClick={() => mint(MINT_AMOUNT)}>
          Get Funded
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          {formattedBalance!.toLocaleString()} TUSD
        </Button>
      )}

      <Button variant="ghost" size="sm" onClick={handleReset} title="Reset account">
        Reset
      </Button>
    </div>
  );
}
