/*
  Warnings:

  - You are about to drop the column `lastSession` on the `Patient` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("createdAt", "email", "id", "initials", "name", "phone", "userId") SELECT "createdAt", "email", "id", "initials", "name", "phone", "userId" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_initials_key" ON "Patient"("initials");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
