-- CreateEnum
CREATE TYPE "TrusteeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'NEW');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('ONGOING', 'UPCOMING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Trustee" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "avatar" TEXT,
    "tenure" TEXT,
    "committees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "TrusteeStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trustee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardActivity" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'ONGOING',
    "title" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "participants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extraText" TEXT,
    "cta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trustee_ngoId_idx" ON "Trustee"("ngoId");

-- CreateIndex
CREATE INDEX "BoardActivity_ngoId_idx" ON "BoardActivity"("ngoId");

-- AddForeignKey
ALTER TABLE "Trustee" ADD CONSTRAINT "Trustee_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardActivity" ADD CONSTRAINT "BoardActivity_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
