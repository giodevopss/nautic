/**
 * Escreve no stdout a DATABASE_URL Mongo já normalizada (com /dbname).
 * Usado pelo start.sh antes de `prisma generate` / outros comandos Prisma.
 */
import dotenv from "dotenv";

import { normalizeMongoDatabaseUrl } from "../server/mongo-url";

dotenv.config({ path: ".env.local" });
dotenv.config();

const raw = process.env.DATABASE_URL;
if (!raw?.trim()) {
  process.exit(1);
}

const dbName = process.env.MONGO_DATABASE?.trim() || "nautic";
process.stdout.write(normalizeMongoDatabaseUrl(raw, dbName));
