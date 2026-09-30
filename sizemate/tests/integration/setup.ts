import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PrismaClient } from "@prisma/client";

/** A fresh SQLite database per test file, migrated with the real migrations. */
export async function createTestDatabase(): Promise<string> {
  const url = `file:${join(mkdtempSync(join(tmpdir(), "sizemate-")), "test.sqlite")}`;
  const client = new PrismaClient({ datasourceUrl: url });
  const dir = join(process.cwd(), "prisma", "migrations");
  for (const migration of readdirSync(dir).filter((name) => /^\d/.test(name)).sort()) {
    const sql = readFileSync(join(dir, migration, "migration.sql"), "utf8");
    for (const statement of sql.split(/;\s*$/m).map((s) => s.trim()).filter(Boolean)) {
      await client.$executeRawUnsafe(statement);
    }
  }
  await client.$disconnect();
  return url;
}
