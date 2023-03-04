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

  const startDateDate = new Date(startDate);
  const endDateDate = new Date(endDate);

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

  console.log ({
    min: min.toFixed(2),
    q1: q1.toFixed(2),
    median: median.toFixed(2),
    q3: q3.toFixed(2),
    max: max.toFixed(2),
    mean: mean.toFixed(2),
    stdev: stdev.toFixed(2),
  });
}

getTesouroRange(
  "Tesouro IPCA+",
  "15/05/2035",
  "02/01/2020",
  "04/03/2023"
)