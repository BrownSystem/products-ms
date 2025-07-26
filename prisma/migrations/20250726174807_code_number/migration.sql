/*
  Warnings:

  - The `code` column on the `EProduct` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "EProduct_code_key";

-- AlterTable
ALTER TABLE "EProduct" DROP COLUMN "code",
ADD COLUMN     "code" SERIAL NOT NULL;
