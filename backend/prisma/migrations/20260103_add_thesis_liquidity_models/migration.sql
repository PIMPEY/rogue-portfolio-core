-- CreateTable
CREATE TABLE "InvestmentThesis" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "entryValuation" DOUBLE PRECISION,
    "isPostMoney" BOOLEAN NOT NULL DEFAULT false,
    "snapshotDate" TIMESTAMP(3),
    "snapshotCash" DOUBLE PRECISION,
    "snapshotBurn" DOUBLE PRECISION,
    "snapshotCustomers" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentThesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentLiquidity" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "expectedYear" INTEGER NOT NULL,
    "expectedValuation" DOUBLE PRECISION,
    "expectedType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentLiquidity_pkey" PRIMARY KEY ("id")
);

-- AlterEnum
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'COGS';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'OPEX';
ALTER TYPE "MetricType" ADD VALUE IF NOT EXISTS 'EBITDA';

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentThesis_investmentId_key" ON "InvestmentThesis"("investmentId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentLiquidity_investmentId_expectedYear_key" ON "InvestmentLiquidity"("investmentId", "expectedYear");

-- AddForeignKey
ALTER TABLE "InvestmentThesis" ADD CONSTRAINT "InvestmentThesis_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentLiquidity" ADD CONSTRAINT "InvestmentLiquidity_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
