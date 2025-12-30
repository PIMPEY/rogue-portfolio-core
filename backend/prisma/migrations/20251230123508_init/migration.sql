-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('SAFE', 'CLN', 'EQUITY', 'OTHER');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('ACTIVE', 'EXITED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "InvestmentStage" AS ENUM ('PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'SERIES_D_PLUS', 'GROWTH', 'OTHER');

-- CreateEnum
CREATE TYPE "CashflowType" AS ENUM ('INITIAL_INVESTMENT', 'FOLLOW_ON', 'DISTRIBUTION', 'PARTIAL_EXIT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PITCH_DECK', 'BASE_CASE_MODEL', 'IC_MEMO', 'BUSINESS_PLAN');

-- CreateEnum
CREATE TYPE "DocumentVersionType" AS ENUM ('INITIAL', 'REVISION');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('VALUATION_UPDATE', 'INVESTMENT_CREATED', 'INVESTMENT_UPDATED', 'DOCUMENT_UPLOADED', 'CASHFLOW_ADDED', 'ACTION_REQUIRED_CREATED', 'ACTION_REQUIRED_UPDATED', 'ACTION_REQUIRED_CLEARED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('SUPPORT', 'FOLLOW_ON', 'MONITOR', 'EXIT_PREPARATION');

-- CreateEnum
CREATE TYPE "ExitType" AS ENUM ('M_AND_A', 'SECONDARY', 'IPO');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLEARED');

-- CreateEnum
CREATE TYPE "FounderUpdateStatus" AS ENUM ('SUBMITTED', 'LATE', 'OVERDUE');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('NEW', 'ACKNOWLEDGED', 'MONITORING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "FlagType" AS ENUM ('REVENUE_MISS', 'TRACTION_MISS', 'BURN_SPIKE', 'BURN_CRITICAL', 'RUNWAY_RISK', 'RUNWAY_CRITICAL', 'LATE_UPDATE');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('REVENUE', 'BURN', 'TRACTION', 'HEADCOUNT');

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "icReference" TEXT NOT NULL,
    "icApprovalDate" TIMESTAMP(3) NOT NULL,
    "investmentExecutionDate" TIMESTAMP(3) NOT NULL,
    "dealOwner" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "geography" TEXT NOT NULL,
    "stage" "InvestmentStage" NOT NULL,
    "investmentType" "InvestmentType" NOT NULL,
    "committedCapitalLcl" DOUBLE PRECISION NOT NULL,
    "deployedCapitalLcl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ownershipPercent" DOUBLE PRECISION,
    "coInvestors" TEXT,
    "hasBoardSeat" BOOLEAN NOT NULL DEFAULT false,
    "hasProRataRights" BOOLEAN NOT NULL DEFAULT false,
    "hasAntiDilutionProtection" BOOLEAN NOT NULL DEFAULT false,
    "localCurrency" TEXT NOT NULL DEFAULT 'USD',
    "investmentFxRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "investmentFxSource" TEXT,
    "valuationFxRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "valuationFxSource" TEXT,
    "roundSizeEur" DOUBLE PRECISION,
    "enterpriseValueEur" DOUBLE PRECISION,
    "currentFairValueEur" DOUBLE PRECISION NOT NULL,
    "raisedFollowOnCapital" BOOLEAN NOT NULL DEFAULT false,
    "clearProductMarketFit" BOOLEAN NOT NULL DEFAULT false,
    "meaningfulRevenue" BOOLEAN NOT NULL DEFAULT false,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Founder" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Founder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "startQuarter" TIMESTAMP(3) NOT NULL,
    "horizonQuarters" INTEGER NOT NULL DEFAULT 8,
    "rationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Forecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastMetric" (
    "id" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "metric" "MetricType" NOT NULL,
    "quarterIndex" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForecastMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderUpdate" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "quarterIndex" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "FounderUpdateStatus" NOT NULL DEFAULT 'SUBMITTED',
    "actualRevenue" DOUBLE PRECISION NOT NULL,
    "actualBurn" DOUBLE PRECISION NOT NULL,
    "actualRunwayMonths" DOUBLE PRECISION NOT NULL,
    "actualTraction" DOUBLE PRECISION NOT NULL,
    "narrativeGood" TEXT,
    "narrativeBad" TEXT,
    "narrativeHelp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FounderUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flag" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "founderUpdateId" TEXT,
    "type" "FlagType" NOT NULL,
    "metric" "MetricType",
    "threshold" TEXT NOT NULL,
    "actualValue" DOUBLE PRECISION,
    "forecastValue" DOUBLE PRECISION,
    "deltaPct" DOUBLE PRECISION,
    "status" "FlagStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,

    CONSTRAINT "Flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cashflow" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "type" "CashflowType" NOT NULL,
    "amountLcl" DOUBLE PRECISION,
    "amountEur" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cashflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Valuation" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "fairValueEur" DOUBLE PRECISION NOT NULL,
    "valuationDate" TIMESTAMP(3) NOT NULL,
    "rationale" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Valuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "versionType" "DocumentVersionType" NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "actionRequiredId" TEXT,
    "action" "AuditAction" NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "rationale" TEXT,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionRequired" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,
    "actionOwner" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "exitType" "ExitType",
    "indicativeValuationMin" DOUBLE PRECISION,
    "indicativeValuationMax" DOUBLE PRECISION,
    "knownAcquirers" TEXT,
    "clearedAt" TIMESTAMP(3),
    "clearedBy" TEXT,
    "clearRationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionRequired_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Investment_icReference_key" ON "Investment"("icReference");

-- CreateIndex
CREATE UNIQUE INDEX "Forecast_investmentId_version_key" ON "Forecast"("investmentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ForecastMetric_forecastId_metric_quarterIndex_key" ON "ForecastMetric"("forecastId", "metric", "quarterIndex");

-- CreateIndex
CREATE UNIQUE INDEX "FounderUpdate_investmentId_quarterIndex_key" ON "FounderUpdate"("investmentId", "quarterIndex");

-- AddForeignKey
ALTER TABLE "Founder" ADD CONSTRAINT "Founder_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastMetric" ADD CONSTRAINT "ForecastMetric_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FounderUpdate" ADD CONSTRAINT "FounderUpdate_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_founderUpdateId_fkey" FOREIGN KEY ("founderUpdateId") REFERENCES "FounderUpdate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cashflow" ADD CONSTRAINT "Cashflow_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valuation" ADD CONSTRAINT "Valuation_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionRequired" ADD CONSTRAINT "ActionRequired_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
