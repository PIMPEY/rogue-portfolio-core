import { defineConfig } from "prisma/config";

const schemaFile = process.env.RAILWAY_ENVIRONMENT ? "prisma/schema.prisma.railway" : "prisma/schema.prisma";

export default defineConfig({
  schema: schemaFile,
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || "file:./dev.db",
  },
});
