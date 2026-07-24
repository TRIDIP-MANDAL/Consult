/*
  Warnings:

  - The values [MEDIUM] on the enum `MentorExpertise` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `browser` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `Users` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- AlterEnum
BEGIN;
CREATE TYPE "MentorExpertise_new" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');
ALTER TABLE "public"."Mentor" ALTER COLUMN "expertise" DROP DEFAULT;
ALTER TABLE "Mentor" ALTER COLUMN "expertise" TYPE "MentorExpertise_new" USING ("expertise"::text::"MentorExpertise_new");
ALTER TYPE "MentorExpertise" RENAME TO "MentorExpertise_old";
ALTER TYPE "MentorExpertise_new" RENAME TO "MentorExpertise";
DROP TYPE "public"."MentorExpertise_old";
ALTER TABLE "Mentor" ALTER COLUMN "expertise" SET DEFAULT 'BEGINNER';
COMMIT;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "browser";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "middle_name",
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "full_name_search" TEXT;

-- CreateIndex
CREATE INDEX "Users_full_name_search_idx" ON "Users" USING GIN ("full_name_search" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Users_isactive_idx" ON "Users"("isactive");
