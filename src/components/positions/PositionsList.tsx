import { useAccount } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUserPositions } from "@/hooks/positions/useUserPositions";
import { PositionCard } from "./PositionCard";

export function PositionsList() {
  const { isConnected } = useAccount();
  const { positions, isLoading, error, refetch } = useUserPositions();

  if (!isConnected) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>My Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Connect your wallet to view your positions
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>My Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>My Positions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-destructive">{error.message}</p>
          <Button onClick={() => refetch()} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>My Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No positions found. Add liquidity to create your first position.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Positions</h2>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {positions.map((position) => (
          <PositionCard key={position.tokenId} position={position} />
        ))}
      </div>
    </div>
  );
}
