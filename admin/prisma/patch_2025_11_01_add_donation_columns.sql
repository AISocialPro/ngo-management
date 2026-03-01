-- Create enum for PaymentMode if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentMode') THEN
    CREATE TYPE "PaymentMode" AS ENUM ('UPI','CARD','NETBANKING','CHEQUE','CASH','BANK_TRANSFER','OTHER');
  END IF;
END
$$;

-- Donation table: add missing columns
ALTER TABLE "Donation"
  ADD COLUMN IF NOT EXISTS "currency"      TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS "fxRate"        NUMERIC(12,6),
  ADD COLUMN IF NOT EXISTS "fcra"          BOOLEAN,
  ADD COLUMN IF NOT EXISTS "paymentMode"   "PaymentMode",
  ADD COLUMN IF NOT EXISTS "utr"           TEXT,
  ADD COLUMN IF NOT EXISTS "bankName"      TEXT,
  ADD COLUMN IF NOT EXISTS "cardLast4"     TEXT,
  ADD COLUMN IF NOT EXISTS "chequeNo"      TEXT,
  ADD COLUMN IF NOT EXISTS "gateway"       TEXT,
  ADD COLUMN IF NOT EXISTS "gatewayRef"    TEXT,
  ADD COLUMN IF NOT EXISTS "giftInMemoryOf" TEXT,
  ADD COLUMN IF NOT EXISTS "giftInHonourOf" TEXT,
  ADD COLUMN IF NOT EXISTS "utmSource"     TEXT,
  ADD COLUMN IF NOT EXISTS "utmMedium"     TEXT,
  ADD COLUMN IF NOT EXISTS "utmCampaign"   TEXT,
  ADD COLUMN IF NOT EXISTS "utmTerm"       TEXT,
  ADD COLUMN IF NOT EXISTS "utmContent"    TEXT,
  ADD COLUMN IF NOT EXISTS "receiptNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "receiptFileUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Unique on receiptNumber (nullable unique)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = ANY (current_schemas(true))
      AND indexname = 'Donation_receiptNumber_key'
  ) THEN
    CREATE UNIQUE INDEX "Donation_receiptNumber_key"
      ON "Donation" (("receiptNumber"))
      WHERE "receiptNumber" IS NOT NULL;
  END IF;
END
$$;

-- Helpful composite index for gateway lookups
CREATE INDEX IF NOT EXISTS "Donation_gateway_gatewayRef_idx"
  ON "Donation" ("gateway", "gatewayRef");
