import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSmartAccount } from "@/hooks/useSmartAccount";

export function ConnectButton() {
  const { address, isConnected, isInitializing, resetAccount } = useSmartAccount();
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy} title="Copy address">
        {copied ? "Copied!" : truncated}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleReset} title="Reset account">
        Reset
      </Button>
    </div>
  );
}
