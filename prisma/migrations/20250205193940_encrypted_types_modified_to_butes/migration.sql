/*
  Warnings:

  - You are about to alter the column `encrypted_iv` on the `PsyFile` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.
  - You are about to alter the column `encrypted_key` on the `PsyFile` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PsyFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encrypted_key" BLOB,
    "encrypted_iv" BLOB,
    "patientId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" TEXT,
    CONSTRAINT "PsyFile_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PsyFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PsyFile_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PsyFile" ("encrypted_iv", "encrypted_key", "eventId", "filename", "id", "patientId", "uploadedAt", "url", "userId") SELECT "encrypted_iv", "encrypted_key", "eventId", "filename", "id", "patientId", "uploadedAt", "url", "userId" FROM "PsyFile";
DROP TABLE "PsyFile";
ALTER TABLE "new_PsyFile" RENAME TO "PsyFile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
