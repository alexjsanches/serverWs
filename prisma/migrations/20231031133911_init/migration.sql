/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "empresa" INTEGER NOT NULL,
    "Nro. Unico" INTEGER NOT NULL,
    "Nro. Nota" INTEGER NOT NULL,
    "Ordem de carga" INTEGER NOT NULL,
    "Data de negociação" TIMESTAMP(3) NOT NULL,
    "Previsão de entrega" TIMESTAMP(3) NOT NULL,
    "TOP" INTEGER NOT NULL,
    "Descr. Top" TEXT NOT NULL,
    "Tip. Mov" TEXT NOT NULL,
    "Entrega Cliente" TEXT NOT NULL,
    "Cód. Vendedor" INTEGER NOT NULL,
    "Vendedor" TEXT NOT NULL,
    "Cod.Parc" INTEGER NOT NULL,
    "Razão Social" TEXT NOT NULL,
    "Pendente" TEXT NOT NULL,
    "Cód.Prod" INTEGER NOT NULL,
    "Descrição" TEXT NOT NULL,
    "Marca" TEXT NOT NULL,
    "Controle" INTEGER NOT NULL,
    "Qtd.Neg" DOUBLE PRECISION NOT NULL,
    "Qtd.Pendente" DOUBLE PRECISION NOT NULL,
    "Estoque" DOUBLE PRECISION NOT NULL,
    "Vlr. Unit" DOUBLE PRECISION NOT NULL,
    "Vlr.Total" DOUBLE PRECISION NOT NULL,
    "Vlr. Pendente" DOUBLE PRECISION NOT NULL,
    "mes" TEXT NOT NULL,
    "Status Aguardando" TEXT NOT NULL,
    "PREVISÃO ENTREGA" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);
