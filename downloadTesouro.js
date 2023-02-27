const https = require("https");
const axios = require("axios");
const csv = require("csv-parser");
const fs = require("fs");

const URL_API =
  "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json";
const URL_FILE_TESOURO =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Baixa o arquivo JSON da API
https
  .get(URL_API, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      // Salva o arquivo JSON
      fs.writeFileSync("./docs/tesouro.json", data);
      console.log("Arquivo tesouro.json salvo com sucesso!");
    });
  })
  .on("error", (err) => {
    console.error(err);
  });

// Baixa o arquivo CSV
axios
  .get(URL_FILE_TESOURO, { responseType: "stream" })
  .then((response) => {
    const stream = response.data.pipe(
      fs.createWriteStream("./docs/PrecoTaxaTesouroDireto.csv")
    );

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
  })
  .catch((err) => {
    console.error(err);
  });
