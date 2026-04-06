-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sector" TEXT;

-- CreateTable
CREATE TABLE "GroupCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COLABORADOR',
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupCode_code_key" ON "GroupCode"("code");
