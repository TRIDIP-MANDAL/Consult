/*
  Warnings:

  - Added the required column `rating` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TableName" AS ENUM ('Users', 'Mentor', 'Consultancy_service', 'Chat', 'Message', 'Call', 'Report', 'Feedback', 'Memberships', 'Payments', 'AdminAction', 'Document', 'ContactUs', 'Relationship', 'AuditLog');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "rating" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "active_mentor" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "table_name" "TableName" NOT NULL,
    "record_id" BIGINT NOT NULL,
    "action" "ActionType" NOT NULL,
    "previous_data" JSONB,
    "updated_data" JSONB,
    "user_id" BIGINT,
    "role" "UserRole",
    "ip_address" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
