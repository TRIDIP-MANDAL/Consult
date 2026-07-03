-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'ONGOING', 'DONE');

-- CreateEnum
CREATE TYPE "Relation" AS ENUM ('FAVOURITE', 'BLOCK', 'FOLLOWS');

-- AlterEnum
ALTER TYPE "ReportStatus" ADD VALUE 'ONGOING';

-- CreateTable
CREATE TABLE "ContactUs" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactUs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" BIGSERIAL NOT NULL,
    "user1" BIGINT NOT NULL,
    "user2" BIGINT NOT NULL,
    "relation" "Relation",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_user1_fkey" FOREIGN KEY ("user1") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_user2_fkey" FOREIGN KEY ("user2") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
