/**
 * Railway: garante DATABASE_URL Mongo com /dbname e corre `prisma db push`.
 * Substitua `npx prisma db push` no start por `npx tsx scripts/prisma-db-push.ts`.
 */
import { spawnSync } from "node:child_process";

import dotenv from "dotenv";
import { normalizeMongoDatabaseUrl } from "../server/mongo-url";

dotenv.config({ path: ".env.local" });
dotenv.config();

const raw = process.env.DATABASE_URL;
if (!raw?.trim()) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const dbName = process.env.MONGO_DATABASE?.trim() || "nautic";
const fixed = normalizeMongoDatabaseUrl(raw, dbName);
if (fixed !== raw) {
  console.warn(
    `[db] DATABASE_URL sem nome da base; usando /${dbName} (MONGO_DATABASE ou default nautic).`,
  );
  process.env.DATABASE_URL = fixed;
}

const r = spawnSync("npx", ["prisma", "db", "push"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(r.status === null ? 1 : r.status);
