-- CreateTable
CREATE TABLE "EProduct" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EProduct_available_idx" ON "EProduct"("available");
