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
          text: "Listar títulos bons pra comprar",
          callback_data: "titulosBons",
        },
      ],
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
    "Visite https://github.com/ghostnetrn/bot-tesouro-direto/issues",
    keyboard
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

bot.action("titulosBons", async (ctx) => {
  ctx.reply("Gerando dados... Por favor, aguarde!");
  const titulos = await listarTitulosComInvestimentoMinimo();
  let message = "";

  try {
    for (const titulo of titulos) {
      const cotacao = await getTituloInfo(titulo);
      const tituloDados = cotacao.titulo.replace(/\s\d+$/, "");
      const vencimento = cotacao.vencimento;
      const dadostesouro = await getTesouroInfo(tituloDados, vencimento);

      cotacao.precoUnitario = parseFloat(
        cotacao.precoUnitario.replace(/[^\d,]/g, "").replace(",", ".")
      );

      if (
        cotacao.precoUnitario >= dadostesouro.median &&
        cotacao.precoUnitario < dadostesouro.q3
      ) {
        message = `*Título:* ${cotacao.titulo}\n*Preço unitário:* ${cotacao.precoUnitario}\n*Investimento mínimo:* ${cotacao.investimentoMinimo}\n*Rentabilidade anual:* ${cotacao.rentabilidadeAnual}%\n*Vencimento:* ${cotacao.vencimento}\n\n`;
        message += `*Mínimo:* ${dadostesouro.min}\n*1º quartil:* ${dadostesouro.q1}\n*Mediana:* ${dadostesouro.median}\n*3º quartil:* ${dadostesouro.q3}\n*Máximo:* ${dadostesouro.max}\n*Média:* ${dadostesouro.mean}\n*Desvio padrão:* ${dadostesouro.stdev}\n\n`;
        message += "😗 *J3 - COMPRA BOA*\n\n";
      } else if (
        cotacao.precoUnitario >= dadostesouro.q3 &&
        cotacao.precoUnitario <= dadostesouro.max
      ) {
        message = `*Título:* ${cotacao.titulo}\n*Preço unitário:* ${cotacao.precoUnitario}\n*Investimento mínimo:* ${cotacao.investimentoMinimo}\n*Rentabilidade anual:* ${cotacao.rentabilidadeAnual}%\n*Vencimento:* ${cotacao.vencimento}\n\n`;
        message += `*Mínimo:* ${dadostesouro.min}\n*1º quartil:* ${dadostesouro.q1}\n*Mediana:* ${dadostesouro.median}\n*3º quartil:* ${dadostesouro.q3}\n*Máximo:* ${dadostesouro.max}\n*Média:* ${dadostesouro.mean}\n*Desvio padrão:* ${dadostesouro.stdev}\n\n`;
        message += "😀 *J4 - COMPRA ÓTIMA*\n\n";
      }

      if (message !== "") {
        await ctx.replyWithMarkdown(message, keyboard);
        message = "";
      }
    }

    if (message === "")
      await ctx.replyWithMarkdown(
        "Não foram encontrados títulos bons para comprar",
        keyboard
      );
  } catch (error) {
    console.error(error.message);
    ctx.reply("Ocorreu um erro ao buscar as informações do título.", keyboard);
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
  ctx.reply("Gerando dados... Por favor, aguarde!");

  try {
    const cotacao = await getTituloInfo(titulo);
    const tituloDados = cotacao.titulo.replace(/\s\d+$/, "");
    const vencimento = cotacao.vencimento;
    const dadostesouro = await getTesouroInfo(tituloDados, vencimento);

    let message = `*Título:* ${cotacao.titulo}\n*Preço unitário:* ${cotacao.precoUnitario}\n*Investimento mínimo:* ${cotacao.investimentoMinimo}\n*Rentabilidade anual:* ${cotacao.rentabilidadeAnual}%\n*Vencimento:* ${cotacao.vencimento}\n\n`;
    message += `*Mínimo:* ${dadostesouro.min}\n*1º quartil:* ${dadostesouro.q1}\n*Mediana:* ${dadostesouro.median}\n*3º quartil:* ${dadostesouro.q3}\n*Máximo:* ${dadostesouro.max}\n*Média:* ${dadostesouro.mean}\n*Desvio padrão:* ${dadostesouro.stdev}\n\n`;

    cotacao.precoUnitario = parseFloat(
      cotacao.precoUnitario.replace(/[^\d,]/g, "").replace(",", ".")
    );

    if (
      cotacao.precoUnitario >= dadostesouro.min &&
      cotacao.precoUnitario < dadostesouro.q1
    ) {
      message += "😡 *J1 - COMPRA PESSÍMA*";
    } else if (
      cotacao.precoUnitario >= dadostesouro.q1 &&
      cotacao.precoUnitario < dadostesouro.median
    ) {
      message += "😒 *J2 - COMPRA RUIM*";
    } else if (
      cotacao.precoUnitario >= dadostesouro.median &&
      cotacao.precoUnitario < dadostesouro.q3
    ) {
      message += "😗 *J3 - COMPRA BOA*";
    } else if (
      cotacao.precoUnitario >= dadostesouro.q3 &&
      cotacao.precoUnitario <= dadostesouro.max
    ) {
      message += "😀 *J4 - COMPRA ÓTIMA*";
    }

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

  // listar títulos bons para comprar
  const titulosBons = await listarTitulosComInvestimentoMinimo();
  let message = "";

  try {
    for (const titulo of titulosBons) {
      const cotacao = await getTituloInfo(titulo);
      const tituloDados = cotacao.titulo.replace(/\s\d+$/, "");
      const vencimento = cotacao.vencimento;
      const dadostesouro = await getTesouroInfo(tituloDados, vencimento);

      cotacao.precoUnitario = parseFloat(
        cotacao.precoUnitario.replace(/[^\d,]/g, "").replace(",", ".")
      );

      if (
        cotacao.precoUnitario >= dadostesouro.median &&
        cotacao.precoUnitario < dadostesouro.q3
      ) {
        message = `<b>Título:</b> ${cotacao.titulo}\n<b>Preço unitário:</b> ${cotacao.precoUnitario}\n<b>Investimento mínimo:</b> ${cotacao.investimentoMinimo}\n<b>Rentabilidade anual:</b> ${cotacao.rentabilidadeAnual}%\n<b>Vencimento:</b> ${cotacao.vencimento}\n\n`;
        message += `<b>Mínimo:</b> ${dadostesouro.min}\n<b>1º quartil:</b> ${dadostesouro.q1}\n<b>Mediana:</b> ${dadostesouro.median}\n<b>3º quartil:</b> ${dadostesouro.q3}\n<b>Máximo:</b> ${dadostesouro.max}\n<b>Média:</b> ${dadostesouro.mean}\n<b>Desvio padrão:</b> ${dadostesouro.stdev}\n\n`;
        message += "😗 <b>J3 - COMPRA BOA</b>\n\n";
      } else if (
        cotacao.precoUnitario >= dadostesouro.q3 &&
        cotacao.precoUnitario <= dadostesouro.max
      ) {
        message = `<b>Título:</b> ${cotacao.titulo}\n<b>Preço unitário:</b> ${cotacao.precoUnitario}\n<b>Investimento mínimo:</b> ${cotacao.investimentoMinimo}\n<b>Rentabilidade anual:</b> ${cotacao.rentabilidadeAnual}%\n<b>Vencimento:</b> ${cotacao.vencimento}\n\n`;
        message += `<b>Mínimo:</b> ${dadostesouro.min}\n<b>1º quartil:</b> ${dadostesouro.q1}\n<b>Mediana:</b> ${dadostesouro.median}\n<b>3º quartil:</b> ${dadostesouro.q3}\n<b>Máximo:</b> ${dadostesouro.max}\n<b>Média:</b> ${dadostesouro.mean}\n<b>Desvio padrão:</b> ${dadostesouro.stdev}\n\n`;
        message += "😀 <b>J4 - COMPRA ÓTIMA</b>\n\n";
      }

      if (message !== "") {
        await bot.telegram.sendMessage(process.env.CHAT_ID, message, {
          parse_mode: "HTML",
        });
        message = "";
      }
    }

    if (message === "")
      await ctx.replyWithMarkdown(
        "Não foram encontrados títulos bons para comprar",
        keyboard
      );
  } catch (error) {
    console.error(error.message);
    ctx.reply("Ocorreu um erro ao buscar as informações do título.", keyboard);
  }
}

// Chamar a função verificarRentabilidade() periodicamente usando setInterval()
setInterval(
  verificarRentabilidade,
  parseFloat(process.env.ALERTA_PERIODO_MINUTOS) * 60 * 1000
);

// Inicia o bot
verificarRentabilidade();
bot.launch();
