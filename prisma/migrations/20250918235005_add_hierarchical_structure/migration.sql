/*
  Warnings:

  - You are about to drop the `ManualRepo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Page` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `pageId` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `repoId` on the `Progress` table. All the data in the column will be lost.
  - The primary key for the `Star` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `repoId` on the `Star` table. All the data in the column will be lost.
  - Added the required column `guideId` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repositoryId` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repositoryId` to the `Star` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ManualRepo_ownerId_slug_key";

-- DropIndex
DROP INDEX "ManualRepo_visibility_starsCount_idx";

-- DropIndex
DROP INDEX "Page_repoId_path_key";

-- DropIndex
DROP INDEX "Page_repoId_order_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ManualRepo";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Page";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Library" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Library_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "libraryId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "starsCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Repository_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Repository_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "repositoryId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "contentMd" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "isReadme" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Guide_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Guide_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "completedSteps" INTEGER NOT NULL DEFAULT 0,
    "totalSteps" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Progress_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Progress_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Progress" ("completedSteps", "id", "totalSteps", "updatedAt", "userId") SELECT "completedSteps", "id", "totalSteps", "updatedAt", "userId" FROM "Progress";
DROP TABLE "Progress";
ALTER TABLE "new_Progress" RENAME TO "Progress";
CREATE INDEX "Progress_userId_repositoryId_guideId_idx" ON "Progress"("userId", "repositoryId", "guideId");
CREATE UNIQUE INDEX "Progress_userId_repositoryId_guideId_key" ON "Progress"("userId", "repositoryId", "guideId");
CREATE TABLE "new_Star" (
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "repositoryId"),
    CONSTRAINT "Star_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Star_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Star" ("createdAt", "userId") SELECT "createdAt", "userId" FROM "Star";
DROP TABLE "Star";
ALTER TABLE "new_Star" RENAME TO "Star";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Library_visibility_order_idx" ON "Library"("visibility", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Library_ownerId_slug_key" ON "Library"("ownerId", "slug");

-- CreateIndex
CREATE INDEX "Repository_visibility_starsCount_idx" ON "Repository"("visibility", "starsCount");

-- CreateIndex
CREATE INDEX "Repository_libraryId_order_idx" ON "Repository"("libraryId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_ownerId_slug_key" ON "Repository"("ownerId", "slug");

-- CreateIndex
CREATE INDEX "Guide_visibility_updatedAt_idx" ON "Guide"("visibility", "updatedAt");

-- CreateIndex
CREATE INDEX "Guide_repositoryId_order_idx" ON "Guide"("repositoryId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_ownerId_slug_key" ON "Guide"("ownerId", "slug");
