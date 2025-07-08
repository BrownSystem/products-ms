-- DropIndex
DROP INDEX "EProduct_available_idx";

-- CreateIndex
CREATE INDEX "EBrand_id_name_available_idx" ON "EBrand"("id", "name", "available");

-- CreateIndex
CREATE INDEX "EProduct_available_description_idx" ON "EProduct"("available", "description");
