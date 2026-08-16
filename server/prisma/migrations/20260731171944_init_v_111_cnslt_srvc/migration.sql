-- AlterTable
ALTER TABLE "Consultancy_service" ADD COLUMN     "approved_by_mentor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_done" BOOLEAN NOT NULL DEFAULT false;
