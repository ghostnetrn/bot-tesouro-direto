const axios = require("axios");
const fs = require("fs");
const Papa = require("papaparse");

const arquivoCsv = "PrecoTaxaTesouroDireto.csv";
const arquivoCsvRendimento = "rendimento_investir.csv";
const arquivoCsvRendimentoResgatar = "rendimento_resgatar.csv";

// URLs oficiais
const URL_FILE_TESOURO =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv";

const URL_CSV_INVESTIR =
  "https://www.tesourodireto.com.br/documents/d/guest/rendimento-investir-csv?download=true";

const URL_CSV_RESGATAR =
  "https://www.tesourodireto.com.br/documents/d/guest/rendimento-resgatar-csv?download=true";

// ============= FUNÇÕES UTILITÁRIAS =================

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
 * Decodifica o buffer como UTF-8 estrito; se inválido, usa latin1
 */
function decodeBuffer(buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return buffer.toString("latin1");
  }
}

const CABECALHOS_CONHECIDOS = [
  "Título",
  "Rendimento anual do título",
  "Investimento mínimo",
  "Preço unitário de investimento",
  "Preço unitário de resgate",
  "Vencimento do Título",
];

/**
 * Repara cabeçalhos com U+FFFD no lugar dos acentos (curinga)
 */
function repairHeader(header) {
  const h = removeBOM(String(header)).trim();
  if (!h.includes("\uFFFD")) return h;
  const pattern = new RegExp(
    "^" +
      h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\uFFFD+/g, ".{1,2}") +
      "$",
    "i"
  );
  return CABECALHOS_CONHECIDOS.find((c) => pattern.test(c)) || h;
}

/**
 * Detecta o delimitador do CSV (ponto e vírgula ou vírgula)
 */
