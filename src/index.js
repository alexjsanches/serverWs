const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { EventEmitter } = require('events');
require('dotenv').config();
const { getToken, fetchAndFormatData } = require('./app/connection');
const udiPayload = require('./app/query');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');





const emitter = new EventEmitter();
app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurações
const port = process.env.PORT || 3333;

let bearerToken = '';
const apiEndpoint = 'https://api.sankhya.com.br/login';
const appKey = '2a1e93b9-4f51-41e5-941f-45d783c3dd90';
const username = 'alexandre.sanches@worldseg.com.br';
const password = '862485inteliX!';

app.use(cors());

async function getBearerToken() {
  try {
    const response = await axios.post(apiEndpoint, null, {
      headers: {
        'token': 'd7f6aee6-d8e0-46c2-a968-1df465218af1',
        'appkey': appKey,
        'username': username,
        'password': password,
      },
    });

    if (response.status === 200) {
      const data = response.data;
      if (data.bearerToken) {
        bearerToken = data.bearerToken;
        return bearerToken;
      } else {
        throw new Error('Chave "bearerToken" não encontrada na resposta JSON.');
      }
    } else {
      throw new Error(`Erro ao obter o token: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/api/token', async (req, res) => {
  try {
    const token = await getBearerToken();
    if (token !== null) {
      res.json({ token });
    } else {
      res.status(500).json({ error: 'Erro ao obter o token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro na requisição' });
  }
});


let dadosInseridos = false;


app.get('/api/consulta/0', async (req, res) => {
  try {
    const token = await getToken();
    if (!token) {
      return res.status(500).json({ error: 'Erro ao obter o token.' });
    }

    if (!dadosInseridos) {
      // Se a tabela estiver vazia, escreva os dados nela
      const formattedData = await fetchAndFormatData(token, udiPayload.buildPayload());
      if (!formattedData) {
        return res.status(500).json({ error: 'Erro na consulta.' });
      }



      for (const row of formattedData.responseBody.rows) {

        await prisma.pedido.create({
          data: {
            empresa: row[0],
            nroUnico: row[1],
            nroNota: row[2],
            ordemCarga: row[3],
            dataNegociacao: row[4],
            previsaoEntrega: row[5],
            codTipoOper: row[6],
            descTipoOper: row[7],
            tipMov: row[8],
            entregaCliente: row[9],
            codVendExt: row[10],
            vendedorExt: row[11],
            codVendedor: row[12],
            vendedor: row[13],
            codParceiro: row[14],
            razaoSocial: row[15],
            pendente: row[16],
            codProduto: row[17],
            descricaoProduto: row[18],
            marca: row[19],
            controle: row[20],
            qtdNegociada: row[21],
            qtdPendente: row[22],
            estoque: row[23],
            valorUnitario: row[24],
            valorTotal: row[25],
            valorPendente: row[26],
            mes: row[27],
            statusAguardando: row[28],
            previsaoEntregaFinal: row[29],
            dataModificacao: new Date(),
          },
        });
      }

      dadosInseridos = true;

      return res.json({ message: 'Dados inseridos no banco.' });
    } else {
      // Se a tabela não estiver vazia, execute as verificações
      const formattedData = await fetchAndFormatData(token, udiPayload.buildPayload());
      if (!formattedData) {
        return res.status(500).json({ error: 'Erro na consulta.' });
      }

      for (const row of formattedData.responseBody.rows) {
        const registroBanco = await prisma.pedido.findFirst({
          where: { nroUnico: row[1] },
        });

        if (registroBanco) {
          // Atualize os dados no banco
          await prisma.pedido.update({
            where: { id: registroBanco.id },
            data: {
              empresa: row[0],
              nroUnico: row[1],
              nroNota: row[2],
              ordemCarga: row[3],
              dataNegociacao: row[4],
              previsaoEntrega: row[5],
              codTipoOper: row[6],
              descTipoOper: row[7],
              tipMov: row[8],
              entregaCliente: row[9],
              codVendExt: row[10],
              vendedorExt: row[11],
              codVendedor: row[12],
              vendedor: row[13],
              codParceiro: row[14],
              razaoSocial: row[15],
              pendente: row[16],
              codProduto: row[17],
              descricaoProduto: row[18],
              marca: row[19],
              controle: row[20],
              qtdNegociada: row[21],
              qtdPendente: row[22],
              estoque: row[23],
              valorUnitario: row[24],
              valorTotal: row[25],
              valorPendente: row[26],
              mes: row[27],
              statusAguardando: row[28],
              previsaoEntregaFinal: row[29],
              dataModificacao: new Date(),
            },
          });
        } else {
          // Crie um novo registro no banco
          await prisma.pedido.create({
            data: {
              empresa: row[0],
              nroUnico: row[1],
              nroNota: row[2],
              ordemCarga: row[3],
              dataNegociacao: row[4],
              previsaoEntrega: row[5],
              codTipoOper: row[6],
              descTipoOper: row[7],
              tipMov: row[8],
              entregaCliente: row[9],
              codVendExt: row[10],
              vendedorExt: row[11],
              codVendedor: row[12],
              vendedor: row[13],
              codParceiro: row[14],
              razaoSocial: row[15],
              pendente: row[16],
              codProduto: row[17],
              descricaoProduto: row[18],
              marca: row[19],
              controle: row[20],
              qtdNegociada: row[21],
              qtdPendente: row[22],
              estoque: row[23],
              valorUnitario: row[24],
              valorTotal: row[25],
              valorPendente: row[26],
              mes: row[27],
              statusAguardando: row[28],
              previsaoEntregaFinal: row[29],
              dataModificacao: new Date(),
            },
          });
        }
      }

      await prisma.pedido.deleteMany({
        where: {
          NOT: {
            nroUnico: {
              in: formattedData.responseBody.rows.map((row) => row[1])
            }
          }
        }
      });

      return res.json({ message: 'Verificações realizadas no banco.' });
    }
  } catch (error) {
    console.error('Ocorreu um erro:', error);
    return res.status(500).json({ error: 'Erro no servidor.' });
  }
});


cron.schedule('0 0 * * *', async () => {
  try {
    // Obtém o bearer token.
    const bearerToken = await getBearerToken();

    if (!bearerToken) {
      console.error('Erro ao obter o token.');
      return;
    }

    // Realize a consulta e formate os dados.
    const formattedData = await fetchAndFormatData(bearerToken, udiPayload.buildPayload());

    if (!formattedData) {
      console.error('Erro na consulta.');
      return;
    }

    for (const row of formattedData.responseBody.rows) {
      // Verifique se a linha já existe no banco com base no nroUnico.
      const registroBanco = await prisma.pedido.findFirst({
        where: { nroUnico: row[1] },
      });

      const dataDeModificacao = new Date();

      if (registroBanco) {
        // Se a linha já existe, atualize os dados no banco.
        await prisma.pedido.update({
          where: { id: registroBanco.id },
          data: {
            empresa: row[0],
            nroUnico: row[1],
            nroNota: row[2],
            ordemCarga: row[3],
            dataNegociacao: row[4],
            previsaoEntrega: row[5],
            codTipoOper: row[6],
            descTipoOper: row[7],
            tipMov: row[8],
            entregaCliente: row[9],
            codVendExt: row[10],
            vendedorExt: row[11],
            codVendedor: row[12],
            vendedor: row[13],
            codParceiro: row[14],
            razaoSocial: row[15],
            pendente: row[16],
            codProduto: row[17],
            descricaoProduto: row[18],
            marca: row[19],
            controle: row[20],
            qtdNegociada: row[21],
            qtdPendente: row[22],
            estoque: row[23],
            valorUnitario: row[24],
            valorTotal: row[25],
            valorPendente: row[26],
            mes: row[27],
            statusAguardando: row[28],
            previsaoEntregaFinal: row[29],
            dataModificacao: dataDeModificacao,
          },
        });
      } else {
        // Se a linha não existe, insira uma nova entrada no banco.
        await prisma.pedido.create({
          data: {
            empresa: row[0],
            nroUnico: row[1],
            nroNota: row[2],
            ordemCarga: row[3],
            dataNegociacao: row[4],
            previsaoEntrega: row[5],
            codTipoOper: row[6],
            descTipoOper: row[7],
            tipMov: row[8],
            entregaCliente: row[9],
            codVendExt: row[10],
            vendedorExt: row[11],
            codVendedor: row[12],
            vendedor: row[13],
            codParceiro: row[14],
            razaoSocial: row[15],
            pendente: row[16],
            codProduto: row[17],
            descricaoProduto: row[18],
            marca: row[19],
            controle: row[20],
            qtdNegociada: row[21],
            qtdPendente: row[22],
            estoque: row[23],
            valorUnitario: row[24],
            valorTotal: row[25],
            valorPendente: row[26],
            mes: row[27],
            statusAguardando: row[28],
            previsaoEntregaFinal: row[29],
            dataModificacao: dataDeModificacao,
          },
        });
      }
    }

    // Remova registros do banco que não foram incluídos na consulta.
    await prisma.pedido.deleteMany({
      NOT: { nroUnico: { in: formattedData.responseBody.rows.map((row) => row[1]) } },
    });
  } catch (error) {
    console.error('Ocorreu um erro:', error);
  }
});

app.get('/tabela', async (req, res) => {
  const pedidos = await prisma.pedido.findMany(); // Consulta o banco para obter os pedidos
  res.json({ pedidos }); // Renderiza uma página chamada 'tabela' e envia os dados dos pedidos para serem exibidos
});




app.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});
