/*
  Warnings:

  - Added the required column `projectId` to the `ConnectedSite` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConnectedSite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WORDPRESS',
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConnectedSite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConnectedSite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConnectedSite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ConnectedSite" ("createdAt", "credentials", "id", "name", "organizationId", "type", "updatedAt", "url", "userId") SELECT "createdAt", "credentials", "id", "name", "organizationId", "type", "updatedAt", "url", "userId" FROM "ConnectedSite";
DROP TABLE "ConnectedSite";
ALTER TABLE "new_ConnectedSite" RENAME TO "ConnectedSite";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
