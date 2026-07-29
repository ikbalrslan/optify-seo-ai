-- AlterTable
ALTER TABLE "Project" ADD COLUMN "description" TEXT;
ALTER TABLE "Project" ADD COLUMN "language" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "hasCompletedOnboarding" BOOLEAN;

-- DataMigration: existing users already use the app - mark them onboarded so this
-- rollout doesn't force everyone back through a mandatory first-project flow.
UPDATE "User" SET "hasCompletedOnboarding" = true;
