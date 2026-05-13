const axios = require("axios");
const cheerio = require("cheerio");

async function testStructure() {
  try {
    const url = "https://investidor10.com.br/tesouro-direto/resgatar/";
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    console.log("=== Estrutura da tabela de resgate ===\n");

    // Cabeçalho
    console.log("CABEÇALHO:");
    $("#treasure-list-table thead tr th").each((i, th) => {
      console.log(`  Coluna ${i}: ${$(th).text().trim()}`);
    });

    console.log("\nPRIMEIRA LINHA DE DADOS:");
    const firstRow = $("#treasure-list-table tbody tr").first();
    firstRow.find("td").each((i, td) => {
      console.log(`  Coluna ${i}: ${$(td).text().trim()}`);
    });

    console.log("\nNÚMERO TOTAL DE COLUNAS:", firstRow.find("td").length);
  } catch (error) {
    console.error("Erro:", error.message);
  }
}

testStructure();
