const axios = require("axios");
const fs = require("fs");

const arquivoCsv = "PrecoTaxaTesouroDireto.csv";           // CSV antigo (mantido)
const arquivoCsvRendimento = "rendimento_investir.csv";     // NOVO CSV
const arquivoCsvRendimentoResgatar = "rendimento_resgatar.csv";

// URLs dos arquivos
const URL_FILE_TESOURO =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv";

// NOVO link do CSV “rendimento-investir”
const URL_FILE_RENDIMENTO_INVESTIR =
  "https://www.tesourodireto.com.br/documents/d/guest/rendimento-investir-csv?download=true";

// NOVO link do CSV “rendimento-investir”
const URL_FILE_RENDIMENTO_RESGATAR =
  "https://www.tesourodireto.com.br/documents/d/guest/rendimento-resgatar-csv?download=true";



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
      // CSV antigo (mantém compatibilidade com app-colorized.js)
      downloadArquivo(arquivoCsv, URL_FILE_TESOURO),

      // CSV novo (rendimento-investir)
      downloadArquivo(arquivoCsvRendimento, URL_FILE_RENDIMENTO_INVESTIR),

      // CSV novo (rendimento-resgatar)
      downloadArquivo(arquivoCsvRendimentoResgatar, URL_FILE_RENDIMENTO_RESGATAR),
    ]);
    console.log("Todos os downloads foram concluídos.");
  } catch (error) {
    console.error("Falha no download:", error.message);
  }
})();
