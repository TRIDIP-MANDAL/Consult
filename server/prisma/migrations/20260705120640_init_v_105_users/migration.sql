/*
  Warnings:

  - You are about to drop the column `profession_categories` on the `Users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProfessionCategory" AS ENUM ('HEALTHCARE', 'EDUCATION', 'TECHNOLOGY', 'BUSINESS', 'LAW', 'ARTS', 'SPORTS', 'OTHER');

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "profession_categories",
ADD COLUMN     "profession_category" "ProfessionCategory";

-- DropEnum
DROP TYPE "ProfessionCategories";
