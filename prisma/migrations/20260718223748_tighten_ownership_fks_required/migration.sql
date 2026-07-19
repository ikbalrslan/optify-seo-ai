/*
  Warnings:

  - Made the column `organizationId` on table `ConnectedSite` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `projectId` on table `ScheduledPost` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConnectedSite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WORDPRESS',
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConnectedSite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConnectedSite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ConnectedSite" ("createdAt", "credentials", "id", "name", "organizationId", "type", "updatedAt", "url", "userId") SELECT "createdAt", "credentials", "id", "name", "organizationId", "type", "updatedAt", "url", "userId" FROM "ConnectedSite";
DROP TABLE "ConnectedSite";
ALTER TABLE "new_ConnectedSite" RENAME TO "ConnectedSite";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "autopilotEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autopilotSeedKeyword" TEXT,
    "autopilotConnectedSiteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("autopilotConnectedSiteId", "autopilotEnabled", "autopilotSeedKeyword", "country", "createdAt", "domain", "id", "name", "organizationId", "updatedAt", "userId") SELECT "autopilotConnectedSiteId", "autopilotEnabled", "autopilotSeedKeyword", "country", "createdAt", "domain", "id", "name", "organizationId", "updatedAt", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_ScheduledPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "connectedSiteId" TEXT,
    "projectId" TEXT NOT NULL,
    "keywordId" TEXT,
    "keyword" TEXT NOT NULL,
    "intent" TEXT NOT NULL DEFAULT 'informational',
    "tone" TEXT NOT NULL,
    "length" INTEGER NOT NULL DEFAULT 1500,
    "language" TEXT NOT NULL DEFAULT 'en',
    "scheduledDate" DATETIME NOT NULL,
    "publishStatus" TEXT NOT NULL DEFAULT 'draft',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "generatedTitle" TEXT,
    "generatedContent" TEXT,
    "generatedDescription" TEXT,
    "publishedPostUrl" TEXT,
    "errorMessage" TEXT,
    "executedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduledPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduledPost_connectedSiteId_fkey" FOREIGN KEY ("connectedSiteId") REFERENCES "ConnectedSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduledPost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduledPost_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ScheduledPost" ("connectedSiteId", "createdAt", "errorMessage", "executedAt", "generatedContent", "generatedDescription", "generatedTitle", "id", "intent", "keyword", "keywordId", "language", "length", "projectId", "publishStatus", "publishedPostUrl", "scheduledDate", "status", "tone", "updatedAt", "userId") SELECT "connectedSiteId", "createdAt", "errorMessage", "executedAt", "generatedContent", "generatedDescription", "generatedTitle", "id", "intent", "keyword", "keywordId", "language", "length", "projectId", "publishStatus", "publishedPostUrl", "scheduledDate", "status", "tone", "updatedAt", "userId" FROM "ScheduledPost";
DROP TABLE "ScheduledPost";
ALTER TABLE "new_ScheduledPost" RENAME TO "ScheduledPost";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
