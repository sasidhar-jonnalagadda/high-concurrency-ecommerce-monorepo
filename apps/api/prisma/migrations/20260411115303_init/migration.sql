-- DropIndex
DROP INDEX "products_slug_idx";

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");
