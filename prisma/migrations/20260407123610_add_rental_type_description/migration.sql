-- CreateEnum
CREATE TYPE "RentalType" AS ENUM ('MONTHLY', 'DAILY');

-- AlterTable
ALTER TABLE "Charge" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "rentalType" "RentalType" NOT NULL DEFAULT 'MONTHLY';
