const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const Papa = require("papaparse");

async function fetchTesouroResgatar() {
  try {
    const url = "https://investidor10.com.br/tesouro-direto/resgatar/";
    const { data: html } = await axios.get(url);

    const $ = cheerio.load(html);
    const rows = [];

    // Cabeçalho do CSV
    const header = [
      "Título",
      "Rendimento anual do título",
      "Preço unitário de resgate",
      "Vencimento do Título",
    ];
    rows.push(header);

    const clean = (txt) => txt.replace(/\s+/g, " ").trim();

    // Pega dados da tabela
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

    // Gera CSV
    const csv = Papa.unparse(rows, {
      delimiter: ";",
      quotes: false,
    });

    const filePath = path.join(process.cwd(), "rendimento_resgatar.csv");
    fs.writeFileSync(filePath, csv, "utf8");
    console.log("✅ Arquivo salvo em:", filePath);
  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error.message);
  }
}

fetchTesouroResgatar();
