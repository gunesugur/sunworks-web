import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createClient() {
  // DATABASE_URL lets tests and production point at another database.
  return new PrismaClient(process.env.DATABASE_URL ? { datasourceUrl: process.env.DATABASE_URL } : undefined);
}

const prisma = global.prismaGlobal ?? createClient();

if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma;

export default prisma;
