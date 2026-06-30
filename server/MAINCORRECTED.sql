CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
-- CREATE TYPE "User_Type_Fb" AS ENUM ('USER', 'MENTOR'); --THESE 2 MAY BE COMBINED
CREATE TYPE "MentorProfession" AS ENUM ('ENGINEER', 'DOCTOR', 'TEACHER', 'PROFESSOR'); --NEED TO ADD MORE 
CREATE TYPE "MentorLevel" AS ENUM ('BRONZEZ', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');
CREATE TYPE "MentorExpertise" AS ENUM ('BEGINNER', 'MEDIUM', 'EXPERT');

CREATE TYPE "Paid_For" AS ENUM ('MEMBERSHIP', 'SERVICE');
CREATE TYPE "Currency" AS ENUM ('RUPEE', 'RUBLE', 'GBP', 'DOLLAR');--NEED TO ADD MORE 
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD', 'NETBANKING', 'WALLET');

CREATE TABLE "Users" (
  "id" TEXT NOT NULL,
  "image" TEXT,
  "email" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "middle_name" TEXT,
  "last_name" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "gender" "Gender",
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isactive" BOOLEAN NOT NULL DEFAULT true,
   CONSTRAINT "users_pkey" PRIMARY KEY ("id")
); --DONE

CREATE TABLE "Mentor" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "middle_name" TEXT,
  "last_name" TEXT NOT NULL,
  "image" TEXT,
  "profession" "MentorProfession",
  "experience" INTEGER NOT NULL,
  "available_from" TIME,
  "available_to" TIME,
  "rating" DECIMAL(2,1), --THIS WILL BE CALCULATED BASED ON THE AVG OF HIS PREVIOUS CONSULTANCIES
  "expertise" "MentorExpertise" NOT NULL DEFAULT 'BEGINNER', --this is very tuff to determine, we will think on it later
  "level" "MentorLevel", --THIS IS DEPENDENT ON EXPERIENCE AND EXPERTISE
  "no_of_consultancy" INTEGER NOT NULL, --WILL BE MANAGED BY BACKEND, LIKE WHENEVER MENTOR WILL COMPLETE A CONSULTANCY, COUNT WILL INCREASE
  "charge" DECIMAL(10,2) NOT NULL,
  "achievements" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT "mentors_pkey" PRIMARY KEY ("id")
); --DONE

CREATE TABLE "Consultancy_service" (
  "id" TEXT NOT NULL,
  "mentor" TEXT NOT NULL,
  "user" TEXT NOT NULL,
  "duration" TEXT NOT NULL,
  "scheduled_time" TIMESTAMP(3) NOT NULL,
  "rating" DECIMAL(2,1),
  "openion" TEXT,
  "join_link" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "consultancy_services_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FK_Consultancy_service_user"
    FOREIGN KEY ("user")
      REFERENCES "Users"("id"),
  CONSTRAINT "FK_Consultancy_service_mentor"
    FOREIGN KEY ("mentor")
      REFERENCES "Mentor"("id")
); --DONE

CREATE TABLE "Feedback" (
  "id" TEXT NOT NULL,
  ------------------------
  "user_id"   TEXT,
  "mentor_id" TEXT,
  ------------------------
--   "Users" TEXT NOT NULL,
--   "User_Type" "User_Type_Fb" NOT NULL,
  "image" TEXT, --HERE IT SHOULD BE STORED A LIST OF IMAGE LINKS, THOSE WILL BE STORED SEPAREATED VIA ANY DELIMETER, WHEN WE WILL RETRIVR THAT, WE WILL SPLIT THE LINKS AND DISPALY AS A LIST OF IMAGES
  "content" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ---------------------------
  CHECK ( --AS PG does not support polymorphic foreign keys, HENCE THIS ONE
    ("user_id" IS NOT NULL AND "mentor_id" IS NULL) OR
    ("user_id" IS NULL AND "mentor_id" IS NOT NULL)
  ),
  ---------------------------
  CONSTRAINT "feedback_pkey" PRIMARY KEY ("id"),
  --------------------------------------
  CONSTRAINT "FK_Feedback_user_id"
    FOREIGN KEY ("user_id")
      REFERENCES "Users"("id"),
   CONSTRAINT "FK_Feedback_mentor_id"
    FOREIGN KEY ("mentor_id")
      REFERENCES "Mentor"("id")
      ---------------------------
); --DONE

CREATE TABLE "Memberships" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "Price" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
); --DONE

CREATE TABLE "Payments" (
  "id" TEXT NOT NULL,
  -----------------
  "user_id"   TEXT,
  "mentor_id" TEXT,
  CHECK ( --AS PG does not support polymorphic foreign keys, HENCE THIS ONE
    ("user_id" IS NOT NULL AND "mentor_id" IS NULL) OR
    ("user_id" IS NULL AND "mentor_id" IS NOT NULL)
  ),
  -----------------------------------
  "membership_id" TEXT, --EITHER SERVICE ID OR MEMBERSHIP ID WILL BE STORED
  "service_id" TEXT,
  CHECK ( --AS PG does not support polymorphic foreign keys, HENCE THIS ONE
    ("membership_id" IS NOT NULL AND "service_id" IS NULL) OR
    ("membership_id" IS NULL AND "service_id" IS NOT NULL)
  ),
  --"service_type" "Paid_For" NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" "Currency" NOT NULL,
  "status" "PaymentStatus" NOT NULL,
  "international" Boolean NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "fee" DECIMAL(10,2) NOT NULL,
  "tax" DECIMAL(10,2) NOT NULL,
  "transaction_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    -------------------------------------
  CONSTRAINT "FK_Payments_user_id"
    FOREIGN KEY ("user_id")
      REFERENCES "Users"("id"),
   CONSTRAINT "FK_Payments_mentor_id"
    FOREIGN KEY ("mentor_id")
      REFERENCES "Mentor"("id"),
  -------------------------------------
    -------------------------------------
  CONSTRAINT "FK_Payments_membership_id"
    FOREIGN KEY ("membership_id")
      REFERENCES "Memberships"("id"),
   CONSTRAINT "FK_Payments_service_id"
    FOREIGN KEY ("service_id")
      REFERENCES "Consultancy_service"("id")
  -------------------------------------
);
--, PAYMENT FK

