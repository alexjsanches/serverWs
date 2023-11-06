const axios = require('axios');
const contentType = 'application/json';
const apiLink = 'https://api.sankhya.com.br/gateway/v1/mge/service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json';

async function fetchAndFormatData(token, payload) {
  try {
    const apiUrl = apiLink;
    const response = await axios.post(
      apiUrl,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': contentType,
        },
      }
    );

    const data = response.data;
    console.log(data);

    if (data && data.responseBody && data.responseBody.rows) {
      const formattedData = {
        serviceName: data.serviceName,
        status: data.status,
        pendingPrinting: data.pendingPrinting,
        transactionId: data.transactionId,
        responseBody: {
          fieldsMetadata: data.responseBody.fieldsMetadata,
          rows: data.responseBody.rows,
          burstLimit: data.responseBody.burstLimit,
          timeQuery: data.responseBody.timeQuery,
          timeResultSet: data.responseBody.timeResultSet,
        },
      };

      return formattedData;
    } else {
      console.error('Estrutura de resposta inválida');
      return null;
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return null;
  }
}

async function getToken() {
  try {
    const tokenResponse = await axios.get('http://serverws2.onrender.com/api/token');
    return tokenResponse.data.token;
  } catch (error) {
    console.error('Erro ao obter o token:', error);
    return null;
  }
}

module.exports = {
  fetchAndFormatData,
  getToken,
};
