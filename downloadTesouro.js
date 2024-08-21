const axios = require("axios");
const fs = require("fs");

const arquivoJson = "tesouro.json";
const arquivoCsv = "PrecoTaxaTesouroDireto.csv";

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const URL_API =
  "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json";
const URL_FILE_TESOURO =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv";

async function downloadArquivo(arquivo, url) {
  console.log(`Iniciando download do arquivo ${arquivo}...`);
  try {
    const response = await axios.get(url, {
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
      }
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
    console.error(`Erro ao baixar o arquivo ${arquivo}:`, error.message);
    throw error;
  }
}

(async () => {
  try {
    await Promise.all([
      downloadArquivo(arquivoJson, URL_API),
      downloadArquivo(arquivoCsv, URL_FILE_TESOURO),
    ]);
    console.log("Todos os downloads foram concluídos.");
  } catch (error) {
    console.error("Falha no download:", error.message);
  }
})();
