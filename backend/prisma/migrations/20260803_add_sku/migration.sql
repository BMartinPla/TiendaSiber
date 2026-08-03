-- AlterTable
ALTER TABLE "products" ADD COLUMN "sku" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
