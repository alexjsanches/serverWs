/*
  Warnings:

  - You are about to drop the `PedidoNFatur` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PedidoNFatur";

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "empresa" INTEGER NOT NULL,
    "nroUnico" INTEGER NOT NULL,
    "nroNota" INTEGER NOT NULL,
    "ordemCarga" INTEGER,
    "dataNegociacao" TEXT NOT NULL,
    "previsaoEntrega" TEXT,
    "codTipoOper" INTEGER NOT NULL,
    "descTipoOper" TEXT NOT NULL,
    "tipMov" TEXT NOT NULL,
    "entregaCliente" TEXT NOT NULL,
    "codVendedor" INTEGER NOT NULL,
    "vendedor" TEXT NOT NULL,
    "codParceiro" INTEGER NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "pendente" TEXT NOT NULL,
    "codProduto" INTEGER NOT NULL,
    "descricaoProduto" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "controle" TEXT,
    "qtdNegociada" DOUBLE PRECISION NOT NULL,
    "qtdPendente" DOUBLE PRECISION NOT NULL,
    "estoque" DOUBLE PRECISION NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "valorPendente" DOUBLE PRECISION NOT NULL,
    "mes" TEXT NOT NULL,
    "statusAguardando" TEXT,
    "previsaoEntregaFinal" TEXT,
    "dataModificacao" TIMESTAMP(3),

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);
