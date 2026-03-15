import { Hono } from "hono";
import { cors } from "hono/cors";
import { verifyMessage } from "viem";

type Env = {
  Bindings: {
    DB: D1Database;
    ASSETS: Fetcher;
  };
};

const app = new Hono<Env>();

app.use("/api/*", cors());

app.get("/api/markets", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT condition_id, question, collateral_address FROM markets ORDER BY created_at DESC",
  ).all();

  return c.json(results);
});

app.post("/api/markets", async (c) => {
  const body = await c.req.json<{
    conditionId: string;
    question: string;
    collateralAddress: string;
    creator: string;
    signature: string;
    message: string;
  }>();

  const {
    conditionId,
    question,
    collateralAddress,
    creator,
    signature,
    message,
  } = body;

  if (
    !conditionId ||
    !question ||
    !collateralAddress ||
    !creator ||
    !signature ||
    !message
  ) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Verify EIP-191 signature
  const valid = await verifyMessage({
    address: creator as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
  });

  if (!valid) {
    return c.json({ error: "Invalid signature" }, 401);
  }

  await c.env.DB.prepare(
    "INSERT OR IGNORE INTO markets (condition_id, question, collateral_address, creator) VALUES (?, ?, ?, ?)",
  )
    .bind(conditionId, question, collateralAddress, creator)
    .run();

  return c.json({ ok: true }, 201);
});

// SPA fallback
app.all("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
