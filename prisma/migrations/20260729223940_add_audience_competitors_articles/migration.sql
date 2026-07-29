-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Competitor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "description" TEXT,
    "language" TEXT,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "autopilotEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autopilotSeedKeyword" TEXT,
    "autopilotConnectedSiteId" TEXT,
    "targetAudiences" TEXT,
    "autoPublishArticles" BOOLEAN NOT NULL DEFAULT false,
    "articleStyle" TEXT DEFAULT 'Informative',
    "articleInstructions" TEXT,
    "internalLinksPerArticle" INTEGER NOT NULL DEFAULT 3,
    "articleImageStyle" TEXT DEFAULT 'None',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("autopilotConnectedSiteId", "autopilotEnabled", "autopilotSeedKeyword", "country", "createdAt", "description", "domain", "id", "language", "name", "organizationId", "updatedAt", "userId") SELECT "autopilotConnectedSiteId", "autopilotEnabled", "autopilotSeedKeyword", "country", "createdAt", "description", "domain", "id", "language", "name", "organizationId", "updatedAt", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
