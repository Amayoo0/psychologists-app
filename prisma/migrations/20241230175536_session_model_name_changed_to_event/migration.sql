/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Session";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'event',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "patientId" INTEGER NOT NULL,
    CONSTRAINT "Event_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
