require("dotenv").config();
const { Telegraf, Markup, Extra } = require("telegraf");
const {
  getTituloInfo,
  listarTitulosComInvestimentoMinimo,
  listarTitulosComRentabilidadeAlta,
  listarTitulos,
  getTesouroInfo,
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

// Crie um teclado personalizado com um botão para iniciar o bot
const keyboardStart = Markup.keyboard([
  ["🧾 Teclado"], // Row1 with 2 buttons
  ["☸ Help"], //, '🔛 Test Mode'], // Row2 with 2 buttons
  ["📈 Gráficos"], // Row3 with 1 button
])
  //.oneTime()
  .resize();

// Adicionar a função que trata a ação do novo botão
bot.hears("📈 Gráficos", async (ctx) => {
  await ctx.reply(
    "Acesse o link https://www.tesouroinfo.com/graficos para visualizar os gráficos."
  );
  await ctx.reply(
    "Acesse também https://www.tesourodireto.com.br/titulos/historico-de-precos-e-taxas.htm"
  );
});

bot.hears("🧾 Teclado", async (ctx) => {
  await ctx.reply("Menu", keyboard);
});

bot.hears("☸ Help", async (ctx) => {
  await ctx.reply(
    "Visite https://github.com/ghostnetrn/bot-tesouro-direto/issues"
  );
});

bot.start(async (ctx) => {
  try {
    ctx.reply("🧾 Teclado", keyboardStart);
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
    ctx.reply("Para exibir o menu digite /start");
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
    ctx.reply("Para exibir o menu digite /start");
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
  ctx.reply('Gerando dados... Por favor, aguarde!')
  
  try {
    const cotacao = await getTituloInfo(titulo);
    const tituloDados = cotacao.titulo.replace(/\s\d+$/, "");
    const vencimento = cotacao.vencimento;
    const dadostesouro = await getTesouroInfo(tituloDados, vencimento);

    let message = `*Título:* ${cotacao.titulo}\n*Preço unitário:* ${cotacao.precoUnitario}\n*Investimento mínimo:* ${cotacao.investimentoMinimo}\n*Rentabilidade anual:* ${cotacao.rentabilidadeAnual}%\n*Vencimento:* ${cotacao.vencimento}\n\n`;
    message += `*Mínimo:* ${dadostesouro.min}\n*1º quartil:* ${dadostesouro.q1}\n*Mediana:* ${dadostesouro.median}\n*3º quartil:* ${dadostesouro.q3}\n*Máximo:* ${dadostesouro.max}\n*Média:* ${dadostesouro.mean}\n*Desvio padrão:* ${dadostesouro.stdev}`;
    ctx.replyWithMarkdown(message, keyboard);
  } catch (error) {
    console.error(error.message);
    ctx.reply("Ocorreu um erro ao buscar as informações do título.", keyboard);
  }
});

async function verificarRentabilidade() {
  const titulos = await listarTitulos();
  let mensagem = "📝 <b>Relatório diário:</b>\n";
  mensagem += `Rentabilidade acima de ${process.env.ALERTA_RENTABILIDADE}%\n\n`;

  for (const bond of titulos) {
    if (
      bond.TrsrBd.anulInvstmtRate >=
      parseFloat(process.env.ALERTA_RENTABILIDADE)
    ) {
      mensagem += `<b>${bond.TrsrBd.nm}</b>: ${bond.TrsrBd.anulInvstmtRate}%\n`;
    }
  }

  if (mensagem !== "📝 *Relatório diário:*\n") {
    // Enviar uma mensagem no Telegram
    await bot.telegram.sendMessage(process.env.CHAT_ID, mensagem, {
      parse_mode: "HTML",
    });
  }
}

// Chamar a função verificarRentabilidade() periodicamente usando setInterval()
setInterval(
  verificarRentabilidade,
  parseFloat(process.env.ALERTA_PERIODO_MINUTOS) * 60 * 1000
);

// Inicia o bot
bot.launch();
