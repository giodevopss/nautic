/**
 * Envio de `public/videos/` e `public/images/` para bucket S3-compatível (Tigris na Railway).
 *
 * Variáveis (em `.env`, `.env.local` ou shell):
 *   STORAGE_ENDPOINT   → default https://t3.storageapi.dev
 *   STORAGE_BUCKET     → nome do bucket
 *   STORAGE_ACCESS_KEY → access key da Tigris/Railway
 *   STORAGE_SECRET_KEY → secret key
 *   AWS_REGION         → opcional (default auto)
 *
 * Uso:
 *   npx tsx scripts/upload-media-tigris.ts
 *   npx tsx scripts/upload-media-tigris.ts --dry-run
 */

import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as path from "node:path";
import process from "node:process";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const ENDPOINT =
  process.env.STORAGE_ENDPOINT?.trim() || "https://t3.storageapi.dev";
const BUCKET =
  process.env.STORAGE_BUCKET?.trim() || "wrapped-pannikin-ta6us77k";
const ACCESS_KEY =
  process.env.STORAGE_ACCESS_KEY?.trim() || process.env.AWS_ACCESS_KEY_ID?.trim();
const SECRET_KEY =
  process.env.STORAGE_SECRET_KEY?.trim() || process.env.AWS_SECRET_ACCESS_KEY?.trim();
const REGION = process.env.AWS_REGION?.trim() || "auto";
const FORCE_PATH_STYLE = process.env.STORAGE_FORCE_PATH_STYLE !== "false";

const dryRun =
  process.argv.includes("--dry-run") || process.env.DRY_RUN === "1";

function contentType(ext: string): string {
  const m: Record<string, string> = {
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".gif": "image/gif",
  };
  return m[ext.toLowerCase()] ?? "application/octet-stream";
}

async function walkFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await fsPromises.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walkFiles(full)));
    else out.push(full);
  }
  return out;
}

function shouldSkip(posixRel: string): boolean {
  if (posixRel.endsWith("/.gitkeep") || posixRel.endsWith(".gitkeep")) return true;
  if (posixRel.endsWith("/README.md") || posixRel.endsWith("README.md")) return true;
  return false;
}

async function main() {
  if (!dryRun && (!ACCESS_KEY || !SECRET_KEY)) {
    console.error(
      "Credenciais em falta. Defina STORAGE_ACCESS_KEY e STORAGE_SECRET_KEY\n" +
        "(ou AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY). Obtenha as chaves na Railway/Tigris.",
    );
    process.exit(1);
  }

  const client =
    ACCESS_KEY && SECRET_KEY
      ? new S3Client({
    endpoint: ENDPOINT,
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
    forcePathStyle: FORCE_PATH_STYLE,
  })
      : null;

  const publicDir = path.join(process.cwd(), "public");
  const roots = ["videos", "images"];

  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Bucket:   ${BUCKET}`);
  console.log(`Mode:     ${dryRun ? "dry-run (sem upload)" : "upload"}`);
  console.log("");

  let count = 0;
  let bytes = 0;

  for (const root of roots) {
    const base = path.join(publicDir, root);
    const files = await walkFiles(base);
    for (const absPath of files) {
      const rel = path.relative(publicDir, absPath);
      const key = rel.split(path.sep).join("/");

      if (shouldSkip(key)) continue;

      const stat = await fsPromises.stat(absPath);
      if (!stat.isFile()) continue;

      count += 1;
      bytes += stat.size;

      if (dryRun || !client) {
        console.log(`  [dry-run] ${key} (${stat.size} bytes)`);
        continue;
      }

      const stream = fs.createReadStream(absPath);
      console.log(`  Uploading ${key} (${Math.round(stat.size / 1024)} KB)...`);

      await client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: stream,
          ContentType: contentType(path.extname(absPath)),
        }),
      );
    }
  }

  console.log("");
  console.log(
    `${dryRun ? "Simulação:" : "Concluído:"} ${count} ficheiro(s), ~${Math.round(bytes / 1024 / 1024)} MB.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
