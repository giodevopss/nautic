import { normalizeMongoDatabaseUrl } from "./mongo-url";

const dbName = process.env.MONGO_DATABASE?.trim() || "nautic";
const raw = process.env.DATABASE_URL;
if (!raw?.trim()) {
  //
} else {
  const normalized = normalizeMongoDatabaseUrl(raw, dbName);
  if (normalized !== raw) {
    console.warn(
      `[db] DATABASE_URL sem nome da base (/dbname). Usando "/" + "${dbName}" (defina MONGO_DATABASE para mudar).`,
    );
    process.env.DATABASE_URL = normalized;
  }
}
