const axios = require("axios");
const fs = require("fs");
const puppeteer = require("puppeteer");

const arquivoJson = "tesouro.json";
const arquivoCsv = "PrecoTaxaTesouroDireto.csv";

const URL_API =
  "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json";
const URL_FILE_TESOURO =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv";

async function downloadJsonViaPuppeteer(url, arquivo) {
  let browser;
  try {
    console.log(`Iniciando download do arquivo ${arquivo} via Puppeteer...`);
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true, // Certifique-se de que está em headless para ambientes de CI/CD
    });
    const page = await browser.newPage();

    // Configurar o User-Agent e outros cabeçalhos para emular um navegador real
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://www.tesourodireto.com.br/",
      "Origin": "https://www.tesourodireto.com.br"
    });

    // Visitar a página principal para capturar cookies
    await page.goto("https://www.tesourodireto.com.br", { waitUntil: "networkidle2" });

    const cookies = await page.cookies();
    await page.setCookie(...cookies);

    // Navegar diretamente para a URL da API
    const response = await page.goto(url, {
      waitUntil: "networkidle2", // Espera até que a rede esteja ociosa
      timeout: 120000, // Timeout ajustado para 120 segundos
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
    });

    console.log(`Download do ${arquivo} concluído.`);
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
      downloadJsonViaPuppeteer(URL_API, arquivoJson),
      downloadArquivo(arquivoCsv, URL_FILE_TESOURO),
    ]);
    console.log("Todos os downloads foram concluídos.");
  } catch (error) {
    console.error("Falha no download:", error.message);
  }
})();
