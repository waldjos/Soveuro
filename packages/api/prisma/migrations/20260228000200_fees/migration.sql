-- CreateEnum
CREATE TYPE "FeeKind" AS ENUM ('COLEGIATURA', 'CONGRESO');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAYPAL', 'ZELLE', 'PAGO_MOVIL', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "Fee" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" "FeeKind" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "FeeStatus" NOT NULL DEFAULT 'PENDING',
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fee_user_id_idx" ON "Fee"("user_id");

-- CreateIndex
CREATE INDEX "Fee_kind_idx" ON "Fee"("kind");

-- CreateIndex
CREATE INDEX "Fee_status_idx" ON "Fee"("status");

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

