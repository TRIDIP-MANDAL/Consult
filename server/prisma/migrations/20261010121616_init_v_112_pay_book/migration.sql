/*
  Warnings:

  - You are about to drop the column `image` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Memberships` table. All the data in the column will be lost.
  - You are about to drop the column `isactive` on the `Memberships` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Memberships` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Memberships` table. All the data in the column will be lost.
  - You are about to drop the column `fee` on the `Payments` table. All the data in the column will be lost.
  - You are about to drop the column `international` on the `Payments` table. All the data in the column will be lost.
  - You are about to drop the column `membership_id` on the `Payments` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentfor` on the `Payments` table. All the data in the column will be lost.
  - You are about to drop the column `service_id` on the `Payments` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `Payments` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_id` on the `Payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_id]` on the table `Consultancy_service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Feedback` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id]` on the table `Memberships` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gateway_txn_id]` on the table `Payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_id` to the `Memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan_id` to the `Memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gateway_txn_id` to the `Payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `Payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paytm_response` to the `Payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('MEMBERSHIP', 'CONSULTANCY_SERVICE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIALLY_REFUNDED';

-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_service_id_fkey";

-- DropIndex
DROP INDEX "Payments_transaction_id_key";

-- AlterTable
ALTER TABLE "Consultancy_service" ADD COLUMN     "order_id" BIGINT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "Memberships" DROP COLUMN "currency",
DROP COLUMN "isactive",
DROP COLUMN "name",
DROP COLUMN "price",
ADD COLUMN     "order_id" BIGINT NOT NULL,
ADD COLUMN     "plan_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Payments" DROP COLUMN "fee",
DROP COLUMN "international",
DROP COLUMN "membership_id",
DROP COLUMN "method",
DROP COLUMN "paymentfor",
DROP COLUMN "service_id",
DROP COLUMN "tax",
DROP COLUMN "transaction_id",
ADD COLUMN     "gateway_txn_id" TEXT NOT NULL,
ADD COLUMN     "order_id" BIGINT NOT NULL,
ADD COLUMN     "paytm_response" JSONB NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Order" (
    "id" BIGSERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "order_type" "OrderType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refunds" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" BIGINT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "RefundStatus" NOT NULL,
    "reason" TEXT,
    "gateway_refund_id" TEXT,
    "paytm_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "isactive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_public_id_key" ON "Order"("public_id");

-- CreateIndex
CREATE INDEX "Order_user_id_status_idx" ON "Order"("user_id", "status");

-- CreateIndex
CREATE INDEX "Order_order_type_idx" ON "Order"("order_type");

-- CreateIndex
CREATE UNIQUE INDEX "Refunds_gateway_refund_id_key" ON "Refunds"("gateway_refund_id");

-- CreateIndex
CREATE INDEX "Refunds_payment_id_idx" ON "Refunds"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Consultancy_service_order_id_key" ON "Consultancy_service"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_user_id_key" ON "Feedback"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Memberships_order_id_key" ON "Memberships"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_gateway_txn_id_key" ON "Payments"("gateway_txn_id");

-- CreateIndex
CREATE INDEX "Payments_order_id_idx" ON "Payments"("order_id");

-- CreateIndex
CREATE INDEX "Payments_user_id_idx" ON "Payments"("user_id");

-- CreateIndex
CREATE INDEX "Payments_status_idx" ON "Payments"("status");

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultancy_service" ADD CONSTRAINT "Consultancy_service_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refunds" ADD CONSTRAINT "Refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
