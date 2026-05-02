/*
  Warnings:

  - You are about to drop the column `matricula` on the `Aluno` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Aluno" DROP COLUMN "matricula",
ADD COLUMN     "numero" INTEGER;
