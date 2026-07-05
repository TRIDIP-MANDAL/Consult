/*
  Warnings:

  - You are about to drop the column `video` on the `Feedback` table. All the data in the column will be lost.
  - Made the column `user_id` on table `Feedback` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `country` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ProfessionCategories" AS ENUM ('HEALTHCARE', 'EDUCATION', 'TECHNOLOGY', 'BUSINESS', 'LAW', 'ARTS', 'SPORTS', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Currency" ADD VALUE 'PHP';
ALTER TYPE "Currency" ADD VALUE 'CZK';
ALTER TYPE "Currency" ADD VALUE 'ILS';

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "video",
ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "about" TEXT,
ADD COLUMN     "currency" "Currency" DEFAULT 'INR';

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "profession_categories" "ProfessionCategories",
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "profession" DROP NOT NULL,
ALTER COLUMN "profession" DROP DEFAULT;
