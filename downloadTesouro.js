const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const Papa = require("papaparse");

const arquivoCsv = "PrecoTaxaTesouroDireto.csv";
const arquivoCsvRendimento = "rendimento_investir.csv";
const arquivoCsvRendimentoResgatar = "rendimento_resgatar.csv";

// URL oficial do Tesouro
const URL_FILE_TESOURO =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv";

// URLs Investidor10
const URL_INVESTIR = "https://investidor10.com.br/tesouro-direto/";
const URL_RESGATAR = "https://investidor10.com.br/tesouro-direto/resgatar/";

async function downloadArquivoCSV(arquivo, url) {
  console.log(`⬇️ Baixando ${arquivo}...`);
  try {
    const response = await axios.get(url, {
      responseType: "stream",
      maxRedirects: 5,
      headers: {
        Accept: "text/csv,application/octet-stream;q=0.9,*/*;q=0.8",
        Referer: "https://www.tesourodireto.com.br/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Safari/537.36",
      },
    });

    const stream = response.data.pipe(fs.createWriteStream(arquivo));
    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        console.log(`✅ ${arquivo} salvo.`);
        resolve();
      });
      stream.on("error", (error) => {
        console.error(`❌ Erro ao salvar ${arquivo}: ${error}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`❌ Erro ao baixar ${arquivo}: ${error.message}`);
    throw error;
  }
}

// Função utilitária
const clean = (txt) => txt.replace(/\s+/g, " ").trim();

// ============= INVESTIR =================
async function fetchTesouroInvestir() {
  try {
    const { data: html } = await axios.get(URL_INVESTIR);
    const $ = cheerio.load(html);
    const rows = [];

    const header = [
      "Título",
      "Rendimento anual do título",
      "Investimento mínimo",
      "Preço unitário de investimento",
      "Vencimento do Título",
    ];
    rows.push(header);

    function formatarTitulo(base, vencimento) {
      const ano = vencimento.split("/")[2];
      let titulo = clean(base);

      if (/Selic/i.test(titulo)) return `Tesouro Selic ${ano}`;
      if (/Prefixado/i.test(titulo) && /Juros Semestrais/i.test(titulo))
        return `Tesouro Prefixado com Juros Semestrais ${ano}`;
      if (/Prefixado/i.test(titulo)) return `Tesouro Prefixado ${ano}`;
      if (/IPCA\+/i.test(titulo) && /Juros Semestrais/i.test(titulo))
        return `Tesouro IPCA+ com Juros Semestrais ${ano}`;
      if (/IPCA\+/i.test(titulo)) return `Tesouro IPCA+ ${ano}`;
      if (/Renda\+/i.test(titulo)) return `Tesouro Renda+ Aposentadoria Extra ${ano}`;
      if (/Educa\+/i.test(titulo)) return `Tesouro Educa+ ${ano}`;

      return `Tesouro ${titulo} ${ano}`;
    }

    const formatMoney = (s) => {
      s = clean(s).replace("R$ ", "").replace(/\./g, "").replace(",", ".");
      let val = parseFloat(s);
      if (isNaN(val)) return "R$ 0,00";
      return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    $("#rankigns tbody tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length > 0) {
        let tituloBase = clean($(tds[1]).text());
        let rendimento = clean($(tds[2]).text());
        const minimo = clean($(tds[3]).text());
        const preco = clean($(tds[4]).text());
        const vencimento = clean($(tds[5]).text());

        const titulo = formatarTitulo(tituloBase, vencimento);

        rows.push([titulo, rendimento, formatMoney(minimo), formatMoney(preco), vencimento]);
      }
    });

    const csv = Papa.unparse(rows, { delimiter: ";", quotes: false });
    fs.writeFileSync(arquivoCsvRendimento, csv, "utf8");
    console.log(`✅ ${arquivoCsvRendimento} salvo.`);
  } catch (error) {
    console.error("❌ Erro ao buscar dados de Investir:", error.message);
  }
}

// ============= RESGATAR =================
async function fetchTesouroResgatar() {
  try {
    const { data: html } = await axios.get(URL_RESGATAR);
    const $ = cheerio.load(html);
    const rows = [];

    const header = [
      "Título",
      "Rendimento anual do título",
      "Preço unitário de resgate",
      "Vencimento do Título",
    ];
    rows.push(header);

    $("#rankigns tbody tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length > 0) {
        let titulo = clean($(tds[1]).text());
        let rendimento = clean($(tds[2]).text());
        let preco = clean($(tds[3]).text());
        let vencimento = clean($(tds[4]).text());

        rows.push([titulo, rendimento, preco, vencimento]);
      }
    });

    const csv = Papa.unparse(rows, { delimiter: ";", quotes: false });
    fs.writeFileSync(arquivoCsvRendimentoResgatar, csv, "utf8");
    console.log(`✅ ${arquivoCsvRendimentoResgatar} salvo.`);
  } catch (error) {
    console.error("❌ Erro ao buscar dados de Resgatar:", error.message);
  }
}

// ============= MAIN =================
(async () => {
  try {
    await downloadArquivoCSV(arquivoCsv, URL_FILE_TESOURO);
    await fetchTesouroInvestir();
    await fetchTesouroResgatar();
    console.log("🎉 Todos os arquivos foram baixados com sucesso.");
  } catch (error) {
    console.error("❌ Falha geral:", error.message);
  }
})();
