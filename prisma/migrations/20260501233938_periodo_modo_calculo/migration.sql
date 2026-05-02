-- CreateEnum
CREATE TYPE "ModoCalculo" AS ENUM ('MEDIA', 'SOMA');

-- AlterTable
ALTER TABLE "Periodo" ADD COLUMN "modoCalculo" "ModoCalculo" NOT NULL DEFAULT 'MEDIA';
