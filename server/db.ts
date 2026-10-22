import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertSellerProductOverride, InsertUser, sellerProductOverrides, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch {
      console.warn("[Database] Failed to connect");
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user");
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listSellerProductOverrides(ownerOpenId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sellerProductOverrides).where(eq(sellerProductOverrides.ownerOpenId, ownerOpenId));
}

export async function upsertSellerProductOverride(input: InsertSellerProductOverride) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(sellerProductOverrides).values(input).onDuplicateKeyUpdate({
    set: {
      description: input.description,
      imageUri: input.imageUri,
      imageUris: input.imageUris,
      updatedAt: new Date(),
    },
  });
  const result = await db.select().from(sellerProductOverrides).where(and(
    eq(sellerProductOverrides.ownerOpenId, input.ownerOpenId),
    eq(sellerProductOverrides.productId, input.productId),
  )).limit(1);
  return result[0] ?? null;
}

export async function deleteSellerProductOverride(ownerOpenId: string, productId: string) {
  const db = await getDb();
  if (!db) return null;
  const id = `${ownerOpenId}:${productId}`;
  await db.insert(sellerProductOverrides).values({ id, ownerOpenId, productId, isDeleted: true }).onDuplicateKeyUpdate({
    set: { isDeleted: true, updatedAt: new Date() },
  });
  return { productId, isDeleted: true };
}
