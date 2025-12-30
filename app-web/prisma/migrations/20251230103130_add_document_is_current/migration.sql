/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Document` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investmentId" TEXT NOT NULL,
    "actionRequiredId" TEXT,
    "action" TEXT NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "rationale" TEXT,
    "changedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AuditLog" ("action", "actionRequiredId", "changedBy", "createdAt", "fieldName", "id", "investmentId", "newValue", "oldValue", "rationale") SELECT "action", "actionRequiredId", "changedBy", "createdAt", "fieldName", "id", "investmentId", "newValue", "oldValue", "rationale" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE TABLE "new_Cashflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountLcl" REAL,
    "amountEur" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cashflow_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cashflow" ("amountEur", "amountLcl", "createdAt", "date", "description", "id", "investmentId", "type") SELECT "amountEur", "amountLcl", "createdAt", "date", "description", "id", "investmentId", "type" FROM "Cashflow";
DROP TABLE "Cashflow";
ALTER TABLE "new_Cashflow" RENAME TO "Cashflow";
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "versionType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Document_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("fileName", "filePath", "fileSize", "id", "investmentId", "isCurrent", "type", "uploadedBy", "versionType") SELECT "fileName", "filePath", "fileSize", "id", "investmentId", "isCurrent", "type", "uploadedBy", "versionType" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
