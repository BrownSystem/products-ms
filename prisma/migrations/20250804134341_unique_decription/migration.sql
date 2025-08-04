/*
  Warnings:

  - A unique constraint covering the columns `[description]` on the table `EProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EProduct_description_key" ON "EProduct"("description");
