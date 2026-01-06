-- AlterEnum
ALTER TYPE "DocumentType" RENAME TO "DocumentType_old";

CREATE TYPE "DocumentType" AS ENUM ('PITCH_DECK', 'FINANCIAL_MODEL', 'HISTORICAL_FINANCIALS', 'LEGAL_SHAREHOLDING', 'MARKET_RESEARCH', 'OTHER');

ALTER TABLE "Document" ALTER COLUMN "type" TYPE "DocumentType" USING "type"::text::"DocumentType";

DROP TYPE "DocumentType_old";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "checksum" TEXT NOT NULL DEFAULT '',
ADD COLUMN "contentType" TEXT NOT NULL DEFAULT '',
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'uploaded',
ADD COLUMN "storageUrl" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "ReviewJob" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "resultLocation" TEXT,
    "summaryJson" JSONB,
    "docChecksums" TEXT NOT NULL,
    "reviewConfigVersion" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReviewJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewJob_investmentId_idx" ON "ReviewJob"("investmentId");

-- AddForeignKey
ALTER TABLE "ReviewJob" ADD CONSTRAINT "ReviewJob_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
