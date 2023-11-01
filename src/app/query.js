
const buildPayload = () => {
    const payloadReq = {
      serviceName: "DbExplorerSP.executeQuery",
      requestBody: {
        sql: `SELECT CAB.CODEMP AS "Empresa",
        CAB.NUNOTA AS "Nro. Unico",
        CAB.NUMNOTA AS "Nro. Nota",
        CAB.ORDEMCARGA AS "Ordem de carga",
        TRUNC(CAB.DTNEG) AS "Data de negociação",
        CAB.DTPREVENT AS "Previsão de entrega",
        CAB.CODTIPOPER AS "TOP",
        TOP.DESCROPER AS "Descr. Top",
        CAB.TIPMOV AS "Tip. Mov",
        (SELECT OPC.OPCAO
          FROM TDDCAM CAM
          JOIN TDDOPC OPC ON (OPC.NUCAMPO = CAM.NUCAMPO)
          WHERE (CAM.NOMETAB = 'TGFCAB'
          AND NOMECAMPO = 'AD_ENTREGACLIENTE'
          AND OPC.VALOR = CAB.AD_ENTREGACLIENTE)) AS "Entrega Cliente",
        CAB.CODVEND AS "Cód. Vendedor",
        VEN.APELIDO AS "Vendedor",
        CAB.CODPARC AS "Cod.Parc",
        PAR.RAZAOSOCIAL AS "Razão Social",
        ITE.PENDENTE AS "Pendente",
        ITE.CODPROD AS "Cód.Prod",
        PRO.DESCRPROD AS "Descrição",
        PRO.MARCA AS "Marca",
        ITE.CONTROLE AS "Controle",
        ITE.QTDNEG AS "Qtd.Neg",
        (ITE.QTDNEG - ITE.QTDENTREGUE) AS "Qtd.Pendente",
        NVL(
          (SELECT SUM(EST.ESTOQUE)
            FROM TGFEST EST
            WHERE EST.CODEMP = CAB.CODEMP
            AND EST.CODPROD = ITE.CODPROD
            AND EST.CONTROLE = ITE.CONTROLE
            AND EST.CODLOCAL NOT IN (6010, 7010, 8010, 9010)),0) AS "Estoque",
        ITE.VLRUNIT AS "Vlr. Unit",
        ITE.VLRTOT AS "Vlr.Total",
        ROUND(((ITE.QTDNEG - ITE.QTDENTREGUE)*ITE.VLRUNIT),2) AS "Vlr. Pendente",
        (TRIM(TO_CHAR(CAB.DTNEG, 'MONTH', 'NLS_DATE_LANGUAGE=''BRAZILIAN PORTUGUESE'''))
          ||'/'||EXTRACT(YEAR FROM CAB.DTNEG)) AS "Mês",
        (SELECT OPC.OPCAO
          FROM TDDCAM CAM
          JOIN TDDOPC OPC ON (OPC.NUCAMPO = CAM.NUCAMPO)
          WHERE (CAM.NOMETAB = 'TGFCAB'
          AND NOMECAMPO = 'AD_STATUSAGUARD'
          AND OPC.VALOR = CAB.AD_STATUSAGUARD)) AS "Status Aguardando",
        CASE
          WHEN
            (SELECT MAX(I.DTINICIO)
              FROM TGFCAB C,
                TGFITE I
              WHERE C.NUNOTA = I.NUNOTA
              AND I.CODPROD = ITE.CODPROD
              AND I.CONTROLE = ITE.CONTROLE
              AND C.CODTIPOPER IN (11, 127)
              AND I.PENDENTE = 'S'
              AND C.STATUSNOTA = 'L') IS NOT NULL THEN
            (SELECT MAX(I.DTINICIO)
              FROM TGFCAB C,
                TGFITE I
              WHERE C.NUNOTA = I.NUNOTA
              AND I.CODPROD = ITE.CODPROD
              AND I.CONTROLE = ITE.CONTROLE
              AND C.CODTIPOPER IN (11, 127)
              AND I.PENDENTE = 'S'
              AND C.STATUSNOTA = 'L')
          ELSE
            (SELECT MAX(I.DTINICIO)
              FROM TGFCAB C,
                TGFITE I
              WHERE C.NUNOTA = I.NUNOTA
              AND I.CODPROD = ITE.CODPROD
              AND I.CONTROLE = ITE.CONTROLE
              AND C.CODTIPOPER IN (13)
              AND I.PENDENTE = 'S'
              AND C.STATUSNOTA <> 'L')
        END AS "PREVISÃO ENTREGA"
      FROM TGFCAB CAB,
        TGFPAR PAR,
        TGFVEN VEN,
        TGFITE ITE,
        TGFPRO PRO,
        TGFTOP TOP,
        TGFTPV TPV,
        TCSPRJ PRJ
      WHERE CAB.CODPARC = PAR.CODPARC
      AND CAB.CODVEND = VEN.CODVEND
      AND CAB.NUNOTA = ITE.NUNOTA
      AND ITE.CODPROD = PRO.CODPROD
      AND PAR.AD_CODPROJ = PRJ.CODPROJ
      AND ITE.PENDENTE = 'S'
      AND CAB.CODTIPOPER IN (34,175,162,262,234,159,259)
      AND CAB.CODTIPOPER = TOP.CODTIPOPER
      AND CAB.DHTIPOPER = TOP.DHALTER
      AND CAB.CODTIPVENDA = TPV.CODTIPVENDA
      AND CAB.DHTIPVENDA = TPV.DHALTER
      AND CAB.CODEMP IN (1,3)
      AND TRUNC(CAB.DTNEG) BETWEEN '01/09/2023' AND '31/10/2023'
      ORDER BY CAB.CODEMP, CAB.NUNOTA, ITE.SEQUENCIA`,
      },
    };
  
    return payloadReq;
  }
  
  module.exports = {
    buildPayload,
  };
  