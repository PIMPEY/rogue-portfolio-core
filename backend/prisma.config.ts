import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma.railway",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || "file:./dev.db",
  },
});
