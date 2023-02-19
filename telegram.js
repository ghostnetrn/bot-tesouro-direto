require("dotenv").config();
const { Telegraf } = require("telegraf");
const { getTituloInfo } = require("./apiTesouro");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Ação executada ao enviar o comando /start
bot.start((ctx) => {
  const welcomeMessage = `Olá ${ctx.from.first_name}, bem-vindo ao bot de informações sobre títulos do Tesouro Direto!`;
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Tesouro Selic 2029",
            callback_data: "selic",
          },
        ],
        [
          {
            text: "Tesouro IPCA+ 2045",
            callback_data: "ipca",
          },
        ],
      ],
    },
  };
  ctx.reply(welcomeMessage, keyboard);
});

// Ação executada ao clicar em um botão do teclado
bot.action("selic", async (ctx) => {
  try {
    const cotacao = await getTituloInfo("Tesouro Selic 2029");
    const message = `Título: ${cotacao.titulo}\nPreço unitário: ${cotacao.precoUnitario}\nInvestimento mínimo: ${cotacao.investimentoMinimo}\nRentabilidade anual: ${cotacao.rentabilidadeAnual}\nVencimento: ${cotacao.vencimento}`;
    ctx.reply(message);
  } catch (error) {
    console.error(error.message);
    ctx.reply("Ocorreu um erro ao buscar as informações do título.");
  }
});

bot.action("ipca", async (ctx) => {
  try {
    const cotacao = await getTituloInfo("Tesouro IPCA+ 2045");
    const message = `Título: ${cotacao.titulo}\nPreço unitário: ${cotacao.precoUnitario}\nInvestimento mínimo: ${cotacao.investimentoMinimo}\nRentabilidade anual: ${cotacao.rentabilidadeAnual}\nVencimento: ${cotacao.vencimento}`;
    ctx.reply(message);
  } catch (error) {
    console.error(error.message);
    ctx.reply("Ocorreu um erro ao buscar as informações do título.");
  }
});

// Inicia o bot
bot.launch();
