/*
  Warnings:

  - Added the required column `userId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'event',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "patientId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Event_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdAt", "description", "endTime", "id", "patientId", "startTime", "title", "type", "updatedAt") SELECT "createdAt", "description", "endTime", "id", "patientId", "startTime", "title", "type", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
