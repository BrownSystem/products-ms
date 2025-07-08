/*
  Warnings:

  - Made the column `qrCode` on table `EProduct` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EProduct" ALTER COLUMN "qrCode" SET NOT NULL;
