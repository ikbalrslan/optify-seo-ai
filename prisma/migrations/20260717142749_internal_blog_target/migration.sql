-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "scheduledPostId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogPost_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "ScheduledPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScheduledPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "publishTarget" TEXT NOT NULL DEFAULT 'WORDPRESS',
    "wordPressSiteId" TEXT,
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
    CONSTRAINT "ScheduledPost_wordPressSiteId_fkey" FOREIGN KEY ("wordPressSiteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduledPost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScheduledPost_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ScheduledPost" ("createdAt", "errorMessage", "executedAt", "generatedContent", "generatedDescription", "generatedTitle", "id", "intent", "keyword", "language", "length", "publishStatus", "publishedPostUrl", "scheduledDate", "status", "tone", "updatedAt", "userId", "wordPressSiteId") SELECT "createdAt", "errorMessage", "executedAt", "generatedContent", "generatedDescription", "generatedTitle", "id", "intent", "keyword", "language", "length", "publishStatus", "publishedPostUrl", "scheduledDate", "status", "tone", "updatedAt", "userId", "wordPressSiteId" FROM "ScheduledPost";
DROP TABLE "ScheduledPost";
ALTER TABLE "new_ScheduledPost" RENAME TO "ScheduledPost";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_scheduledPostId_key" ON "BlogPost"("scheduledPostId");
