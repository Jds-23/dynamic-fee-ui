import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/config/wagmi";
import { SmartAccountProvider } from "./SmartAccountProvider";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SmartAccountProvider>{children}</SmartAccountProvider>
        <Toaster position="bottom-right" richColors />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
