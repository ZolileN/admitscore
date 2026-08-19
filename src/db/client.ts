import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "fs";
import { dirname } from "path";
import * as schema from "./schema";

function getDatabaseUrl() {
  return process.env.TURSO_DATABASE_URL || "file:./data/admitscore.db";
}

export function createDbClient() {
  const url = getDatabaseUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url.startsWith("file:")) {
    const filePath = url.replace("file:", "");
    mkdirSync(dirname(filePath), { recursive: true });
  }

  const client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });

  return drizzle(client, { schema });
}

export const db = createDbClient();
