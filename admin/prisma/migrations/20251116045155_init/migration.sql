-- CreateEnum
CREATE TYPE "BeneficiaryStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'NEW');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('FUNDRAISER', 'VOLUNTEER', 'COMMUNITY', 'EDUCATIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "VolunteerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'NEW');

-- CreateEnum
CREATE TYPE "ThreadChannel" AS ENUM ('INBOX', 'SENT', 'ANNOUNCEMENTS');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('UPI', 'CARD', 'NETBANKING', 'CHEQUE', 'CASH', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "NGO" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailFrom" TEXT,
    "receiptSettings" JSONB,
    "receiptFYKey" TEXT,
    "receiptFYCounter" INTEGER,
    "smtpHost" TEXT,
    "smtpPass" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,

    CONSTRAINT "NGO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "manager" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "staff" INTEGER NOT NULL DEFAULT 0,
    "beneficiaries" INTEGER NOT NULL DEFAULT 0,
    "funding" TEXT NOT NULL DEFAULT '$0',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "household" TEXT,
    "assistance" TEXT,
    "status" "BeneficiaryStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "avatar" TEXT,
    "type" TEXT NOT NULL DEFAULT 'individual',
    "status" TEXT NOT NULL DEFAULT 'New',
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "donations" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDonatedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pan" TEXT,
    "segment" TEXT,
    "tags" JSONB,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" "CampaignStatus" NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "lead" TEXT,
    "raised" INTEGER NOT NULL DEFAULT 0,
    "goal" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ngoId" TEXT NOT NULL,
    "category" TEXT,
    "slug" TEXT,
    "isArchived" BOOLEAN DEFAULT false,
    "isarchived" BOOLEAN DEFAULT false,
    "createdby" TEXT,
    "updatedby" TEXT,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "campaignId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "donatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DonationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "fxRate" DECIMAL(12,6),
    "fcra" BOOLEAN,
    "paymentMode" "PaymentMode",
    "utr" TEXT,
    "bankName" TEXT,
    "cardLast4" TEXT,
    "chequeNo" TEXT,
    "gateway" TEXT,
    "gatewayRef" TEXT,
    "giftInMemoryOf" TEXT,
    "giftInHonourOf" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "receiptNumber" TEXT,
    "receiptFileUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "participants" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "budget" INTEGER,
    "dateISO" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "expected" INTEGER,
    "img" TEXT,
    "startTime" TEXT NOT NULL,
    "volunteers" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "checkInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngoId" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "avatar" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "skills" TEXT[],
    "status" "VolunteerStatus" NOT NULL DEFAULT 'NEW',
    "totalHours" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "achievements" JSONB,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerLog" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "activity" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerBadge" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerAchievement" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "milestone" INTEGER,
    "achievedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerReport" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalHours" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT,

    CONSTRAINT "VolunteerReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerActivity" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "eventId" TEXT,
    "type" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationThread" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "channel" "ThreadChannel" NOT NULL,
    "preview" TEXT,
    "lastTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceDocument" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT,
    "updated" TEXT,
    "expires" TEXT,

    CONSTRAINT "ComplianceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistTask" (
    "id" TEXT NOT NULL,
    "complianceId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "due" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "done" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChecklistTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedReport" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "cachedAt" TIMESTAMP(3),
    "cache" JSONB,

    CONSTRAINT "SavedReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pledge" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "donorId" TEXT,
    "pledgeId" TEXT,
    "sendAt" TIMESTAMP(3) NOT NULL,
    "channel" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Branch_ngoId_idx" ON "Branch"("ngoId");

-- CreateIndex
CREATE INDEX "Beneficiary_ngoId_idx" ON "Beneficiary"("ngoId");

-- CreateIndex
CREATE INDEX "Beneficiary_branchId_idx" ON "Beneficiary"("branchId");

-- CreateIndex
CREATE INDEX "Donor_ngoId_idx" ON "Donor"("ngoId");

-- CreateIndex
CREATE UNIQUE INDEX "donor_email_per_ngo_unique" ON "Donor"("ngoId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "donor_phone_per_ngo_unique" ON "Donor"("ngoId", "phone");

-- CreateIndex
CREATE INDEX "Campaign_ngoId_idx" ON "Campaign"("ngoId");

-- CreateIndex
CREATE INDEX "Donation_gateway_gatewayRef_idx" ON "Donation"("gateway", "gatewayRef");

-- CreateIndex
CREATE INDEX "Donation_ngoId_idx" ON "Donation"("ngoId");

-- CreateIndex
CREATE INDEX "Donation_donorId_idx" ON "Donation"("donorId");

-- CreateIndex
CREATE INDEX "Donation_campaignId_idx" ON "Donation"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_eventId_volunteerId_key" ON "EventParticipant"("eventId", "volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_email_key" ON "Volunteer"("email");

-- CreateIndex
CREATE INDEX "Volunteer_ngoId_idx" ON "Volunteer"("ngoId");

-- CreateIndex
CREATE INDEX "Volunteer_branchId_idx" ON "Volunteer"("branchId");

-- CreateIndex
CREATE INDEX "VolunteerLog_volunteerId_idx" ON "VolunteerLog"("volunteerId");

-- CreateIndex
CREATE INDEX "VolunteerBadge_volunteerId_idx" ON "VolunteerBadge"("volunteerId");

-- CreateIndex
CREATE INDEX "VolunteerAchievement_volunteerId_idx" ON "VolunteerAchievement"("volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerReport_ngoId_volunteerId_month_year_key" ON "VolunteerReport"("ngoId", "volunteerId", "month", "year");

-- CreateIndex
CREATE INDEX "VolunteerActivity_ngoId_idx" ON "VolunteerActivity"("ngoId");

-- CreateIndex
CREATE INDEX "VolunteerActivity_volunteerId_idx" ON "VolunteerActivity"("volunteerId");

-- CreateIndex
CREATE INDEX "CommunicationThread_ngoId_idx" ON "CommunicationThread"("ngoId");

-- CreateIndex
CREATE INDEX "CommunicationMessage_threadId_idx" ON "CommunicationMessage"("threadId");

-- CreateIndex
CREATE INDEX "ComplianceDocument_ngoId_idx" ON "ComplianceDocument"("ngoId");

-- CreateIndex
CREATE INDEX "ChecklistTask_complianceId_idx" ON "ChecklistTask"("complianceId");

-- CreateIndex
CREATE INDEX "SavedReport_ngoId_idx" ON "SavedReport"("ngoId");

-- CreateIndex
CREATE INDEX "Pledge_ngoId_idx" ON "Pledge"("ngoId");

-- CreateIndex
CREATE INDEX "Pledge_donorId_idx" ON "Pledge"("donorId");

-- CreateIndex
CREATE INDEX "Reminder_ngoId_idx" ON "Reminder"("ngoId");

-- CreateIndex
CREATE INDEX "Reminder_donorId_idx" ON "Reminder"("donorId");

-- CreateIndex
CREATE INDEX "Reminder_pledgeId_idx" ON "Reminder"("pledgeId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donor" ADD CONSTRAINT "Donor_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerLog" ADD CONSTRAINT "VolunteerLog_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerBadge" ADD CONSTRAINT "VolunteerBadge_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAchievement" ADD CONSTRAINT "VolunteerAchievement_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerReport" ADD CONSTRAINT "VolunteerReport_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerReport" ADD CONSTRAINT "VolunteerReport_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerActivity" ADD CONSTRAINT "VolunteerActivity_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerActivity" ADD CONSTRAINT "VolunteerActivity_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerActivity" ADD CONSTRAINT "VolunteerActivity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationThread" ADD CONSTRAINT "CommunicationThread_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CommunicationThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDocument" ADD CONSTRAINT "ComplianceDocument_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistTask" ADD CONSTRAINT "ChecklistTask_complianceId_fkey" FOREIGN KEY ("complianceId") REFERENCES "ComplianceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
