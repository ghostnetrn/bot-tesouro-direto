var tabela = "";

async function getData(startDate, endDate) {
  tabela.destroy();
  try {
    const response = await fetch("tesouro.json");
    const data = await response.json();
    const treasuryBonds = data.response;
    let tbody = document.getElementById("treasuryBondsTableBody");

    if (tbody !== null) {
      tbody.innerHTML = "";
    } else {
      tbody = document.createElement("tbody");
      tbody.id = "treasuryBondsTableBody";
    }

    alerta.innerHTML = alerta.innerHTML.replace(
      "Gerando histórico completo! Aguarde.",
      "Gerando histórico do período! Aguarde."
    );
    alerta.style.display = "block";

    for (const [indice, bond] of treasuryBonds.TrsrBdTradgList.entries()) {
      const currBondName = bond.TrsrBd.nm;
      const index = bond.TrsrBd.cd;

      alerta_progresso.style.width = `${
        (indice / treasuryBonds.TrsrBdTradgList.length) * 100
      }%`;

      if (
        currBondName.toLowerCase().includes("selic") ||
        currBondName.toLowerCase().includes("renda+")
      )
        continue;

      const { anulInvstmtRate, minInvstmtAmt, untrInvstmtVal, mtrtyDt } =
        bond.TrsrBd;

      const info = {
        index,
        titulo: currBondName,
        investimentoMinimo: minInvstmtAmt.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        precoUnitario: untrInvstmtVal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        vencimento: mtrtyDt,
        rentabilidadeAnual: anulInvstmtRate,
      };

      if (currBondName.toLowerCase().includes("selic")) {
        info.rentabilidadeAnual = "SELIC + " + anulInvstmtRate;
      } else if (currBondName.toLowerCase().includes("ipca")) {
        info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate;
      } else if (currBondName.toLowerCase().includes("renda")) {
        info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate;
      } else {
        info.rentabilidadeAnual = anulInvstmtRate;
      }

      const mtrtyDate = new Date(mtrtyDt);
      const dia = mtrtyDate.getDate().toString().padStart(2, "0");
      const mes = (mtrtyDate.getMonth() + 1).toString().padStart(2, "0");
      const ano = mtrtyDate.getFullYear().toString();
      const vencimento = `${dia}/${mes}/${ano}`;

      // getTesouroInfo retorna um objeto com as informações de preço e taxa
      let tituloDados = currBondName.replace(/\s\d+$/, "");

      if (tituloDados.toLowerCase().includes("renda+")) {
        tituloDados = "NTN-B1";
      }

      const dt = await getTesouroRange(
        tituloDados,
        vencimento,
        startDate,
        endDate
      );
      let janela = "";

      if (anulInvstmtRate < dt.q1 && anulInvstmtRate > dt.min) {
        janela = "J1 - COMPRA PÉSSIMA";
      } else if (anulInvstmtRate <= dt.median && anulInvstmtRate > dt.q1) {
        janela = "J2 - COMPRA RUIM";
      } else if (anulInvstmtRate <= dt.q3 && anulInvstmtRate > dt.median) {
        janela = "J3 - COMPRA BOA";
      } else if (anulInvstmtRate <= dt.max && anulInvstmtRate > dt.q3) {
        janela = "J4 - COMPRA ÓTIMA";
      }

      if (minInvstmtAmt > 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
  <td>${info.index}</td>
  <td><a href="https://www.tesourodireto.com.br/titulos/historico-de-precos-e-taxas.htm" target="_blank">${
    info.titulo
  }</a></td>
  <td>${vencimento}</td>
  <td>${info.investimentoMinimo}</td>
  <td>${info.rentabilidadeAnual}%</td>
  <td>${dt.min}</td>
  <td>${dt.q1}</td>
  <td>${dt.median}</td>
  <td>
  <strong style="color: ${
    Math.abs(anulInvstmtRate - dt.q3) < Math.abs(anulInvstmtRate - dt.max)
      ? "green"
      : "black"
  }">${dt.q3}</strong>
</td>
  <td>
  <strong style="background-color: ${
    Math.abs(anulInvstmtRate - dt.max) < Math.abs(anulInvstmtRate - dt.q3)
      ? "#ADFF2F"
      : ""
  }">${dt.max}</strong>
</td>
  <td>${dt.mean}</td>
  <td>${dt.stdev}</td>
  <td>
    ${
      janela.endsWith("ÓTIMA")
        ? `<strong style="color:green">${janela}</strong>`
        : janela.endsWith("BOA")
        ? `<strong style="color:blue">${janela}</strong>`
        : janela.endsWith("RUIM")
        ? `<strong style="color:orange">${janela}</strong>`
        : janela.endsWith("PÉSSIMA")
        ? `<strong style="color:red">${janela}</strong>`
        : janela
    }
  </td>
`;
        tbody.appendChild(tr);
      }
    }

    alerta.style.display = "none";

    tabela = $("#tesouro").DataTable({
      retrieve: true,
      paging: false,
      ordering: true,
      order: [[12, "desc"]],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.3/i18n/pt-BR.json",
      },
      createdRow: function (row, data, index) {
        if (data[12].includes("J4")) {
          $("td:eq(12)", row).css("background-color", "#ADFF2F");
        }
      },
    });
  } catch (error) {
    console.error(error);
  }
}

async function getTesouroRange(
  tipoTitulo,
  vencimentoTitulo,
  startDate,
  endDate
) {
  const url = "PrecoTaxaTesouroDireto.csv";

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder("iso-8859-1");
  const csvData = decoder.decode(buffer);

  const rows = csvData.split("\n");
  const headers = rows[0].split(";");
  const pus = [];

  const dataBaseIndex = headers.indexOf("Data Base");
  const tipoTituloIndex = headers.indexOf("Tipo Titulo");
  const vencimentoTituloIndex = headers.indexOf("Data Vencimento");
  const taxaCompraIndex = headers.indexOf("Taxa Compra Manha");

  const startDateDate = startDate;
  const endDateDate = endDate;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split(";");
    const dataBase = row[dataBaseIndex];

    if (!dataBase) continue;

    const [dia, mes, ano] = dataBase.split("/");
    const dataBaseDate = new Date(`${ano}-${mes}-${dia}`);

    // Comparar se a data da coluna "Data Base" está dentro do intervalo definido
    if (dataBaseDate >= startDateDate && dataBaseDate <= endDateDate) {
      if (
        row[tipoTituloIndex] === tipoTitulo &&
        row[vencimentoTituloIndex] === vencimentoTitulo
      ) {
        const taxaCompra = parseFloat(row[taxaCompraIndex].replace(",", "."));
        pus.push(taxaCompra);
      }
    }
  }

  if (pus.length === 0) {
    return {
      min: "0.00",
      q1: "0.00",
      median: "0.00",
      q3: "0.00",
      max: "0.00",
      mean: "0.00",
      stdev: "0.00",
    };
  }

  const min = ss.min(pus);
  const q1 = ss.quantile(pus, 0.25);
  const median = ss.median(pus);
  const q3 = ss.quantile(pus, 0.75);
  const max = ss.max(pus);
  const mean = ss.mean(pus);
  const stdev = ss.standardDeviation(pus);

  return {
    min: min.toFixed(2),
    q1: q1.toFixed(2),
    median: median.toFixed(2),
    q3: q3.toFixed(2),
    max: max.toFixed(2),
    mean: mean.toFixed(2),
    stdev: stdev.toFixed(2),
  };
}

// Cria uma nova requisição XMLHttpRequest
let xhr = new XMLHttpRequest();

// Define a URL do arquivo "PrecoTaxaTesouroDireto.csv"
let url = "PrecoTaxaTesouroDireto.csv";

// Abre a requisição com o método GET
xhr.open("GET", url);

// Define o tipo de resposta esperado como "text"
xhr.responseType = "text";

// Adiciona um evento de carregamento à requisição
xhr.onload = function () {
  // Obtém a data de modificação do cabeçalho HTTP "Last-Modified"
  let dataModificacao = new Date(xhr.getResponseHeader("Last-Modified"));

  // Formata a data como uma string legível
  let dataFormatada = dataModificacao.toLocaleString();

  // Seleciona o elemento HTML onde a data será exibida
  let spanDataModificacao = document.getElementById("data-atualizacao");

  // Define o conteúdo do elemento como a data formatada
  spanDataModificacao.textContent = dataFormatada;
};

// Envia a requisição
xhr.send();

$(document).ready(function () {
  $("#reset-btn").on("click", function () {
    location.reload();
  });
});

$("#daterange").daterangepicker({
  ranges: {
    "Últimos 2 anos": [moment().subtract(2, "years"), moment()],
    "Últimos 3 anos": [moment().subtract(3, "years"), moment()],
    "Últimos 4 anos": [moment().subtract(4, "years"), moment()],
    "Último ano": [moment().subtract(1, "years"), moment()],
  },
  autoUpdateInput: false,
  //startDate: null,
  // endDate: null,
  locale: {
    format: "DD/MM/YYYY",
    separator: " - ",
    applyLabel: "Aplicar",
    cancelLabel: "Cancelar",
    fromLabel: "De",
    toLabel: "Até",
    customRangeLabel: "Outro período",
    daysOfWeek: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    monthNames: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    firstDay: 1,
  },
});

$("#daterange").on("apply.daterangepicker", async function (ev, picker) {
  const startDate = picker.startDate;
  const endDate = picker.endDate;
  $(this).val(
    picker.startDate.format("DD/MM/YYYY") +
      " - " +
      picker.endDate.format("DD/MM/YYYY")
  );
  buttonEnable();
  await getData(startDate, endDate);
});

// carrega os dados ao iniciar a página
async function getTesouroInfo(tipoTitulo, vencimentoTitulo) {
  const url = "PrecoTaxaTesouroDireto.csv";

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder("iso-8859-1");
  const csvData = decoder.decode(buffer);

  const rows = csvData.split("\n");
  const headers = rows[0].split(";");
  const pus = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split(";");
    if (
      row[headers.indexOf("Tipo Titulo")] === tipoTitulo &&
      row[headers.indexOf("Data Vencimento")] === vencimentoTitulo
    ) {
      const taxaCompra = parseFloat(
        row[headers.indexOf("Taxa Compra Manha")].replace(",", ".")
      );
      pus.push(taxaCompra);
    }
  }

  if (pus.length === 0) {
    return {
      min: "0.00",
      q1: "0.00",
      median: "0.00",
      q3: "0.00",
      max: "0.00",
      mean: "0.00",
      stdev: "0.00",
    };
  }

  const min = ss.min(pus);
  const q1 = ss.quantile(pus, 0.25);
  const median = ss.median(pus);
  const q3 = ss.quantile(pus, 0.75);
  const max = ss.max(pus);
  const mean = ss.mean(pus);
  const stdev = ss.standardDeviation(pus);

  return {
    min: min.toFixed(2),
    q1: q1.toFixed(2),
    median: median.toFixed(2),
    q3: q3.toFixed(2),
    max: max.toFixed(2),
    mean: mean.toFixed(2),
    stdev: stdev.toFixed(2),
  };
}

(async function () {
  try {
    buttonEnable();
    const response = await fetch("tesouro.json");
    const data = await response.json();
    const treasuryBonds = data.response;
    const tbody = document.getElementById("treasuryBondsTableBody");
    alerta.style.display = "block";

    for (const [indice, bond] of treasuryBonds.TrsrBdTradgList.entries()) {
      const currBondName = bond.TrsrBd.nm;
      const index = bond.TrsrBd.cd;

      alerta_progresso.style.width = `${
        (indice / treasuryBonds.TrsrBdTradgList.length) * 100
      }%`;

      if (
        currBondName.toLowerCase().includes("selic") ||
        currBondName.toLowerCase().includes("renda+") ||
        currBondName.toLowerCase().includes("Educa+") 
      )
        continue;

      const { anulInvstmtRate, minInvstmtAmt, untrInvstmtVal, mtrtyDt } =
        bond.TrsrBd;

      const info = {
        index,
        titulo: currBondName,
        investimentoMinimo: minInvstmtAmt.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        precoUnitario: untrInvstmtVal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        vencimento: mtrtyDt,
        rentabilidadeAnual: anulInvstmtRate,
      };

      if (currBondName.toLowerCase().includes("selic")) {
        info.rentabilidadeAnual = "SELIC + " + anulInvstmtRate;
      } else if (currBondName.toLowerCase().includes("ipca")) {
        info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate;
      } else if (currBondName.toLowerCase().includes("renda")) {
        info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate;
      } else {
        info.rentabilidadeAnual = anulInvstmtRate;
      }

      const mtrtyDate = new Date(mtrtyDt);

      const dia = mtrtyDate.getDate().toString().padStart(2, "0");
      const mes = (mtrtyDate.getMonth() + 1).toString().padStart(2, "0");
      const ano = mtrtyDate.getFullYear().toString();
      const vencimento = `${dia}/${mes}/${ano}`;

      // getTesouroInfo retorna um objeto com as informações de preço e taxa
      let tituloDados = currBondName.replace(/\s\d+$/, "");

      if (tituloDados.toLowerCase().includes("renda+")) {
        tituloDados = "NTN-B1";
      }

      const dt = await getTesouroInfo(tituloDados, vencimento);
      let janela = "";

      if (anulInvstmtRate < dt.q1 && anulInvstmtRate > dt.min) {
        janela = "J1 - COMPRA PÉSSIMA";
      } else if (anulInvstmtRate <= dt.median && anulInvstmtRate > dt.q1) {
        janela = "J2 - COMPRA RUIM";
      } else if (anulInvstmtRate <= dt.q3 && anulInvstmtRate > dt.median) {
        janela = "J3 - COMPRA BOA";
      } else if (anulInvstmtRate <= dt.max && anulInvstmtRate > dt.q3) {
        janela = "J4 - COMPRA ÓTIMA";
      }

      if (minInvstmtAmt > 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
  <td>${info.index}</td>
  <td><a href="https://www.tesourodireto.com.br/titulos/historico-de-precos-e-taxas.htm" target="_blank">${
    info.titulo
  }</a></td>
  <td>${vencimento}</td>
  <td>${info.investimentoMinimo}</td>
  <td>${info.rentabilidadeAnual}%</td>
  <td>${dt.min}</td>
  <td>${dt.q1}</td>
  <td>${dt.median}</td>
  <td>
  <strong style="color: ${
    Math.abs(anulInvstmtRate - dt.q3) < Math.abs(anulInvstmtRate - dt.max)
      ? "green"
      : "black"
  }">${dt.q3}</strong>
</td>
  <td>
  <strong style="background-color: ${
    Math.abs(anulInvstmtRate - dt.max) < Math.abs(anulInvstmtRate - dt.q3)
      ? "#ADFF2F"
      : ""
  }">${dt.max}</strong>
</td>
  <td>${dt.mean}</td>
  <td>${dt.stdev}</td>
  <td>
    ${
      janela.endsWith("ÓTIMA")
        ? `<strong style="color:green">${janela}</strong>`
        : janela.endsWith("BOA")
        ? `<strong style="color:blue">${janela}</strong>`
        : janela.endsWith("RUIM")
        ? `<strong style="color:orange">${janela}</strong>`
        : janela.endsWith("PÉSSIMA")
        ? `<strong style="color:red">${janela}</strong>`
        : janela
    }
  </td>
`;
        tbody.appendChild(tr);
      }
    }

    tabela = $("#tesouro").DataTable({
      paging: false,
      ordering: true,
      order: [[12, "desc"]],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.3/i18n/pt-BR.json",
      },
      createdRow: function (row, data, index) {
        if (data[12].includes("J4")) {
          $("td:eq(12)", row).css("background-color", "#ADFF2F");
        }
      },
    });
    alerta.style.display = "none";
  } catch (error) {
    console.error(error);
  }
})();

function buttonEnable() {
  $(document).ready(function () {
    // Obtenha o botão e o input
    var btn = $("#reset-btn");
    var input = $("#daterange");

    // Desabilita o botão se o input estiver vazio
    btn.prop("disabled", input.val() === "");

    // Habilita ou desabilita o botão conforme o input é alterado
    input.on("input", function () {
      btn.prop("disabled", $(this).val() === "");
    });
  });
}
