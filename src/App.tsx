import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Uniswap V4 UI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Phase 2 complete - UI foundation with Tailwind CSS and shadcn/ui
              components.
            </p>
            <div className="flex items-center gap-4">
              <Button onClick={() => setCount((count) => count + 1)}>
                Count: {count}
              </Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
