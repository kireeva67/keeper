/*
  Warnings:

  - A unique constraint covering the columns `[url,userId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_url_key";

-- CreateIndex
CREATE UNIQUE INDEX "Product_url_userId_key" ON "Product"("url", "userId");
