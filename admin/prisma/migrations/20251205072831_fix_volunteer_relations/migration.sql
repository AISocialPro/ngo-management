/*
  Warnings:

  - You are about to drop the column `achievements` on the `Volunteer` table. All the data in the column will be lost.
  - You are about to drop the column `badges` on the `Volunteer` table. All the data in the column will be lost.
  - The `status` column on the `Volunteer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Volunteer" DROP COLUMN "achievements",
DROP COLUMN "badges",
ADD COLUMN     "areaOfInterest" TEXT,
ADD COLUMN     "availability" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "emergencyName" TEXT,
ADD COLUMN     "emergencyPhone" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "volunteerType" TEXT,
ALTER COLUMN "skills" SET DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'New',
ALTER COLUMN "joiningDate" DROP NOT NULL;
