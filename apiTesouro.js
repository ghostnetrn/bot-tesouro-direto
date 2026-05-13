require("dotenv").config();
const axios = require("axios");
const { format } = require("date-fns");
const path = require("path");
const fs = require("fs");
const Papa = require("papaparse");
const ss = require("simple-statistics");

const arquivoCsv = path.join(__dirname, "PrecoTaxaTesouroDireto.csv");
const arquivoCsvInvestir = path.join(__dirname, "rendimento_investir.csv");
const arquivoCsvResgatar = path.join(__dirname, "rendimento_resgatar.csv");
const urlArquivo = process.env.URL_FILE_TESOURO;

/**
 * Remove BOM UTF-8 do início do texto
 */
function removeBOM(text) {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

/**
 * Detecta o delimitador do CSV
 */
function detectDelimiter(csvText) {
  const firstLine = csvText.split("\n")[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

/**
 * Converte número brasileiro para JavaScript
 */
function parseNumberBR(str) {
  if (!str || str === "") return 0;
  str = String(str).trim();
  str = str.replace(/[R$\s\u00A0]/g, "");
  if (str.includes(".") && str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    str = str.replace(",", ".");
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Lê e parseia um CSV local
 */
function readCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo ${filePath} não encontrado`);
  }

  const buffer = fs.readFileSync(filePath);
  let csvText;

  try {
    csvText = buffer.toString("utf-8");
    if (!csvText.includes("Título") && !csvText.includes("Tipo Titulo")) {
      csvText = buffer.toString("latin1");
    }
  } catch {
    csvText = buffer.toString("latin1");
  }

  csvText = removeBOM(csvText);
  const delimiter = detectDelimiter(csvText);

  const parsed = Papa.parse(csvText, {
    delimiter,
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data;
}

/**
 * Retorna as informações de um título específico do Tesouro Direto.
 * Agora usa o CSV de investimento em vez da API antiga.
 * @param {string} bondName Nome do título
 * @return {Object} Objeto contendo informações do título
 **/
async function getTituloInfo(bondName) {
  try {
    const data = readCSV(arquivoCsvInvestir);

    for (const row of data) {
      const titulo = row["Título"] || row["Titulo"] || "";

      if (titulo.toLowerCase() === bondName.toLowerCase()) {
        const rendimento = row["Rendimento anual do título"] || row["Rendimento"] || "";
        const minimo = row["Investimento mínimo"] || row["Investimento minimo"] || "";
        const preco = row["Preço unitário de investimento"] || row["Preco unitario"] || "";
        const vencimento = row["Vencimento do Título"] || row["Vencimento"] || "";

        const info = {
          titulo: titulo,
          investimentoMinimo: minimo,
          precoUnitario: preco,
          vencimento: vencimento,
          rentabilidadeAnual: rendimento,
        };

        return info;
      }
    }

    throw new Error("Título não encontrado.");
  } catch (error) {
    throw error;
  }
}

/**
 * Lista títulos com rentabilidade maior que o percentual especificado
 */
async function listarTitulosComRentabilidadeAlta(percentual) {
  try {
    const data = readCSV(arquivoCsvInvestir);
    const titulosComRentabilidadeAlta = [];

    for (const row of data) {
      const titulo = row["Título"] || row["Titulo"] || "";
      const rendimento = row["Rendimento anual do título"] || row["Rendimento"] || "";

      // Extrair apenas o número da taxa
      let taxa = 0;
      if (rendimento.includes("+")) {
        const parts = rendimento.split("+");
        taxa = parseNumberBR(parts[1].replace("%", ""));
      } else {
        taxa = parseNumberBR(rendimento.replace("%", ""));
      }

      if (taxa > percentual) {
        titulosComRentabilidadeAlta.push({
          nm: titulo,
          anulInvstmtRate: taxa,
          minInvstmtAmt: parseNumberBR(row["Investimento mínimo"] || "0"),
          untrInvstmtVal: parseNumberBR(row["Preço unitário de investimento"] || "0"),
          mtrtyDt: row["Vencimento do Título"] || row["Vencimento"] || "",
        });
      }
    }

    if (titulosComRentabilidadeAlta.length === 0) {
      return `Nenhum título encontrado com rentabilidade maior do que ${percentual}.`;
    }

    return titulosComRentabilidadeAlta;
  } catch (error) {
    throw error;
  }
}

/**
 * Lista títulos com investimento mínimo disponível
 */
async function listarTitulosComInvestimentoMinimo() {
  try {
    const data = readCSV(arquivoCsvInvestir);
    const titulos = [];

    for (const row of data) {
      const titulo = row["Título"] || row["Titulo"] || "";
      const minimo = parseNumberBR(row["Investimento mínimo"] || "0");

      if (minimo > 0 && titulo) {
        titulos.push(titulo);
      }
    }

    return titulos;
  } catch (error) {
    throw error;
  }
}

/**
 * Lista todos os títulos disponíveis
 */
async function listarTitulos() {
  try {
    const data = readCSV(arquivoCsvInvestir);
    const titulos = [];

    for (const row of data) {
      const titulo = row["Título"] || row["Titulo"] || "";
      const minimo = parseNumberBR(row["Investimento mínimo"] || "0");

      if (minimo > 0 && titulo) {
        const rendimento = row["Rendimento anual do título"] || row["Rendimento"] || "";
        let taxa = 0;

        if (rendimento.includes("+")) {
          const parts = rendimento.split("+");
          taxa = parseNumberBR(parts[1].replace("%", ""));
        } else {
          taxa = parseNumberBR(rendimento.replace("%", ""));
        }

        titulos.push({
          TrsrBd: {
            nm: titulo,
            anulInvstmtRate: taxa,
            minInvstmtAmt: minimo,
            untrInvstmtVal: parseNumberBR(row["Preço unitário de investimento"] || "0"),
            mtrtyDt: row["Vencimento do Título"] || row["Vencimento"] || "",
          },
        });
      }
    }

    return titulos;
  } catch (error) {
    throw error;
  }
}

/**
 * Baixa o arquivo CSV histórico se necessário
 */
async function baixarArquivoSeNecessario() {
  if (!fs.existsSync(arquivoCsv)) {
    console.log("Iniciando download do arquivo histórico...");
    const response = await axios.get(urlArquivo, { responseType: "stream" });

    console.log("Download do arquivo concluído.");
    const stream = response.data.pipe(fs.createWriteStream(arquivoCsv));

    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        console.log("Arquivo salvo localmente.");
        resolve();
      });

      stream.on("error", (error) => {
        console.error(`Erro ao salvar o arquivo: ${error}`);
        reject(error);
      });
    });
  }

  const ultimaAtualizacao = await obterDataUltimaAtualizacao();

  if (await arquivoEstaDesatualizado(ultimaAtualizacao)) {
    console.log("Arquivo desatualizado. Iniciando download...");
    const response = await axios.get(urlArquivo, { responseType: "stream" });

    console.log("Download do arquivo concluído.");
    const stream = response.data.pipe(fs.createWriteStream(arquivoCsv));

    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        console.log("Arquivo salvo localmente.");
        resolve();
      });

      stream.on("error", (error) => {
        console.error(`Erro ao salvar o arquivo: ${error}`);
        reject(error);
      });
    });
  } else {
    return Promise.resolve();
  }
}

function obterDataUltimaAtualizacao() {
  return new Promise((resolve, reject) => {
    fs.stat(arquivoCsv, (error, stats) => {
      if (error) {
        reject(error);
      } else {
        const dataAtualizacao = new Date(stats.mtime);
        resolve(dataAtualizacao);
      }
    });
  });
}

async function arquivoEstaDesatualizado(ultimaAtualizacao) {
  try {
    const response = await axios.head(urlArquivo);
    const dataUltimaModificacao = new Date(response.headers["last-modified"]);
    return dataUltimaModificacao > ultimaAtualizacao;
  } catch (error) {
    console.error("Erro ao verificar atualização:", error.message);
    return false;
  }
}

/**
 * Obtém estatísticas históricas de um título específico
 */
async function getTesouroInfo(tipoTitulo, vencimentoTitulo) {
  await baixarArquivoSeNecessario();

  return new Promise((resolve, reject) => {
    const pus = [];
    const buffer = fs.readFileSync(arquivoCsv);

    let csvText;
    try {
      csvText = buffer.toString("utf-8");
      if (!csvText.includes("Tipo Titulo")) {
        csvText = buffer.toString("latin1");
      }
    } catch {
      csvText = buffer.toString("latin1");
    }

    csvText = removeBOM(csvText);
    const delimiter = detectDelimiter(csvText);

    const parsed = Papa.parse(csvText, {
      delimiter,
      header: true,
      skipEmptyLines: true,
    });

    for (const row of parsed.data) {
      if (
        row["Tipo Titulo"] === tipoTitulo &&
        row["Data Vencimento"] === vencimentoTitulo
      ) {
        const taxaCompra = parseNumberBR(row["Taxa Compra Manha"]);
        if (taxaCompra > 0) {
          pus.push(taxaCompra);
        }
      }
    }

    if (pus.length === 0) {
      return resolve({
        min: "0.00",
        q1: "0.00",
        median: "0.00",
        q3: "0.00",
        max: "0.00",
        mean: "0.00",
        stdev: "0.00",
      });
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
}

module.exports = {
  getTituloInfo,
  listarTitulosComInvestimentoMinimo,
  listarTitulosComRentabilidadeAlta,
  listarTitulos,
  getTesouroInfo,
};
