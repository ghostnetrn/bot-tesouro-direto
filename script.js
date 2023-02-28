(async function () {
  try {
    const response = await fetch("tesouro.json");
    const data = await response.json();
    const treasuryBonds = data.response;
    const tbody = document.getElementById("treasuryBondsTableBody");

    for (const bond of treasuryBonds.TrsrBdTradgList) {
      const currBondName = bond.TrsrBd.nm;
      const index = bond.TrsrBd.cd;

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
  <td>${info.titulo}</td>
  <td>${vencimento}</td>
  <td>${info.investimentoMinimo}</td>
  <td>${info.rentabilidadeAnual}</td>
  <td>${dt.min}</td>
  <td>${dt.q1}</td>
  <td>${dt.median}</td>
  <td>${dt.q3}</td>
  <td>${dt.max}</td>
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

    $(document).ready(function () {
      $("#tesouro").DataTable({
        paging: false,
        ordering: true,
        language: {
          search: "Procurar",
        },
        createdRow: function ( row, data, index ) {
          if (data[12].includes('J4')) {
            $('td:eq(12)', row).css('background-color', '#ADFF2F');
          }
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
})();

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
