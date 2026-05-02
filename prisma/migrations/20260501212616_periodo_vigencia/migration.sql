/*
  Warnings:

  - You are about to drop the column `nome` on the `Periodo` table. All data in the column will be lost (will be re-derived from `ordem`).
  - A unique constraint covering the columns `[turmaId, ordem]` on the table `Periodo` will be added.

*/
-- AlterTable
ALTER TABLE "Periodo" DROP COLUMN "nome",
ADD COLUMN     "dataInicio" TIMESTAMP(3),
ADD COLUMN     "dataFim" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Periodo_turmaId_ordem_key" ON "Periodo"("turmaId", "ordem");
