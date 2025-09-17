const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const Papa = require("papaparse");

async function fetchTesouroDireto() {
  try {
    const url = "https://investidor10.com.br/tesouro-direto/";
    const { data: html } = await axios.get(url);

    const $ = cheerio.load(html);
    const rows = [];

    // Cabeçalho fixo no padrão oficial
    const header = [
      "Título",
      "Rendimento anual do título",
      "Investimento mínimo",
      "Preço unitário de investimento",
      "Vencimento do Título",
    ];
    rows.push(header);

    const clean = (txt) => txt.replace(/\s+/g, " ").trim();

    // Normalização de título para ficar igual ao PrecoTaxaTesouroDireto.csv
    function formatarTitulo(base, vencimento) {
      const ano = vencimento.split("/")[2];
      let titulo = clean(base);

      if (/Selic/i.test(titulo)) {
        return `Tesouro Selic ${ano}`;
      }
      if (/Prefixado/i.test(titulo) && /Juros Semestrais/i.test(titulo)) {
        return `Tesouro Prefixado com Juros Semestrais ${ano}`;
      }
      if (/Prefixado/i.test(titulo)) {
        return `Tesouro Prefixado ${ano}`;
      }
      if (/IPCA\+/i.test(titulo) && /Juros Semestrais/i.test(titulo)) {
        return `Tesouro IPCA+ com Juros Semestrais ${ano}`;
      }
      if (/IPCA\+/i.test(titulo)) {
        return `Tesouro IPCA+ ${ano}`;
      }
      if (/Renda\+/i.test(titulo)) {
        return `Tesouro Renda+ Aposentadoria Extra ${ano}`;
      }
      if (/Educa\+/i.test(titulo)) {
        return `Tesouro Educa+ ${ano}`;
      }

      return `Tesouro ${titulo} ${ano}`;
    }

    // Formatadores auxiliares
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

        // normaliza título + ano
        const titulo = formatarTitulo(tituloBase, vencimento);

        rows.push([
          titulo,
          rendimento,
          formatMoney(minimo),
          formatMoney(preco),
          vencimento,
        ]);
      }
    });

    // Gera CSV sem aspas extras
    const csv = Papa.unparse(rows, {
      delimiter: ";",
      quotes: false,
    });

    const filePath = path.join(process.cwd(), "rendimento_investir.csv");
    fs.writeFileSync(filePath, csv, "utf8");
    console.log("✅ Arquivo salvo em:", filePath);
  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error.message);
  }
}

fetchTesouroDireto();
