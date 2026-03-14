import { useState, useMemo, useEffect } from "react";
import { parseUnits } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCreateMarket } from "@/hooks/market/useCreateMarket";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { TUSD } from "@/constants/markets";
import { computeConditionId } from "@/lib/market";
import { postMarket } from "@/lib/api";
import { signMessage } from "@/lib/smartAccount";
import { getExplorerTxUrl } from "@/utils/explorer";

interface CreateMarketFormProps {
  onCreated?: (conditionId: string) => void;
}

export function CreateMarketForm({ onCreated }: CreateMarketFormProps = {}) {
  const [question, setQuestion] = useState("");
  const [fundingStr, setFundingStr] = useState("");
  const [postError, setPostError] = useState<string | null>(null);

  const { address, privateKey } = useSmartAccount();
  const queryClient = useQueryClient();

  const conditionId = useMemo(() => {
    if (!question.trim()) return undefined;
    return computeConditionId(question.trim());
  }, [question]);

  const fundingAmount = useMemo(() => {
    if (!fundingStr || Number.isNaN(Number(fundingStr))) return 0n;
    return parseUnits(fundingStr, TUSD.decimals);
  }, [fundingStr]);

  const create = useCreateMarket({
    conditionId: conditionId ?? "0x",
    collateralAddress: TUSD.address,
    fundingAmount,
  });

  // Post to API after successful on-chain tx
  useEffect(() => {
    if (!create.isSuccess || !conditionId || !address || !privateKey) return;
    setPostError(null);

    const signFn = async (args: { message: string }) => {
      return signMessage(privateKey, args.message);
    };

    postMarket(
      {
        conditionId,
        question: question.trim(),
        collateralAddress: TUSD.address,
        creator: address,
      },
      signFn,
    )
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["markets"] });
        if (conditionId) onCreated?.(conditionId);
      })
      .catch((err) => setPostError((err as Error).message));
  }, [create.isSuccess, conditionId, address, privateKey, question, queryClient, onCreated]);

  const isPending = create.isPending || create.isConfirming;

  return (
    <div className="py-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Create Market</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question */}
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Question</label>
            <input
              type="text"
              placeholder="Will ETH reach $10k by end of 2025?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* Condition ID preview */}
          {conditionId && (
            <div className="rounded-md bg-muted p-2">
              <span className="text-xs text-muted-foreground">Condition ID: </span>
              <span className="break-all font-mono text-xs">{conditionId}</span>
            </div>
          )}

          {/* Funding amount */}
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Initial Funding ({TUSD.symbol})
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={fundingStr}
              onChange={(e) => setFundingStr(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* Action */}
          <Button
            className="w-full"
            onClick={create.createMarket}
            disabled={isPending || !conditionId || fundingAmount === 0n}
          >
            {isPending ? "Creating..." : "Create Market"}
          </Button>

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
          {create.error && (
            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
              {(create.error as Error).message?.slice(0, 100)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
