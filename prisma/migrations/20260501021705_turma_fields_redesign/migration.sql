-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NivelEnsino" ADD VALUE 'FUNDAMENTAL_I';
ALTER TYPE "NivelEnsino" ADD VALUE 'FUNDAMENTAL_II';

-- AlterTable
ALTER TABLE "Turma" ADD COLUMN     "turma" TEXT NOT NULL DEFAULT 'A';
