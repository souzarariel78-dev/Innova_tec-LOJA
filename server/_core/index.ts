import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { createCorsMiddleware } from "./cors";
import { clearLegacySessionCookie } from "./cookies";
import { sdk } from "./sdk";
import { deleteSellerProductOverride, listSellerProductOverrides, upsertSellerProductOverride } from "../db";

type SellerOverridePayload = { productId: string; description?: string; imageUri?: string; imageUris?: string; isDeleted?: boolean };
const memorySellerOverrides = new Map<string, SellerOverridePayload>();

async function getStoreOwnerId(req: express.Request) {
  try {
    const user = await sdk.authenticateRequest(req);
    return user?.openId ?? "demo-owner";
  } catch {
    return "demo-owner";
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(createCorsMiddleware());
  app.use(clearLegacySessionCookie());

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.get("/api/seller/products/overrides", async (req, res) => {
    const ownerOpenId = await getStoreOwnerId(req);
    let persisted: Awaited<ReturnType<typeof listSellerProductOverrides>> = [];
    try {
      persisted = await listSellerProductOverrides(ownerOpenId);
    } catch {
      console.warn("[seller] database unavailable while reading overrides");
    }
    const fallback = [...memorySellerOverrides.entries()]
      .filter(([key]) => key.startsWith(`${ownerOpenId}:`))
      .map(([, item]) => item);
    res.json({ overrides: persisted.length > 0 ? persisted : fallback });
  });

  app.put("/api/seller/products/:productId", async (req, res) => {
    const productId = String(req.params.productId || "").slice(0, 128);
    const description = typeof req.body?.description === "string" ? req.body.description.slice(0, 20000) : undefined;
    const imageUris = Array.isArray(req.body?.imageUris)
      ? req.body.imageUris.filter((item: unknown): item is string => typeof item === "string").slice(0, 3).map((item: string) => item.slice(0, 4_000_000))
      : [];
    const imageUri = imageUris[0] ?? (typeof req.body?.imageUri === "string" ? req.body.imageUri.slice(0, 4_000_000) : undefined);
    if (!productId || (!description && !imageUri && imageUris.length === 0)) {
      res.status(400).json({ error: "Informe a descrição ou a foto do anúncio." });
      return;
    }
    const ownerOpenId = await getStoreOwnerId(req);
    const id = `${ownerOpenId}:${productId}`;
    const serializedImages = imageUris.length ? JSON.stringify(imageUris) : undefined;
    const payload = { productId, description, imageUri, imageUris: serializedImages };
    let stored: Awaited<ReturnType<typeof upsertSellerProductOverride>> = null;
    try {
      stored = await upsertSellerProductOverride({ id, ownerOpenId, productId, description, imageUri, imageUris: serializedImages });
    } catch {
      console.warn("[seller] database unavailable while saving override");
    }
    if (!stored) memorySellerOverrides.set(id, payload);
    res.json({ ok: true, synced: true, override: stored ?? payload, updatedAt: new Date().toISOString() });
  });

  app.delete("/api/seller/products/:productId", async (req, res) => {
    const productId = String(req.params.productId || "").slice(0, 128);
    if (!productId) {
      res.status(400).json({ error: "Produto inválido." });
      return;
    }
    const ownerOpenId = await getStoreOwnerId(req);
    const id = `${ownerOpenId}:${productId}`;
    let stored: { productId: string; isDeleted: boolean } | null = null;
    try {
      stored = await deleteSellerProductOverride(ownerOpenId, productId);
    } catch {
      console.warn("[seller] database unavailable while deleting product");
    }
    memorySellerOverrides.set(id, { productId, isDeleted: true });
    res.json({ ok: true, deleted: true, override: stored ?? { productId, isDeleted: true } });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const port = parseInt(process.env.PORT || "3000");
  server.listen(port, () => {
    console.log("[api] server listening");
  });
}

startServer().catch(() => {
  console.error("[api] server failed to start");
});
