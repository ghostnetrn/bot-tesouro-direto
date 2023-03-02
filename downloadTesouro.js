const axios = require("axios");
const fs = require("fs");
const arquivoJson = "tesouro.json";
const arquivoCsv = "PrecoTaxaTesouroDireto.csv";

const URL_API =
  "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json";
const URL_FILE_TESOURO =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function downloadArquivo(arquivo, url) {
  console.log(`Iniciando download do arquivo ${arquivo}...`);
  const response = await axios.get(url, { responseType: "stream" });

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
}

(async () => {
  await downloadArquivo(arquivoJson, URL_API);
  await downloadArquivo(arquivoCsv, URL_FILE_TESOURO);
})();
