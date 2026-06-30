/*
  Warnings:

  - Added the required column `title` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Made the column `experience` on table `Mentor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Mentor" ALTER COLUMN "experience" SET NOT NULL;
