/*
  Warnings:

  - You are about to drop the column `lastTime` on the `CommunicationThread` table. All the data in the column will be lost.
  - You are about to drop the column `preview` on the `CommunicationThread` table. All the data in the column will be lost.
  - You are about to drop the column `milestone` on the `VolunteerAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `VolunteerAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `VolunteerAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `VolunteerActivity` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `VolunteerActivity` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `VolunteerBadge` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `VolunteerBadge` table. All the data in the column will be lost.
  - You are about to drop the column `activity` on the `VolunteerLog` table. All the data in the column will be lost.
  - You are about to drop the column `hours` on the `VolunteerLog` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `VolunteerReport` table. All the data in the column will be lost.
  - You are about to drop the column `generatedAt` on the `VolunteerReport` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `VolunteerReport` table. All the data in the column will be lost.
  - You are about to drop the column `totalHours` on the `VolunteerReport` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `VolunteerReport` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `CommunicationThread` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ngoId` to the `VolunteerAchievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `VolunteerAchievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activity` to the `VolunteerActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `VolunteerBadge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ngoId` to the `VolunteerBadge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `action` to the `VolunteerLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ngoId` to the `VolunteerLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Volunteer" DROP CONSTRAINT "Volunteer_ngoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VolunteerAchievement" DROP CONSTRAINT "VolunteerAchievement_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VolunteerActivity" DROP CONSTRAINT "VolunteerActivity_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VolunteerBadge" DROP CONSTRAINT "VolunteerBadge_volunteerId_fkey";

-- DropIndex
DROP INDEX "public"."Volunteer_branchId_idx";

-- DropIndex
DROP INDEX "public"."Volunteer_email_key";

-- DropIndex
DROP INDEX "public"."Volunteer_ngoId_idx";

-- DropIndex
DROP INDEX "public"."VolunteerReport_ngoId_volunteerId_month_year_key";

-- AlterTable
ALTER TABLE "CommunicationThread" DROP COLUMN "lastTime",
DROP COLUMN "preview",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "subject" DROP NOT NULL,
ALTER COLUMN "channel" SET DEFAULT 'INBOX';

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "ngoId" DROP NOT NULL,
ALTER COLUMN "badges" DROP DEFAULT;

-- AlterTable
ALTER TABLE "VolunteerAchievement" DROP COLUMN "milestone",
DROP COLUMN "name",
DROP COLUMN "value",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "ngoId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VolunteerActivity" DROP COLUMN "details",
DROP COLUMN "type",
ADD COLUMN     "activity" TEXT NOT NULL,
ADD COLUMN     "activityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hours" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "VolunteerBadge" DROP COLUMN "icon",
DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "ngoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VolunteerLog" DROP COLUMN "activity",
DROP COLUMN "hours",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "details" TEXT,
ADD COLUMN     "ngoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VolunteerReport" DROP COLUMN "fileUrl",
DROP COLUMN "generatedAt",
DROP COLUMN "month",
DROP COLUMN "totalHours",
DROP COLUMN "year",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "periodFrom" TIMESTAMP(3),
ADD COLUMN     "periodTo" TIMESTAMP(3),
ADD COLUMN     "summary" JSONB;

-- CreateIndex
CREATE INDEX "VolunteerAchievement_ngoId_idx" ON "VolunteerAchievement"("ngoId");

-- CreateIndex
CREATE INDEX "VolunteerActivity_eventId_idx" ON "VolunteerActivity"("eventId");

-- CreateIndex
CREATE INDEX "VolunteerBadge_ngoId_idx" ON "VolunteerBadge"("ngoId");

-- CreateIndex
CREATE INDEX "VolunteerLog_ngoId_idx" ON "VolunteerLog"("ngoId");

-- CreateIndex
CREATE INDEX "VolunteerReport_ngoId_idx" ON "VolunteerReport"("ngoId");

-- CreateIndex
CREATE INDEX "VolunteerReport_volunteerId_idx" ON "VolunteerReport"("volunteerId");

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerLog" ADD CONSTRAINT "VolunteerLog_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerBadge" ADD CONSTRAINT "VolunteerBadge_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerBadge" ADD CONSTRAINT "VolunteerBadge_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAchievement" ADD CONSTRAINT "VolunteerAchievement_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAchievement" ADD CONSTRAINT "VolunteerAchievement_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerActivity" ADD CONSTRAINT "VolunteerActivity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
