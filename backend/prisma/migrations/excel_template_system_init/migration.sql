-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('REVENUE', 'BURN', 'TRACTION', 'HEADCOUNT', 'COGS', 'EBITDA');

-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "snapshotDate" TIMESTAMP(3),
ADD COLUMN     "cashAtSnapshot" DOUBLE PRECISION,
ADD COLUMN     "monthlyBurn" DOUBLE PRECISION,
ADD COLUMN     "calculatedRunwayMonths" DOUBLE PRECISION,
ADD COLUMN     "customersAtSnapshot" INTEGER,
ADD COLUMN     "arrAtSnapshot" DOUBLE PRECISION,
ADD COLUMN     "liquidityExpectation" TEXT,
ADD COLUMN     "expectedLiquidityDate" TIMESTAMP(3),
ADD COLUMN     "expectedLiquidityMultiple" DOUBLE PRECISION;