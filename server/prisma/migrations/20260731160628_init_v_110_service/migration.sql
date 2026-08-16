/*
  Warnings:

  - The values [PENDING] on the enum `ServiceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `amount` on the `Consultancy_service` table. All the data in the column will be lost.
  - Added the required column `scheduled_date` to the `Consultancy_service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceStatus_new" AS ENUM ('INITIATED', 'SCHEDULED', 'CANCELED', 'DONE', 'ONGOING');
ALTER TABLE "public"."Consultancy_service" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Consultancy_service" ALTER COLUMN "status" TYPE "ServiceStatus_new" USING ("status"::text::"ServiceStatus_new");
ALTER TYPE "ServiceStatus" RENAME TO "ServiceStatus_old";
ALTER TYPE "ServiceStatus_new" RENAME TO "ServiceStatus";
DROP TYPE "public"."ServiceStatus_old";
ALTER TABLE "Consultancy_service" ALTER COLUMN "status" SET DEFAULT 'INITIATED';
COMMIT;

-- AlterTable
ALTER TABLE "Consultancy_service" DROP COLUMN "amount",
ADD COLUMN     "cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "scheduled_date" DATE NOT NULL,
ALTER COLUMN "scheduled_time" SET DATA TYPE TIME,
ALTER COLUMN "status" SET DEFAULT 'INITIATED';

-- CreateIndex
CREATE INDEX "Consultancy_service_status_idx" ON "Consultancy_service"("status");

-- CreateIndex
CREATE INDEX "Consultancy_service_mentor_id_status_idx" ON "Consultancy_service"("mentor_id", "status");

-- CreateIndex
CREATE INDEX "Consultancy_service_user_id_status_idx" ON "Consultancy_service"("user_id", "status");
