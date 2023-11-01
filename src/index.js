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


app.use(cors());


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



async function getBearerToken() {
  try {
    const response = await axios.post(apiEndpoint, null, {
      headers: {
        'token': '68e350b2-690f-4450-affd-bb1bf1f4a5fa',
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

app.get('/api/config', (req, res) => {
  const configFile = path.join(__dirname, 'config.json');
  const configData = fs.readFileSync(configFile, 'utf8');
  const config = JSON.parse(configData);

  res.json(config);
});

app.get('/admin', (req, res) => {
  const configFile = path.join(__dirname, 'config.json');
  try {
    const configData = fs.readFileSync(configFile, 'utf8');
    const config = JSON.parse(configData);
    res.render('admin', { config });
  } catch (error) {
    console.error('Erro ao ler o arquivo config.json:', error);
    const config = {};
    res.render('admin', { config });
  }
});

app.get('/api/config/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const configUpdateHandler = (config) => {
    res.write(`data: ${JSON.stringify(config)}\n\n`);
  };

  emitter.on('configUpdate', configUpdateHandler);

  req.on('close', () => {
    emitter.removeListener('configUpdate', configUpdateHandler);
  });
});

app.post('/api/config', (req, res) => {
  const { diasConcluidos, metaUdi, metaGyn } = req.body;

  const newConfig = {
    diasConcluidos: parseInt(diasConcluidos, 10),
    metaUdi: parseFloat(metaUdi),
    metaGyn: parseFloat(metaGyn),
  };

  if (!isNaN(newConfig.diasConcluidos) && !isNaN(newConfig.metaUdi) && !isNaN(newConfig.metaGyn)) {
    const configFile = path.join(__dirname, 'config.json');
    fs.writeFileSync(configFile, JSON.stringify(newConfig, null, 2));

    emitter.emit('configUpdate', newConfig);

    res.redirect('/admin');
  } else {
    res.status(400).json({ error: 'Valores inválidos fornecidos' });
  }
});

app.get('/api/consulta/0', async (req, res) => {
  try {
    const token = await getToken();
    if (!token) {
      return res.status(500).json({ error: 'Erro ao obter o token.' });
    }

    const formattedData = await fetchAndFormatData(token, udiPayload.buildPayload());
    if (!formattedData) {
      return res.status(500).json({ error: 'Erro na consulta.' });
    }

    for (const row of formattedData.responseBody.rows) {
      // Verifique se a linha já existe no banco com base no nroUnico.
      const registroBanco = await prisma.pedidoNFatur.findFirst({
        where: { nroUnico: row[1] },
      });

      const dataDeModificacao = new Date();

      if (registroBanco) {
        // Se a linha já existe, atualize os dados no banco.
        await prisma.pedidoNFatur.update({
          where: { id: registroBanco.id },
          data: {
            empresa: row[0],
            nroNota: row[2],
            ordemCarga: row[3],
            dataNegociacao: row[4],
            previsaoEntrega: row[5],
            codTipoOper: row[6],
            descTipoOper: row[7],
            tipMov: row[8],
            entregaCliente: row[9],
            codVendedor: row[10],
            vendedor: row[11],
            codParceiro: row[12],
            razaoSocial: row[13],
            pendente: row[14],
            codProduto: row[15],
            descricaoProduto: row[16],
            marca: row[17],
            controle: row[18],
            qtdNegociada: row[19],
            qtdPendente: row[20],
            estoque: row[21],
            valorUnitario: row[22],
            valorTotal: row[23],
            valorPendente: row[24],
            mes: row[25],
            statusAguardando: row[26],
            previsaoEntregaFinal: row[27],
            dataModificacao: new Date(), 
          },
        });
      } else {
        await prisma.pedidoNFatur.create({
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
            codVendedor: row[10],
            vendedor: row[11],
            codParceiro: row[12],
            razaoSocial: row[13],
            pendente: row[14],
            codProduto: row[15],
            descricaoProduto: row[16],
            marca: row[17],
            controle: row[18],
            qtdNegociada: row[19],
            qtdPendente: row[20],
            estoque: row[21],
            valorUnitario: row[22],
            valorTotal: row[23],
            valorPendente: row[24],
            mes: row[25],
            statusAguardando: row[26],
            previsaoEntregaFinal: row[27],
            dataModificacao: new Date(),
          },
        });
      }
    }

await prisma.pedidoNFatur.deleteMany({
  where: {
    NOT: {
      nroUnico: {
        in: formattedData.responseBody.rows.map((row) => row[1])
      }
    }
  }
});


    return res.json(formattedData);
    
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
      const registroBanco = await prisma.pedidoNFatur.findFirst({
        where: { nroUnico: row[1] },
      });

      const dataDeModificacao = new Date();

      if (registroBanco) {
        // Se a linha já existe, atualize os dados no banco.
        await prisma.pedidoNFatur.update({
          where: { id: registroBanco.id },
          data: {
            empresa: row[0],
            nroNota: row[2],
            ordemCarga: row[3],
            dataNegociacao: row[4],
            previsaoEntrega: row[5],
            codTipoOper: row[6],
            descTipoOper: row[7],
            tipMov: row[8],
            entregaCliente: row[9],
            codVendedor: row[10],
            vendedor: row[11],
            codParceiro: row[12],
            razaoSocial: row[13],
            pendente: row[14],
            codProduto: row[15],
            descricaoProduto: row[16],
            marca: row[17],
            controle: row[18],
            qtdNegociada: row[19],
            qtdPendente: row[20],
            estoque: row[21],
            valorUnitario: row[22],
            valorTotal: row[23],
            valorPendente: row[24],
            mes: row[25],
            statusAguardando: row[26],
            previsaoEntregaFinal: row[27],
            dataModificacao: dataDeModificacao, // Adicione a data de modificação
          },
        });
      } else {
        // Se a linha não existe, insira uma nova entrada no banco.
        await prisma.pedidoNFatur.create({
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
            codVendedor: row[10],
            vendedor: row[11],
            codParceiro: row[12],
            razaoSocial: row[13],
            pendente: row[14],
            codProduto: row[15],
            descricaoProduto: row[16],
            marca: row[17],
            controle: row[18],
            qtdNegociada: row[19],
            qtdPendente: row[20],
            estoque: row[21],
            valorUnitario: row[22],
            valorTotal: row[23],
            valorPendente: row[24],
            mes: row[25],
            statusAguardando: row[26],
            previsaoEntregaFinal: row[27],
            dataModificacao: dataDeModificacao, // Adicione a data de modificação
          },
        });
      }
    }

    // Remova registros do banco que não foram incluídos na consulta.
    await prisma.pedidoNFatur.deleteMany({
      NOT: { nroUnico: { in: formattedData.responseBody.rows.map((row) => row[1]) } },
    });
  } catch (error) {
    console.error('Ocorreu um erro:', error);
  }
});

app.get('/tabela', async (req, res) => {
  const pedidos = await prisma.pedidoNFatur.findMany(); // Consulta o banco para obter os pedidos
  res.json(pedidos); // Envia os dados dos pedidos como JSON
});




app.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});
