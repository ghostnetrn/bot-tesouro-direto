fetch("tesouro.json")
  .then((response) => response.json())
  .then((data) => {
    // Armazene o objeto JSON retornado
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

      if (minInvstmtAmt > 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${info.index}</td>
                      <td>${info.titulo}</td>
                      <td>${vencimento}</td>
                      <td>${info.investimentoMinimo}</td>
                      <td>${info.rentabilidadeAnual}</td>`;
        tbody.appendChild(tr);
      }
    }
  });
