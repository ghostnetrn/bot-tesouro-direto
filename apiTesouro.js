const axios = require("axios");
const https = require("https");
const { format } = require("date-fns");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

/**
 * Retorna as informações de um título específico do Tesouro Direto.
 * Fonte: https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm
 * @param {string} bondName Nome do título
 * @return {Object} Objeto contendo informações do título
 **/
async function getTituloInfo(bondName) {
  const srcURL =
    "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json";

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  try {
    const response = await axios.get(srcURL, {
      httpsAgent: agent,
    });

    const parsedData = response.data.response;

    for (const bond of parsedData.TrsrBdTradgList) {
      const currBondName = bond.TrsrBd.nm;
      if (currBondName.toLowerCase() === bondName.toLowerCase()) {
        const { anulInvstmtRate, minInvstmtAmt, untrInvstmtVal, mtrtyDt } =
          bond.TrsrBd;

        const info = {
          titulo: currBondName,
          investimentoMinimo: minInvstmtAmt.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          precoUnitario: untrInvstmtVal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          vencimento: format(new Date(mtrtyDt), "dd/MM/yyyy"),
        };

        if (currBondName.toLowerCase().includes("selic")) {
          info.rentabilidadeAnual = "SELIC + " + anulInvstmtRate + "%";
        } else if (currBondName.toLowerCase().includes("ipca")) {
          info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate + "%";
        } else if (currBondName.toLowerCase().includes("renda")) {
          info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate + "%";
        } else {
          info.rentabilidadeAnual = anulInvstmtRate;
        }
        return info;
      }
    }

    throw new Error("Título não encontrado.");
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getTituloInfo,
};
