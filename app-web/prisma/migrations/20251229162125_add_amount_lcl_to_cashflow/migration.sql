/*
  Warnings:

  - Added the required column `amountLcl` to the `Cashflow` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cashflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountLcl" REAL NOT NULL,
    "amountEur" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cashflow_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cashflow" ("amountEur", "amountLcl", "createdAt", "date", "description", "id", "investmentId", "type") SELECT "amountEur", "amountEur", "createdAt", "date", "description", "id", "investmentId", "type" FROM "Cashflow";
DROP TABLE "Cashflow";
ALTER TABLE "new_Cashflow" RENAME TO "Cashflow";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
