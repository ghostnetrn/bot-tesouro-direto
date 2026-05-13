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

    console.log("=== Extraindo dados de resgate ===");

    // Pega dados da tabela - estrutura: 0=Ativos, 1=Rent.anual, 2=Rent.estimada, 3=Preço, 4=Vencimento
    $("#treasure-list-table tbody tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length >= 5) {
        let titulo = clean($(tds[0]).text());
        let rendimento = clean($(tds[1]).text());
        let preco = clean($(tds[3]).text()); // Coluna 3 é o preço
        let vencimento = clean($(tds[4]).text()); // Coluna 4 é o vencimento

        console.log(`Processando: ${titulo} | Venc: ${vencimento}`);

        // Pula se não tiver vencimento
        if (!vencimento || vencimento === "") {
          console.log("⚠️ Vencimento vazio, pulando linha");
          return;
        }

        rows.push([titulo, rendimento, preco, vencimento]);
      }
    });

    console.log(`\n✅ Total de ${rows.length - 1} títulos de resgate extraídos`);

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
