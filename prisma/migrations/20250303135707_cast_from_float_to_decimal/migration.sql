/*
  Warnings:

  - You are about to alter the column `duration` on the `History` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_History" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "affectedId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "duration" DECIMAL,
    "userId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_History" ("action", "affectedId", "duration", "id", "model", "timestamp", "userId") SELECT "action", "affectedId", "duration", "id", "model", "timestamp", "userId" FROM "History";
DROP TABLE "History";
ALTER TABLE "new_History" RENAME TO "History";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
