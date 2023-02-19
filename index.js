const { getTituloInfo } = require("./apiTesouro");

(async () => {
  try {
    const cotacao = await getTituloInfo("Tesouro Selic 2029", "i");
    console.log(cotacao);
  } catch (error) {
    console.error(error.message);
  }
})();
