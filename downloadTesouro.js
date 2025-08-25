const axios = require("axios");
const fs = require("fs");
const puppeteer = require("puppeteer");

const arquivoJson = "tesouro.json";
const arquivoCsv = "PrecoTaxaTesouroDireto.csv";           // CSV antigo (mantido)
const arquivoCsvRendimento = "rendimento_investir.csv";     // NOVO CSV

// Mantidos como estão
const URL_API =
  "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json";
const URL_FILE_TESOURO =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv";

// NOVO link do CSV “rendimento-investir”
const URL_FILE_RENDIMENTO_INVESTIR =
  "https://www.tesourodireto.com.br/documents/d/guest/rendimento-investir-csv?download=true";

async function downloadJsonViaPuppeteer(url, arquivo) {
  let browser;
  try {
    console.log(`Iniciando download do arquivo ${arquivo} via Puppeteer...`);
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: "https://www.tesourodireto.com.br/",
      Origin: "https://www.tesourodireto.com.br",
    });

    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    if (response.ok()) {
      const jsonContent = await response.text();
      fs.writeFileSync(arquivo, jsonContent);
      console.log(`${arquivo} salvo localmente.`);
    } else {
      throw new Error(`Resposta da API com status: ${response.status()}`);
    }
  } catch (error) {
    console.error(`Erro ao baixar o arquivo ${arquivo}: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function downloadArquivo(arquivo, url) {
  console.log(`Iniciando download do arquivo ${arquivo}...`);
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
        console.log(`${arquivo} salvo localmente.`);
        resolve();
      });
      stream.on("error", (error) => {
        console.error(`Erro ao salvar o ${arquivo}: ${error}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Erro ao baixar o arquivo ${arquivo}: ${error.message}`);
    throw error;
  }
}

(async () => {
  try {
    await Promise.all([
      // JSON
      downloadJsonViaPuppeteer(URL_API, arquivoJson),

      // CSV antigo (mantém compatibilidade com app-colorized.js)
      downloadArquivo(arquivoCsv, URL_FILE_TESOURO),

      // CSV novo (rendimento-investir)
      downloadArquivo(arquivoCsvRendimento, URL_FILE_RENDIMENTO_INVESTIR),
    ]);
    console.log("Todos os downloads foram concluídos.");
  } catch (error) {
    console.error("Falha no download:", error.message);
  }
})();
