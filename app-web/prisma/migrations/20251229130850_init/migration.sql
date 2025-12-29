-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "investmentAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "investmentType" TEXT NOT NULL,
    "investmentDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Founder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Founder_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investmentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "startQuarter" DATETIME NOT NULL,
    "horizonQuarters" INTEGER NOT NULL DEFAULT 8,
    "rationale" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Forecast_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForecastMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "forecastId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "quarterIndex" INTEGER NOT NULL,
    "value" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForecastMetric_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FounderUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investmentId" TEXT NOT NULL,
    "quarterIndex" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "actualRevenue" REAL NOT NULL,
    "actualBurn" REAL NOT NULL,
    "actualRunwayMonths" REAL NOT NULL,
    "actualTraction" REAL NOT NULL,
    "narrativeGood" TEXT,
    "narrativeBad" TEXT,
    "narrativeHelp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FounderUpdate_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Flag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investmentId" TEXT NOT NULL,
    "founderUpdateId" TEXT,
    "type" TEXT NOT NULL,
    "metric" TEXT,
    "threshold" TEXT NOT NULL,
    "actualValue" REAL,
    "forecastValue" REAL,
    "deltaPct" REAL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    "resolutionNote" TEXT,
    CONSTRAINT "Flag_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Flag_founderUpdateId_fkey" FOREIGN KEY ("founderUpdateId") REFERENCES "FounderUpdate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investmentId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Forecast_investmentId_version_key" ON "Forecast"("investmentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ForecastMetric_forecastId_metric_quarterIndex_key" ON "ForecastMetric"("forecastId", "metric", "quarterIndex");

-- CreateIndex
CREATE UNIQUE INDEX "FounderUpdate_investmentId_quarterIndex_key" ON "FounderUpdate"("investmentId", "quarterIndex");
