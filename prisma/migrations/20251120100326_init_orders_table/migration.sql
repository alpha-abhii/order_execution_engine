-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ROUTING', 'SUBMITTED', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "inputToken" TEXT NOT NULL,
    "outputToken" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "selectedDex" TEXT,
    "executedPrice" DOUBLE PRECISION,
    "txHash" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
