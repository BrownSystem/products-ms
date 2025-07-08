/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `EProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EProduct" ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "code" TEXT;

-- CreateTable
CREATE TABLE "EBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EBrand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EBrand_name_key" ON "EBrand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EProduct_code_key" ON "EProduct"("code");

-- AddForeignKey
ALTER TABLE "EProduct" ADD CONSTRAINT "EProduct_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "EBrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
