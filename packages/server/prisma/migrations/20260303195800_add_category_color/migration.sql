-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#9e9e9e',
    CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("id", "name", "userId") SELECT "id", "name", "userId" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE INDEX "Category_userId_idx" ON "Category"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