function detectDelimiter(csvText) {
  const firstLine = csvText.split("\n")[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

/**
 * Converte número brasileiro (1.234,56) para número JavaScript (1234.56)
 */
function parseNumberBR(str) {
  if (!str || str === "") return 0;
  str = String(str).trim();
  // Remove R$, espaços, NBSP
  str = str.replace(/[R$\s\u00A0]/g, "");
  // Remove pontos de milhar e substitui vírgula por ponto
  if (str.includes(".") && str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    str = str.replace(",", ".");
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Formata número como moeda brasileira
 */
function formatMoney(value) {
  if (value == null || isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Converte data DD/MM/YYYY para formato legível
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  // Se já está no formato DD/MM/YYYY, retorna
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  // Se está no formato ISO (YYYY-MM-DD), converte
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const date = new Date(dateStr);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
  return dateStr;
}

/**
 * Formata taxa de rendimento com prefixo (IPCA+, SELIC+, ou apenas %)
 */
function formatRate(titulo, taxa) {
  const tituloLower = titulo.toLowerCase();
  if (tituloLower.includes("selic")) {
    return `SELIC + ${taxa}%`;
  } else if (tituloLower.includes("ipca") || tituloLower.includes("renda")) {
    return `IPCA + ${taxa}%`;
  } else {
    return `${taxa}%`;
  }
}

// ============= DOWNLOAD GENÉRICO DE CSV =================

/**
 * Baixa um arquivo CSV de uma URL e salva localmente (com retentativas)
 */
async function downloadCSV(url, outputFile, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`⬇️  Tentando baixar (tentativa ${attempt}/${retries}): ${outputFile}`);
    console.log(`   URL: ${url}`);

    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        maxRedirects: 5,
        timeout: 300000, // 5 minutos de timeout
        headers: {
          Accept: "text/csv,application/octet-stream,*/*",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      fs.writeFileSync(outputFile, response.data);
      console.log(`✅ ${outputFile} baixado com sucesso (${response.data.length} bytes)`);
      return true;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const errorMsg = error.response
        ? `HTTP ${error.response.status}: ${error.message}`
        : error.message;

      console.error(`❌ Tentativa ${attempt} falhou ao baixar ${outputFile}: ${errorMsg}`);

      if (isLastAttempt) {
        return false;
      }

      // Aguarda um tempo progressivo (3s, 6s...) antes de tentar novamente
      const delay = attempt * 3000;
      console.log(`⏳ Aguardando ${delay / 1000}s antes da próxima tentativa...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
}

// ============= FALLBACK: GERAR CSVs A PARTIR DO HISTÓRICO =================

/**
 * Gera os CSVs de investimento e resgate a partir do CSV histórico oficial
 */
async function generateFromHistorico({ investir = true, resgatar = true } = {}) {
  console.log("\n🔄 Usando fallback: gerando CSVs a partir do histórico oficial...");

  if (!fs.existsSync(arquivoCsv)) {
    throw new Error(
      `Arquivo ${arquivoCsv} não encontrado. Não é possível usar fallback.`
    );
  }

  // Ler o arquivo histórico
  const buffer = fs.readFileSync(arquivoCsv);
  let csvText = decodeBuffer(buffer);
  if (!csvText.includes("Tipo Titulo")) {
    csvText = buffer.toString("latin1");
  }

  csvText = removeBOM(csvText);
  const delimiter = detectDelimiter(csvText);

  console.log(`   Delimitador detectado: "${delimiter}"`);

  // Parse CSV
  const parsed = Papa.parse(csvText, {
    delimiter,
    header: true,
    skipEmptyLines: true,
  });

  if (!parsed.data || parsed.data.length === 0) {
    throw new Error("CSV histórico vazio ou inválido");
  }

  // Encontrar a data mais recente
  let maxDate = null;
  for (const row of parsed.data) {
    const dataBase = row["Data Base"];
    if (!dataBase) continue;

    // Converter DD/MM/YYYY para Date
    const [dia, mes, ano] = dataBase.split("/");
    if (!dia || !mes || !ano) continue;

    const date = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    if (!maxDate || date > maxDate) {
      maxDate = date;
    }
  }

  if (!maxDate) {
    throw new Error("Não foi possível encontrar data válida no CSV histórico");
  }

  const maxDateStr = `${String(maxDate.getDate()).padStart(2, "0")}/${String(
    maxDate.getMonth() + 1
  ).padStart(2, "0")}/${maxDate.getFullYear()}`;

  console.log(`   Data mais recente encontrada: ${maxDateStr}`);

  // Filtrar registros da última data
  const latestRecords = parsed.data.filter((row) => row["Data Base"] === maxDateStr);

  console.log(`   Total de registros na última data: ${latestRecords.length}`);

  if (investir) {
  // Gerar rendimento_investir.csv
  const investirRows = [];
  investirRows.push([
    "Título",
    "Rendimento anual do título",
    "Investimento mínimo",
    "Preço unitário de investimento",
    "Vencimento do Título",
  ]);

  for (const row of latestRecords) {
    const titulo = row["Tipo Titulo"];
    const vencimento = row["Data Vencimento"];
    const taxaCompra = parseNumberBR(row["Taxa Compra Manha"]);
    const puCompra = parseNumberBR(row["PU Compra Manha"]);

    if (!titulo || !vencimento || taxaCompra === 0) continue;

    // Pular Selic e Educa+
    if (titulo.toLowerCase().includes("selic") || titulo.toLowerCase().includes("educa+")) {
      continue;
    }

    // Investimento mínimo: 1% do PU (aproximação)
    const investimentoMinimo = puCompra * 0.01;

    investirRows.push([
      titulo,
      formatRate(titulo, taxaCompra.toFixed(2)),
      formatMoney(investimentoMinimo),
      formatMoney(puCompra),
      vencimento,
    ]);
  }

  if (investirRows.length < 2) {
    throw new Error("Fallback gerou rendimento_investir.csv sem títulos");
  }
  const csvInvestir = Papa.unparse(investirRows, { delimiter: ";", quotes: false });
  fs.writeFileSync(arquivoCsvRendimento, csvInvestir, "utf8");
  console.log(
    `✅ ${arquivoCsvRendimento} gerado com ${investirRows.length - 1} títulos (fallback)`
  );
  }

  if (resgatar) {
  // Gerar rendimento_resgatar.csv
  const resgatarRows = [];
  resgatarRows.push([
    "Título",
    "Rendimento anual do título",
    "Preço unitário de resgate",
    "Vencimento do Título",
  ]);

  for (const row of latestRecords) {
    const titulo = row["Tipo Titulo"];
    const vencimento = row["Data Vencimento"];
    const taxaVenda = parseNumberBR(row["Taxa Venda Manha"]);
    const puVenda = parseNumberBR(row["PU Venda Manha"]);

    if (!titulo || !vencimento || taxaVenda === 0) continue;

    // Pular Selic e Educa+
    if (titulo.toLowerCase().includes("selic") || titulo.toLowerCase().includes("educa+")) {
      continue;
    }

    resgatarRows.push([
      titulo,
      formatRate(titulo, taxaVenda.toFixed(2)),
      formatMoney(puVenda),
      vencimento,
    ]);
  }

  if (resgatarRows.length < 2) {
    throw new Error("Fallback gerou rendimento_resgatar.csv sem títulos");
  }
  const csvResgatar = Papa.unparse(resgatarRows, { delimiter: ";", quotes: false });
  fs.writeFileSync(arquivoCsvRendimentoResgatar, csvResgatar, "utf8");
  console.log(
    `✅ ${arquivoCsvRendimentoResgatar} gerado com ${resgatarRows.length - 1} títulos (fallback)`
  );
  }
}

// ============= PROCESSAR CSV BAIXADO =================

/**
 * Processa um CSV baixado e normaliza para o formato esperado
 */
function processDownloadedCSV(inputFile, outputFile, isInvestir) {
  console.log(`📝 Processando ${inputFile}...`);

  const buffer = fs.readFileSync(inputFile);
  let csvText = decodeBuffer(buffer);

  csvText = removeBOM(csvText);
  const delimiter = detectDelimiter(csvText);

  const parsed = Papa.parse(csvText, {
    delimiter,
    header: true,
    skipEmptyLines: true,
    transformHeader: repairHeader,
  });

  if (!parsed.data || parsed.data.length === 0) {
    throw new Error(`CSV ${inputFile} vazio ou inválido`);
  }

  const rows = [];

  if (isInvestir) {
    rows.push([
      "Título",
      "Rendimento anual do título",
      "Investimento mínimo",
      "Preço unitário de investimento",
      "Vencimento do Título",
    ]);

    for (const row of parsed.data) {
      // Tentar diferentes nomes de colunas
      const titulo =
        row["Título"] || row["Titulo"] || row["Nome"] || row["Tipo Titulo"] || "";
      const rendimento =
        row["Rendimento anual do título"] ||
        row["Rendimento"] ||
        row["Taxa"] ||
        row["Taxa Compra Manha"] ||
        "";
      const minimo =
        row["Investimento mínimo"] ||
        row["Investimento minimo"] ||
        row["Minimo"] ||
        "";
      const preco =
        row["Preço unitário de investimento"] ||
        row["Preco unitario"] ||
        row["PU"] ||
        row["PU Compra Manha"] ||
        "";
      const vencimento =
        row["Vencimento do Título"] ||
        row["Vencimento"] ||
        row["Data Vencimento"] ||
        "";

      if (!titulo || !vencimento) continue;

      // Pular Selic e Educa+
      if (titulo.toLowerCase().includes("selic") || titulo.toLowerCase().includes("educa+")) {
        continue;
      }

      rows.push([titulo, rendimento, minimo, preco, formatDate(vencimento)]);
    }
  } else {
    rows.push([
      "Título",
      "Rendimento anual do título",
      "Preço unitário de resgate",
      "Vencimento do Título",
    ]);

    for (const row of parsed.data) {
      const titulo =
        row["Título"] || row["Titulo"] || row["Nome"] || row["Tipo Titulo"] || "";
      const rendimento =
        row["Rendimento anual do título"] ||
        row["Rendimento"] ||
        row["Taxa"] ||
        row["Taxa Venda Manha"] ||
        "";
      const preco =
        row["Preço unitário de resgate"] ||
        row["Preco unitario"] ||
        row["PU"] ||
        row["PU Venda Manha"] ||
        "";
      const vencimento =
        row["Vencimento do Título"] ||
        row["Vencimento"] ||
        row["Data Vencimento"] ||
        "";

      if (!titulo || !vencimento) continue;

      // Pular Selic e Educa+
      if (titulo.toLowerCase().includes("selic") || titulo.toLowerCase().includes("educa+")) {
        continue;
      }

      rows.push([titulo, rendimento, preco, formatDate(vencimento)]);
    }
  }

  if (rows.length < 2) {
    throw new Error(
      `CSV ${inputFile} sem linhas de dados (cabeçalhos encontrados: ${(
        parsed.meta.fields || []
      ).join(" | ")})`
    );
  }

  const csv = Papa.unparse(rows, { delimiter: ";", quotes: false });
  fs.writeFileSync(outputFile, csv, "utf8");
  console.log(`✅ ${outputFile} processado com ${rows.length - 1} títulos`);
}

// ============= MAIN =================

(async () => {
  console.log("🚀 Iniciando download dos dados do Tesouro Direto...\n");

  try {
    // 1. Baixar CSV histórico oficial
    // ATENÇÃO: o servidor www.tesourotransparente.gov.br bloqueia (silenciosamente,
    // gerando ETIMEDOUT) conexões vindas de IPs de nuvem estrangeiros, como os
    // runners do GitHub Actions (Azure). Por isso este download NÃO é crítico:
    // se falhar, mantemos o arquivo histórico já commitado no repositório e
    // seguimos atualizando os CSVs de rendimento (que vêm de um host atrás de
    // Cloudflare e são acessíveis globalmente).
    console.log("📊 PASSO 1: Baixando CSV histórico oficial");
    const historicoOk = await downloadCSV(URL_FILE_TESOURO, arquivoCsv);

    if (!historicoOk) {
      if (fs.existsSync(arquivoCsv)) {
        console.warn(
          "⚠️  Não foi possível baixar o CSV histórico (provável bloqueio geográfico do servidor gov)."
        );
        console.warn(`   Mantendo o arquivo ${arquivoCsv} já existente no repositório.`);
      } else {
        console.error(
          "❌ Falha crítica: download do histórico falhou e não há arquivo local para usar como fallback."
        );
        process.exit(1);
      }
    }

    // 2. Tentar baixar CSVs atuais do Tesouro Direto
    console.log("\n📊 PASSO 2: Tentando baixar CSVs atuais do Tesouro Direto");

    const investirOk = await downloadCSV(URL_CSV_INVESTIR, "temp_investir.csv");
    const resgatarOk = await downloadCSV(URL_CSV_RESGATAR, "temp_resgatar.csv");

    // 3. Processar ou usar fallback
    const falhou = { investir: !investirOk, resgatar: !resgatarOk };

    if (investirOk || resgatarOk) {
      console.log("\n📊 PASSO 3: Processando CSVs baixados");
    } else {
      console.log("\n📊 PASSO 3: CSVs atuais indisponíveis, usando fallback");
    }

    if (investirOk) {
      try {
        processDownloadedCSV("temp_investir.csv", arquivoCsvRendimento, true);
      } catch (error) {
        console.error(`❌ Erro ao processar investir: ${error.message}`);
        falhou.investir = true;
      }
    }
    if (resgatarOk) {
      try {
        processDownloadedCSV("temp_resgatar.csv", arquivoCsvRendimentoResgatar, false);
      } catch (error) {
        console.error(`❌ Erro ao processar resgatar: ${error.message}`);
        falhou.resgatar = true;
      }
    }

    if (falhou.investir || falhou.resgatar) {
      console.log("   Tentando fallback para os arquivos que falharam...");
      try {
        await generateFromHistorico(falhou);
      } catch (error) {
        console.error(
          `❌ Fallback falhou: ${error.message}. Mantendo arquivos anteriores.`
        );
      }
    }

    // Limpar arquivos temporários
    for (const f of ["temp_investir.csv", "temp_resgatar.csv"]) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }

    console.log("\n🎉 Processo concluído com sucesso!");
    console.log("\n📁 Arquivos gerados:");
    console.log(`   ✓ ${arquivoCsv}`);
    console.log(`   ✓ ${arquivoCsvRendimento}`);
    console.log(`   ✓ ${arquivoCsvRendimentoResgatar}`);
  } catch (error) {
    console.error("\n❌ Falha geral:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
