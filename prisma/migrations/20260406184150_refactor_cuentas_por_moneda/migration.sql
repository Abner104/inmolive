/*
  Warnings:

  - You are about to drop the `CuentaBancaria` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CuentaBancaria" DROP CONSTRAINT "CuentaBancaria_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "monedaDefault" "Currency" NOT NULL DEFAULT 'CLP';

-- DropTable
DROP TABLE "CuentaBancaria";

-- CreateTable
CREATE TABLE "CuentaPago" (
    "id" TEXT NOT NULL,
    "moneda" "Currency" NOT NULL,
    "titular" TEXT NOT NULL,
    "email" TEXT,
    "instrucciones" TEXT,
    "banco" TEXT,
    "tipoCuenta" TEXT,
    "numeroCuenta" TEXT,
    "documento" TEXT,
    "metodoUSD" TEXT,
    "zellePhone" TEXT,
    "paypalEmail" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuentaPago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CuentaPago_userId_moneda_key" ON "CuentaPago"("userId", "moneda");

-- AddForeignKey
ALTER TABLE "CuentaPago" ADD CONSTRAINT "CuentaPago_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
