require("dotenv").config();
const { Telegraf } = require("telegraf");
const {
  getTituloInfo,
  listarTitulosComInvestimentoMinimo,
} = require("./apiTesouro");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Ação executada ao enviar o comando /start
bot.start(async (ctx) => {
  try {
    const titulos = await listarTitulosComInvestimentoMinimo();

    const keyboard = {
      reply_markup: {
        inline_keyboard: titulos.map((titulo) => [
          {
            text: titulo,
            callback_data: titulo.replace(/\s/g, ""),
          },
        ]),
      },
    };

    ctx.reply("Selecione um título para obter informações:", keyboard);
  } catch (error) {
    console.error(error.message);
    ctx.reply("Ocorreu um erro ao listar os títulos.");
  }
});

// Ação executada ao clicar em um botão do teclado
bot.action(/tesouro(.+)/i, async (ctx) => {
  const titulo = ctx.match[1].trim();

  try {
    const cotacao = await getTituloInfo(titulo);
    const message = `Título: ${cotacao.titulo}\nPreço unitário: ${cotacao.precoUnitario}\nInvestimento mínimo: ${cotacao.investimentoMinimo}\nRentabilidade anual: ${cotacao.rentabilidadeAnual}\nVencimento: ${cotacao.vencimento}`;
    ctx.reply(message);
  } catch (error) {
    console.error(error.message);
    ctx.reply("Ocorreu um erro ao buscar as informações do título.");
  }
});

// Inicia o bot
bot.launch();
