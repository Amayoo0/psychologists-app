-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "showWeekends" BOOLEAN NOT NULL,
    "preferredView" TEXT NOT NULL,
    "workDayStart" INTEGER NOT NULL,
    "workDayEnd" INTEGER NOT NULL,
    "cellSize" INTEGER NOT NULL,
    "internalPassword" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");
