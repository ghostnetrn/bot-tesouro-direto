require("dotenv").config();
const { Telegraf } = require("telegraf");
const {
  getTituloInfo,
  listarTitulosComInvestimentoMinimo,
  listarTitulosComRentabilidadeAlta,
} = require("./apiTesouro");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Ação executada ao enviar o comando /start
const keyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Listar todos os títulos",
          callback_data: "all",
        },
      ],
      [
        {
          text: "Listar títulos com maior percentual de investimento",
          callback_data: "maxInvestment",
        },
      ],
    ],
  },
};

bot.start(async (ctx) => {
  try {
    ctx.reply("Selecione uma opção:", keyboard);
  } catch (error) {
    console.error(error.message);
    ctx.reply("Ocorreu um erro ao listar os títulos.");
  }
});

// Ação executada ao clicar em um botão do teclado
bot.action("all", async (ctx) => {
  try {
    const titulos = await listarTitulosComInvestimentoMinimo();

    const keyboard = {
      reply_markup: {
        inline_keyboard: titulos.map((titulo) => [
          {
            text: titulo,
            callback_data: titulo,
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

bot.action("maxInvestment", async (ctx) => {
  try {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Maior que 3",
              callback_data: "maxInvestment_3",
            },
            {
              text: "Maior que 6",
              callback_data: "maxInvestment_6",
            },
            {
              text: "Maior que 10",
              callback_data: "maxInvestment_10",
            },
          ],
        ],
      },
    };

    ctx.reply("Selecione o percentual de investimento mínimo:", keyboard);
  } catch (error) {
    console.error(error.message);
    ctx.reply(
      "Ocorreu um erro ao listar os títulos com a maior rentabilidade."
    );
  }
});

bot.action(/maxInvestment_(\d+)/i, async (ctx) => {
  const percentual = Number(ctx.match[1]);

  try {
    const titulos = await listarTitulosComRentabilidadeAlta(percentual);

    if (typeof titulos === "string") {
      ctx.reply(titulos);
      return;
    }

    const keyboard = {
      reply_markup: {
        inline_keyboard: titulos.map((titulo) => [
          {
            text: titulo.nm,
            callback_data: titulo.nm,
          },
        ]),
      },
    };

    ctx.reply(
      `Títulos com investimento mínimo maior que ${percentual}%:`,
      keyboard
    );
  } catch (error) {
    console.error(error.message);
    ctx.reply(
      "Ocorreu um erro ao listar os títulos com a maior rentabilidade."
    );
  }
});

bot.action(/(.+)/i, async (ctx) => {
  const titulo = ctx.match[1].trim();

  try {
    const cotacao = await getTituloInfo(titulo);
    const message = `*Título:* ${cotacao.titulo}\n*Preço unitário:* ${cotacao.precoUnitario}\n*Investimento mínimo:* ${cotacao.investimentoMinimo}\n*Rentabilidade anual:* ${cotacao.rentabilidadeAnual}%\n*Vencimento:* ${cotacao.vencimento}`;
    ctx.replyWithMarkdown(message, keyboard);
  } catch (error) {
    console.error(error.message);
    ctx.reply("Ocorreu um erro ao buscar as informações do título.", keyboard);
  }
});

// Inicia o bot
bot.launch();
