-- CreateTable
CREATE TABLE "Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "english" TEXT NOT NULL,
    "hungarian" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 10,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_english_key" ON "Word"("english");

-- CreateIndex
CREATE INDEX "Word_priority_idx" ON "Word"("priority");
