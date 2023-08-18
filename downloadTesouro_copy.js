const axios = require("axios");
const fs = require("fs");
const arquivoJson = "tesouro.json";
const arquivoCsv = "PrecoTaxaTesouroDireto.csv";

const URL_API =
  "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json";
const URL_FILE_TESOURO =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function baixarArquivoSeNecessario(arquivo, url) {
  if (!fs.existsSync(arquivo) || arquivo.endsWith('.json')) {
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

  const ultimaAtualizacao = await obterDataUltimaAtualizacao(arquivo);

  if (await arquivoEstaDesatualizado(url, ultimaAtualizacao)) {
    console.log("Iniciando download do arquivo...");
    const response = await axios.get(url, { responseType: "stream" });

    console.log("Download do arquivo concluído.");
    const stream = response.data.pipe(fs.createWriteStream(arquivo));

    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        console.log("Arquivo salvo localmente.");
        resolve();
      });

      stream.on("error", (error) => {
        console.error(`Erro ao salvar o arquivo: ${error}`);
        reject(error);
      });
    });
  } else {
    console.log(`O ${arquivo} já está atualizado.`);
    return Promise.resolve();
  }
}

function obterDataUltimaAtualizacao(arquivo) {
  return new Promise((resolve, reject) => {
    fs.stat(arquivo, (error, stats) => {
      if (error) {
        reject(error);
      } else {
        const dataAtualizacao = new Date(stats.mtime.getTime() + "0"); // adiciona um zero ao final para transformar em timestamp em milissegundos
        resolve(dataAtualizacao);
      }
    });
  });
}


async function arquivoEstaDesatualizado(url, ultimaAtualizacao) {
  const response = await axios.head(url);
  const dataUltimaModificacao = new Date(response.headers["last-modified"]);
  return dataUltimaModificacao > ultimaAtualizacao;
}

(async () => {
  await baixarArquivoSeNecessario(arquivoJson, URL_API);
  await baixarArquivoSeNecessario(arquivoCsv, URL_FILE_TESOURO);
})();
