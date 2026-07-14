-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "holder_document" TEXT,
ADD COLUMN     "holder_email" TEXT,
ADD COLUMN     "holder_name" TEXT,
ADD COLUMN     "origin_city" TEXT,
ADD COLUMN     "origin_country" TEXT DEFAULT 'BR',
ADD COLUMN     "origin_ip" TEXT,
ADD COLUMN     "origin_state" TEXT,
ADD COLUMN     "threat_description" TEXT;
