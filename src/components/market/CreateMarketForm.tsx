import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { parseUnits } from "viem";
import { MintGate } from "@/components/collateral/MintGate";
import { Button } from "@/components/ui/Button";
import { TUSD } from "@/constants/markets";
import { getRandomQuestion } from "@/constants/oscarQuestions";
import { useCreateMarket } from "@/hooks/market/useCreateMarket";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { postMarket } from "@/lib/api";
import { randomUniverseId } from "@/lib/market";
import { signMessage } from "@/lib/smartAccount";
import { getExplorerTxUrl } from "@/utils/explorer";

const QUICK_AMOUNTS = [1, 5, 10, 100] as const;

interface CreateMarketFormProps {
  onCreated?: (universeId: string) => void;
}

export function CreateMarketForm({ onCreated }: CreateMarketFormProps = {}) {
  const [question, setQuestion] = useState(getRandomQuestion);
  const [fundingStr, setFundingStr] = useState("10000");
  const [postError, setPostError] = useState<string | null>(null);

  const { address, privateKey } = useSmartAccount();
  const queryClient = useQueryClient();

  const universeId = useMemo(() => {
    if (!question.trim()) return undefined;
    return randomUniverseId();
  }, [question]);

  const fundingAmount = useMemo(() => {
    if (!fundingStr || Number.isNaN(Number(fundingStr))) return 0n;
    return parseUnits(fundingStr, TUSD.decimals);
  }, [fundingStr]);

  const create = useCreateMarket({
    universeId: universeId ?? "0x",
    collateralAddress: TUSD.address,
    fundingAmount,
  });

  const handleCreate = () => {
    if (!universeId || !address || !privateKey) return;
    setPostError(null);

    create.createMarket({
      onSuccess: async () => {
        const signFn = async (args: { message: string }) => {
          return signMessage(privateKey, args.message);
        };

        try {
          await postMarket(
            {
              universeId,
              question: question.trim(),
              collateralAddress: TUSD.address,
              creator: address,
            },
            signFn,
          );
          queryClient.invalidateQueries({ queryKey: ["markets"] });
          onCreated?.(universeId);
        } catch (err) {
          setPostError((err as Error).message);
        }
      },
    });
  };

  const isPending = create.isPending || create.isConfirming;

  function addFunding(increment: number) {
    const current = Number(fundingStr) || 0;
    setFundingStr(String(current + increment));
  }

  return (
    <div className="py-8 w-full">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold leading-tight">
            Create Market
          </h3>
        </div>

        {/* Question */}
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            Question
          </span>
          <textarea
            rows={2}
            placeholder="Will ETH reach $10k by end of 2025?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mt-1 w-full resize-none bg-transparent text-xl font-semibold placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>

        {/* Funding amount */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Initial Funding ({TUSD.symbol})
            </span>
            <div className="relative">
              <span className="pointer-events-none text-4xl font-semibold">
                ${fundingStr || "0"}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={fundingStr}
                onChange={(e) => setFundingStr(e.target.value)}
                className="absolute inset-0 w-full bg-transparent text-right text-4xl font-semibold opacity-0"
              />
            </div>
          </div>

          {/* Quick-add buttons */}
          <div className="mt-3 flex justify-end gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => addFunding(amt)}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
              >
                +${amt}
              </button>
            ))}
            <button
              type="button"
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
            >
              Max
            </button>
          </div>
        </div>

        {/* Action */}
        <MintGate amountNeeded={fundingAmount}>
          {({ insufficientBalance }) => (
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={
                isPending ||
                !universeId ||
                fundingAmount === 0n ||
                insufficientBalance
              }
            >
              {isPending ? "Creating..." : "Create Market"}
            </Button>
          )}
        </MintGate>

        {/* Status */}
        {create.isSuccess && create.hash && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
            Market created!{" "}
            <a
              href={getExplorerTxUrl(create.hash, 1301)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View tx
            </a>
          </div>
        )}
        {postError && (
          <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-400">
            Market created on-chain but failed to register: {postError}
          </div>
        )}
        {create.retryCountdown > 0 && (
          <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-400">
            Transaction failed, retrying in {create.retryCountdown}s… (attempt{" "}
            {create.retryAttempt}/3)
          </div>
        )}
        {create.error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            {(create.error as Error).message?.slice(0, 100)}
          </div>
        )}
      </div>
    </div>
  );
}
