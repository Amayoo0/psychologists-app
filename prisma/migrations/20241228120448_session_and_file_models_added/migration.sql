/*
  Warnings:

  - Added the required column `initials` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "notes" TEXT,
    "patientId" INTEGER NOT NULL,
    CONSTRAINT "Session_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" INTEGER NOT NULL,
    CONSTRAINT "File_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("id", "name", "userId") SELECT "id", "name", "userId" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_initials_key" ON "Patient"("initials");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
