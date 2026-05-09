/**
 * Prisma MongoDB exige nome da base no connection string (/dbname após host:port).
 * Railway costuma dar só host:port — isto acrescenta o segmento antes de ? ou #.
 *
 * Se `new URL()` falhar (password com caracteres não escapados, etc.), usa fallback
 * por string para ainda conseguir inserir `/dbname`.
 */
function appendMissingMongoPath(raw: string, dbName: string): string {
  const schemeMatch = raw.match(/^mongodb(\+srv)?:\/\//i);
  if (!schemeMatch) return raw;
  const prefix = schemeMatch[0];
  const rest = raw.slice(prefix.length);

  const boundary = rest.search(/[/?#]/);
  if (boundary === -1) {
    return `${prefix}${rest}/${dbName}`;
  }
  const delim = rest[boundary];
  if (delim === "?" || delim === "#") {
    const auth = rest.slice(0, boundary);
    return `${prefix}${auth}/${dbName}${rest.slice(boundary)}`;
  }
  // delim === '/'
  const auth = rest.slice(0, boundary);
  const afterFirstSlash = rest.slice(boundary + 1);
  if (afterFirstSlash.startsWith("?") || afterFirstSlash.startsWith("#")) {
    return `${prefix}${auth}/${dbName}${afterFirstSlash}`;
  }
  const pathBoundary = afterFirstSlash.search(/[?#]/);
  const pathOnly =
    pathBoundary === -1 ? afterFirstSlash : afterFirstSlash.slice(0, pathBoundary);
  const pathRest = pathBoundary === -1 ? "" : afterFirstSlash.slice(pathBoundary);
  const firstSeg = pathOnly.split("/").find((s) => s.length > 0) ?? "";
  if (firstSeg) return raw;
  return `${prefix}${auth}/${dbName}${pathRest}`;
}

export function normalizeMongoDatabaseUrl(raw: string, dbName: string): string {
  const name = dbName.trim() || "nautic";
  if (!raw?.trim()) return raw;
  const input = raw.trim();

  try {
    const u = new URL(input);
    const firstSegment = u.pathname.replace(/^\//, "").split("/")[0] ?? "";
    if (firstSegment.length > 0) return input;

    u.pathname = `/${name}`;
    return u.href;
  } catch {
    return appendMissingMongoPath(input, name);
  }
}
