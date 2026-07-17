/*
  Warnings:

  - You are about to drop the `WordPressSite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `publishTarget` on the `ScheduledPost` table. All the data in the column will be lost.
  - You are about to drop the column `wordPressSiteId` on the `ScheduledPost` table. All the data in the column will be lost.
  - You are about to drop the column `activeWordPressSiteId` on the `User` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WordPressSite";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ConnectedSite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WORDPRESS',
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConnectedSite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScheduledPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "connectedSiteId" TEXT,
    "projectId" TEXT,
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
    CONSTRAINT "ScheduledPost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScheduledPost_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ScheduledPost" ("createdAt", "errorMessage", "executedAt", "generatedContent", "generatedDescription", "generatedTitle", "id", "intent", "keyword", "keywordId", "language", "length", "projectId", "publishStatus", "publishedPostUrl", "scheduledDate", "status", "tone", "updatedAt", "userId") SELECT "createdAt", "errorMessage", "executedAt", "generatedContent", "generatedDescription", "generatedTitle", "id", "intent", "keyword", "keywordId", "language", "length", "projectId", "publishStatus", "publishedPostUrl", "scheduledDate", "status", "tone", "updatedAt", "userId" FROM "ScheduledPost";
DROP TABLE "ScheduledPost";
ALTER TABLE "new_ScheduledPost" RENAME TO "ScheduledPost";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "encryptedOpenAiKey" TEXT,
    "encryptedWordpressKey" TEXT,
    "lastBlogGeneratedAt" DATETIME,
    "activeConnectedSiteId" TEXT,
    "backlinkExchangeEnabled" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("backlinkExchangeEnabled", "createdAt", "email", "emailVerified", "encryptedOpenAiKey", "encryptedWordpressKey", "id", "image", "lastBlogGeneratedAt", "name", "password", "role", "updatedAt") SELECT "backlinkExchangeEnabled", "createdAt", "email", "emailVerified", "encryptedOpenAiKey", "encryptedWordpressKey", "id", "image", "lastBlogGeneratedAt", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
