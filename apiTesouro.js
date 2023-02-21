require("dotenv").config();
const axios = require("axios");
const https = require("https");
const { format } = require("date-fns");
const urlApi = process.env.URL_API;
const path = require("path");
const urlarquivo =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv";

// statistics
const fs = require("fs");
const csv = require("csv-parser");
const ss = require("simple-statistics");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

/**
 * Retorna as informações de um título específico do Tesouro Direto.
 * Fonte: https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm
 * @param {string} bondName Nome do título
 * @return {Object} Objeto contendo informações do título
 **/
async function getTituloInfo(bondName) {
  const srcURL = urlApi;

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
          info.rentabilidadeAnual = "SELIC + " + anulInvstmtRate;
        } else if (currBondName.toLowerCase().includes("ipca")) {
          info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate;
        } else if (currBondName.toLowerCase().includes("renda")) {
          info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate;
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

async function listarTitulosComRentabilidadeAlta(percentual) {
  const srcURL = urlApi;
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  try {
    const response = await axios.get(srcURL, {
      httpsAgent: agent,
    });

    const parsedData = response.data.response;

    const titulosComRentabilidadeAlta = parsedData.TrsrBdTradgList.filter(
      (bond) => bond.TrsrBd.anulInvstmtRate > percentual
    ).map((bond) => bond.TrsrBd);

    if (titulosComRentabilidadeAlta.length === 0) {
      return `Nenhum título encontrado com rentabilidade maior do que ${percentual}.`;
    }

    return titulosComRentabilidadeAlta;
  } catch (error) {
    throw error;
  }
}

async function listarTitulosComInvestimentoMinimo() {
  const srcURL = urlApi;

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  try {
    const response = await axios.get(srcURL, {
      httpsAgent: agent,
    });

    const parsedData = response.data.response;
    const titulos = [];

    for (const bond of parsedData.TrsrBdTradgList) {
      const { nm: bondName, minInvstmtAmt } = bond.TrsrBd;
      if (minInvstmtAmt > 0) {
        titulos.push(bondName);
      }
    }

    return titulos;
  } catch (error) {
    throw error;
  }
}

async function listarTitulos() {
  const srcURL = urlApi;

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  try {
    const response = await axios.get(srcURL, {
      httpsAgent: agent,
    });

    const parsedData = response.data.response;
    const titulos = [];

    for (const bond of parsedData.TrsrBdTradgList) {
      const { minInvstmtAmt } = bond.TrsrBd;
      if (minInvstmtAmt > 0) {
        titulos.push(bond);
      }
    }

    return titulos;
  } catch (error) {
    throw error;
  }
}

function getTesouroInfo(tipoTitulo, vencimentoTitulo) {
  const url = urlarquivo;

  return axios
    .get(url, { responseType: "stream" })
    .then((response) => {
      return new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream("PrecoTaxaTesouroDireto.csv"))
          .on("finish", () => {
            const pus = [];
            fs.createReadStream("PrecoTaxaTesouroDireto.csv")
              .pipe(csv({ separator: ";" }))
              .on("data", (row) => {
                if (
                  row["Tipo Titulo"] === tipoTitulo &&
                  row["Data Vencimento"] === vencimentoTitulo
                ) {
                  const taxaCompra = parseFloat(
                    row["Taxa Compra Manha"].replace(",", ".")
                  );
                  pus.push(taxaCompra);
                }
              })
              .on("end", () => {
                if (pus.length === 0) {
                  resolve({
                    min: "0.00",
                    q1: "0.00",
                    median: "0.00",
                    q3: "0.00",
                    max: "0.00",
                    mean: "0.00",
                    stdev: "0.00",
                  });
                  return;
                }

                const min = ss.min(pus);
                const q1 = ss.quantile(pus, 0.25);
                const median = ss.median(pus);
                const q3 = ss.quantile(pus, 0.75);
                const max = ss.max(pus);
                const mean = ss.mean(pus);
                const stdev = ss.standardDeviation(pus);

                resolve({
                  min: min.toFixed(2),
                  q1: q1.toFixed(2),
                  median: median.toFixed(2),
                  q3: q3.toFixed(2),
                  max: max.toFixed(2),
                  mean: mean.toFixed(2),
                  stdev: stdev.toFixed(2),
                });
              });
          });
      });
    })
    .catch((error) => {
      return Promise.reject(`Erro ao baixar o arquivo: ${error}`);
    });
}

module.exports = {
  getTituloInfo,
  listarTitulosComInvestimentoMinimo,
  listarTitulosComRentabilidadeAlta,
  listarTitulos,
  getTesouroInfo,
};
