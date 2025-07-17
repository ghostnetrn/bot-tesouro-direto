/**
 * Tesouro Direto - Modern Financial UI
 * Main JavaScript file - Fixed version without ID column
 */

// Global variables
let tabela;
let isDarkTheme = false;

// Helper functions for text formatting with line breaks
function formatTitleWithLineBreak(title) {
  // Put "Tesouro" on first line, rest on second line
  if (title.startsWith('Tesouro ')) {
    const parts = title.split(' ');
    return `Tesouro<br>${parts.slice(1).join(' ')}`;
  }
  return title;
}

function formatRateWithLineBreak(rate) {
  // Put "IPCA+" on first line, percentage on second line
  if (typeof rate === 'string' && rate.includes('IPCA +')) {
    const parts = rate.split(' + ');
    return `IPCA+<br>${parts[1]}`;
  } else if (typeof rate === 'string' && rate.includes('SELIC +')) {
    const parts = rate.split(' + ');
    return `SELIC+<br>${parts[1]}`;
  }
  return rate;
}

function formatWindowWithLineBreak(windowText) {
  // Put first word on first line, rest on second line
  const parts = windowText.split(' ');
  if (parts.length > 1) {
    return `${parts[0]}<br>${parts.slice(1).join(' ')}`;
  }
  return windowText;
}

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const nav = document.getElementById('nav');
const dateRangeInput = document.getElementById('daterange');
const resetBtn = document.getElementById('reset-btn');
const alertElement = document.getElementById('alerta');
const progressBar = document.getElementById('alerta_progresso');
const tableBody = document.getElementById('treasuryBondsTableBody');
const lastUpdateElement = document.getElementById('last-update');
const dashboardElement = document.getElementById('dashboard');

// Theme Toggle
function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('dark-theme', isDarkTheme);

  // Update icon
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
  }

  // Save preference
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

// Initialize theme from saved preference
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  isDarkTheme = savedTheme === 'dark' || (!savedTheme && prefersDark);
  document.body.classList.toggle('dark-theme', isDarkTheme);

  // Update icon
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// Function to determine color class based on proximity to reference values
function getColorClassByProximity(currentValue, stats) {
  const min = parseFloat(stats.min);
  const q1 = parseFloat(stats.q1);
  const median = parseFloat(stats.median);
  const q3 = parseFloat(stats.q3);
  const max = parseFloat(stats.max);
  const mean = parseFloat(stats.mean);

  // Calculate distances to each reference point
  const distances = {
    min: Math.abs(currentValue - min),
    q1: Math.abs(currentValue - q1),
    median: Math.abs(currentValue - median),
    q3: Math.abs(currentValue - q3),
    max: Math.abs(currentValue - max),
    mean: Math.abs(currentValue - mean)
  };

  // Find the closest reference point
  const closestPoint = Object.keys(distances).reduce((a, b) =>
    distances[a] < distances[b] ? a : b
  );

  // Return appropriate CSS class based on closest point
  switch (closestPoint) {
    case 'max':
      return 'value-closest-to-max'; // Green background + white text
    case 'q3':
      return 'value-closest-to-q3'; // Green text only
    case 'min':
      return 'value-closest-to-min'; // Red text
    case 'q1':
      return 'value-closest-to-q1'; // Red text
    case 'mean':
      return 'value-closest-to-mean'; // Blue text
    case 'median':
    default:
      return 'value-closest-to-median'; // Normal color
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  nav.classList.toggle('show');
}

// Format date
function formatDate(date) {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return date.toLocaleDateString('pt-BR', options);
}

// Get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffDay > 0) {
    return `há ${diffDay} ${diffDay === 1 ? 'dia' : 'dias'}`;
  } else if (diffHour > 0) {
    return `há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
  } else if (diffMin > 0) {
    return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  } else {
    return 'agora mesmo';
  }
}

// Get last update info
async function getLastUpdateInfo() {
  try {
    const response = await fetch('PrecoTaxaTesouroDireto.csv');
    const lastModified = response.headers.get('Last-Modified');
    const dataModificacao = new Date(lastModified);

    // Format date
    const dataFormatada = formatDate(dataModificacao);
    const timeAgo = getTimeAgo(dataModificacao);

    // Update UI
    if (lastUpdateElement) {
      lastUpdateElement.innerHTML = `
        <div class="metric-value">${dataFormatada}</div>
        <div class="metric-label">Atualizado ${timeAgo}</div>
      `;
    }
  } catch (error) {
    console.error('Error getting last update info:', error);

    if (lastUpdateElement) {
      lastUpdateElement.innerHTML = `
        <div class="metric-value">Indisponível</div>
        <div class="metric-label">Não foi possível obter a data de atualização</div>
      `;
    }
  }
}

// Initialize dashboard
function initDashboard() {
  // Show loading skeletons
  if (dashboardElement) {
    dashboardElement.querySelectorAll('.card-body').forEach(card => {
      card.innerHTML = `
        <div class="skeleton" style="width: 80%;"></div>
        <div class="skeleton" style="width: 60%;"></div>
        <div class="skeleton" style="width: 70%;"></div>
      `;
    });
  }
}

// Update dashboard with data
function updateDashboard() {
  if (!dashboardElement) return;

  // Process data for dashboard
  const opportunities = [];

  // Extract data from table rows
  const tableRows = document.querySelectorAll('#treasuryBondsTableBody tr');
  tableRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 12) {
      const title = cells[0].textContent.trim();
      const maturity = cells[1].textContent.trim();

      // Extrair a taxa corretamente, lidando com formatos diferentes (IPCA+, SELIC+, etc.)
      let rateText = cells[3].textContent.trim();
      let rate;

      if (rateText.includes('IPCA +') || rateText.includes('SELIC +')) {
        // Para títulos indexados, extrair apenas o valor numérico após o '+'
        const parts = rateText.split('+');
        if (parts.length > 1) {
          rate = parseFloat(parts[1].replace('%', '').trim());
        } else {
          rate = 0;
        }
      } else {
        // Para títulos prefixados, extrair o valor numérico diretamente
        rate = parseFloat(rateText.replace('%', '').trim());
      }

      // Garantir que rate seja um número válido
      if (isNaN(rate)) {
        rate = 0;
      }

      const windowText = cells[11].textContent.trim();

      let windowQuality = 0;
      if (windowText.includes('ÓTIMA')) windowQuality = 4;
      else if (windowText.includes('BOA')) windowQuality = 3;
      else if (windowText.includes('RUIM')) windowQuality = 2;
      else if (windowText.includes('PÉSSIMA')) windowQuality = 1;

      opportunities.push({
        title,
        maturity,
        rate,
        windowText,
        windowQuality
      });
    }
  });

  // Sort by quality and rate
  opportunities.sort((a, b) => {
    if (b.windowQuality !== a.windowQuality) {
      return b.windowQuality - a.windowQuality;
    }
    return b.rate - a.rate;
  });

  // Update best opportunities card
  const bestOpportunitiesElement = document.getElementById('best-opportunities');
  if (bestOpportunitiesElement) {
    const bestOnes = opportunities.slice(0, 3);

    if (bestOnes.length === 0) {
      bestOpportunitiesElement.innerHTML = '<p class="text-muted">Nenhuma oportunidade encontrada</p>';
    } else {
      let html = '<ul class="opportunity-list">';

      bestOnes.forEach(opp => {
        const statusClass = opp.windowQuality === 4 ? 'status-optimal' :
          opp.windowQuality === 3 ? 'status-good' :
            opp.windowQuality === 2 ? 'status-bad' : 'status-terrible';

        const windowText = opp.windowText.replace('J4 - ', '').replace('J3 - ', '').replace('J2 - ', '').replace('J1 - ', '');

        html += `
          <li class="opportunity-item">
            <div class="opportunity-title">${opp.title}</div>
            <div class="opportunity-details">
              <span class="opportunity-rate">${opp.rate.toFixed(2)}%</span>
              <span class="opportunity-maturity">Venc: ${opp.maturity}</span>
            </div>
            <div class="status ${statusClass}">${windowText}</div>
          </li>
        `;
      });

      html += '</ul>';
      bestOpportunitiesElement.innerHTML = html;
    }
  }

  // Update market overview card
  const marketOverviewElement = document.getElementById('market-overview');
  if (marketOverviewElement) {
    // Calculate statistics
    const totalOpportunities = opportunities.length;
    const optimalCount = opportunities.filter(o => o.windowQuality === 4).length;
    const goodCount = opportunities.filter(o => o.windowQuality === 3).length;
    const badCount = opportunities.filter(o => o.windowQuality === 2).length;
    const terribleCount = opportunities.filter(o => o.windowQuality === 1).length;

    // Calculate percentages
    const optimalPercent = totalOpportunities > 0 ? (optimalCount / totalOpportunities * 100).toFixed(0) : 0;
    const goodPercent = totalOpportunities > 0 ? (goodCount / totalOpportunities * 100).toFixed(0) : 0;

    // Determine market sentiment
    let marketSentiment = 'neutro';
    let sentimentClass = 'text-muted';

    if (optimalPercent > 50) {
      marketSentiment = 'muito favorável';
      sentimentClass = 'text-success';
    } else if (optimalPercent > 30 || (optimalPercent > 20 && goodPercent > 30)) {
      marketSentiment = 'favorável';
      sentimentClass = 'text-success';
    } else if (terribleCount > totalOpportunities / 2) {
      marketSentiment = 'desfavorável';
      sentimentClass = 'text-danger';
    }

    // Update UI
    marketOverviewElement.innerHTML = `
      <p class="market-summary">Mercado <strong class="${sentimentClass}">${marketSentiment}</strong> para compra</p>
      
      <div class="market-stats">
        <div class="stat-item">
          <span class="stat-value status-optimal">${optimalCount}</span>
          <span class="stat-label">Ótimas</span>
        </div>
        <div class="stat-item">
          <span class="stat-value status-good">${goodCount}</span>
          <span class="stat-label">Boas</span>
        </div>
        <div class="stat-item">
          <span class="stat-value status-bad">${badCount}</span>
          <span class="stat-label">Ruins</span>
        </div>
        <div class="stat-item">
          <span class="stat-value status-terrible">${terribleCount}</span>
          <span class="stat-label">Péssimas</span>
        </div>
      </div>
      
      <div class="market-distribution">
        <div class="progress">
          <div class="progress-bar bg-success" style="width: ${optimalPercent}%"></div>
          <div class="progress-bar bg-info" style="width: ${goodPercent}%"></div>
          <div class="progress-bar bg-warning" style="width: ${(badCount / totalOpportunities * 100).toFixed(0)}%"></div>
          <div class="progress-bar bg-danger" style="width: ${(terribleCount / totalOpportunities * 100).toFixed(0)}%"></div>
        </div>
      </div>
    `;
  }
}

// Get data for a specific date range
async function getData(startDate, endDate) {
  if (tabela) {
    tabela.destroy();
  }

  try {
    // Show loading state
    if (alertElement) {
      alertElement.style.display = 'block';
      alertElement.querySelector('.alert-title').textContent = 'Gerando histórico do período! Aguarde.';
    }

    // Fetch data from local file instead of API to avoid CORS issues
    const response = await fetch('tesouro.json');
    const data = await response.json();
    const treasuryBonds = data.response;

    // Clear table body
    if (tableBody) {
      tableBody.innerHTML = '';
    }

    // Process each bond
    for (const [indice, bond] of treasuryBonds.TrsrBdTradgList.entries()) {
      // Update progress bar
      if (progressBar) {
        progressBar.style.width = `${(indice / treasuryBonds.TrsrBdTradgList.length) * 100}%`;
      }

      const currBondName = bond.TrsrBd.nm;
      const index = bond.TrsrBd.cd;

      // Skip certain bonds
      if (
        currBondName.toLowerCase().includes("selic") ||
        currBondName.toLowerCase().includes("educa+")
      ) continue;

      const { anulInvstmtRate, minInvstmtAmt, untrInvstmtVal, mtrtyDt } = bond.TrsrBd;

      // Format data
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

      // Format rentabilidade
      if (currBondName.toLowerCase().includes("selic")) {
        info.rentabilidadeAnual = "SELIC + " + anulInvstmtRate;
      } else if (currBondName.toLowerCase().includes("ipca")) {
        info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate;
      } else if (currBondName.toLowerCase().includes("renda")) {
        info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate;
      } else {
        info.rentabilidadeAnual = anulInvstmtRate;
      }

      // Format date
      const mtrtyDate = new Date(mtrtyDt);
      const dia = mtrtyDate.getDate().toString().padStart(2, "0");
      const mes = (mtrtyDate.getMonth() + 1).toString().padStart(2, "0");
      const ano = mtrtyDate.getFullYear().toString();
      const vencimento = `${dia}/${mes}/${ano}`;

      // Get historical data
      let tituloDados = currBondName.replace(/\s\d+$/, "");
      if (tituloDados.toLowerCase().includes("renda+")) {
        tituloDados = "Tesouro Renda+ Aposentadoria Extra";
      }

      const dt = await getTesouroRange(tituloDados, vencimento, startDate, endDate);

      // Determine window
      let janela = "";
      let statusClass = "";

      if (anulInvstmtRate < dt.q1 && anulInvstmtRate > dt.min) {
        janela = "COMPRA PÉSSIMA";
        statusClass = "status-terrible";
      } else if (anulInvstmtRate <= dt.median && anulInvstmtRate > dt.q1) {
        janela = "COMPRA RUIM";
        statusClass = "status-bad";
      } else if (anulInvstmtRate <= dt.q3 && anulInvstmtRate > dt.median) {
        janela = "COMPRA BOA";
        statusClass = "status-good";
      } else if (anulInvstmtRate <= dt.max && anulInvstmtRate > dt.q3) {
        janela = "COMPRA ÓTIMA";
        statusClass = "status-optimal";
      }

      // Create table row
      if (minInvstmtAmt > 0 && tableBody) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><a href="https://www.tesourodireto.com.br/titulos/historico-de-precos-e-taxas.htm" target="_blank">${info.titulo}</a></td>
          <td>${vencimento}</td>
          <td class="numeric">${info.investimentoMinimo}</td>
          <td class="numeric">${info.rentabilidadeAnual}%</td>
          <td class="numeric">${dt.min}</td>
          <td class="numeric">${dt.q1}</td>
          <td class="numeric">${dt.median}</td>
          <td class="numeric">${dt.q3}</td>
          <td class="numeric">${dt.max}</td>
          <td class="numeric">${dt.mean}</td>
          <td class="numeric">${dt.stdev}</td>
          <td><span class="status ${statusClass}">${janela}</span></td>
        `;

        tableBody.appendChild(tr);
      }
    }

    // Hide loading state
    if (alertElement) {
      alertElement.style.display = 'none';
    }

    // Initialize DataTable
    tabela = $("#tesouro").DataTable({
      paging: false,
      ordering: true,
      order: [[11, "desc"]], // Updated column index for sorting (was 12)
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.3/i18n/pt-BR.json",
      }
    });

    // Update dashboard
    updateDashboard();

  } catch (error) {
    console.error(error);

    // Show error state
    if (alertElement) {
      alertElement.className = 'alert alert-danger';
      alertElement.innerHTML = `
        <h4 class="alert-title">Erro ao carregar dados</h4>
        <p>Não foi possível processar os dados do Tesouro Direto. Por favor, tente novamente mais tarde.</p>
        <button type="button" class="btn btn-danger" onclick="location.reload()">
          <i class="fas fa-sync-alt"></i> Tentar novamente
        </button>
      `;
      alertElement.style.display = 'block';
    }
  }
}

// Get historical data for a specific range
async function getTesouroRange(tipoTitulo, vencimentoTitulo, startDate, endDate) {
  try {
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

      // Check if date is within range
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

    // Calculate statistics
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
  } catch (error) {
    console.error('Error getting historical data:', error);
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
}

// Get historical data
async function getTesouroInfo(tipoTitulo, vencimentoTitulo) {
  try {
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

    // Calculate statistics
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
  } catch (error) {
    console.error('Error getting historical data:', error);
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
}

// Initialize DateRangePicker
function initDateRangePicker() {
  if (!dateRangeInput) return;

  $(dateRangeInput).daterangepicker({
    ranges: {
      'Último ano': [moment().subtract(1, 'years'), moment()],
      'Últimos 2 anos': [moment().subtract(2, 'years'), moment()],
      'Últimos 3 anos': [moment().subtract(3, 'years'), moment()],
      'Últimos 4 anos': [moment().subtract(4, 'years'), moment()],
      'Últimos 5 anos': [moment().subtract(5, 'years'), moment()],
    },
    autoUpdateInput: false,
    opens: 'left',
    showDropdowns: true,
    linkedCalendars: false,
    locale: {
      format: 'DD/MM/YYYY',
      separator: ' - ',
      applyLabel: 'Aplicar',
      cancelLabel: 'Cancelar',
      fromLabel: 'De',
      toLabel: 'Até',
      customRangeLabel: 'Período personalizado',
      daysOfWeek: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      monthNames: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ],
      firstDay: 1
    }
  });

  // Apply date range
  $(dateRangeInput).on('apply.daterangepicker', async function (_, picker) {
    const startDate = picker.startDate;
    const endDate = picker.endDate;

    $(this).val(
      picker.startDate.format('DD/MM/YYYY') +
      ' - ' +
      picker.endDate.format('DD/MM/YYYY')
    );

    // Enable reset button
    if (resetBtn) {
      resetBtn.disabled = false;
    }

    // Get data for selected range
    await getData(startDate, endDate);
  });
}

// Load initial data
async function loadInitialData() {
  try {
    // Show loading state
    if (alertElement) {
      alertElement.style.display = 'block';
    }

    // Initialize dashboard
    initDashboard();

    // Get last update info
    await getLastUpdateInfo();

    // Fetch data
    const response = await fetch('tesouro.json');
    const data = await response.json();
    const treasuryBonds = data.response;

    // Clear table body
    if (tableBody) {
      tableBody.innerHTML = '';
    }

    // Process each bond
    for (const [indice, bond] of treasuryBonds.TrsrBdTradgList.entries()) {
      // Update progress bar
      if (progressBar) {
        progressBar.style.width = `${(indice / treasuryBonds.TrsrBdTradgList.length) * 100}%`;
      }

      const currBondName = bond.TrsrBd.nm;
      const index = bond.TrsrBd.cd;

      // Skip certain bonds
      if (
        currBondName.toLowerCase().includes("selic") ||
        currBondName.toLowerCase().includes("educa+")
      ) continue;

      const { anulInvstmtRate, minInvstmtAmt, untrInvstmtVal, mtrtyDt } = bond.TrsrBd;

      // Format data
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

      // Format rentabilidade
      if (currBondName.toLowerCase().includes("selic")) {
        info.rentabilidadeAnual = "SELIC + " + anulInvstmtRate;
      } else if (currBondName.toLowerCase().includes("ipca")) {
        info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate;
      } else if (currBondName.toLowerCase().includes("renda")) {
        info.rentabilidadeAnual = "IPCA + " + anulInvstmtRate;
      } else {
        info.rentabilidadeAnual = anulInvstmtRate;
      }

      // Format date
      const mtrtyDate = new Date(mtrtyDt);
      const dia = mtrtyDate.getDate().toString().padStart(2, "0");
      const mes = (mtrtyDate.getMonth() + 1).toString().padStart(2, "0");
      const ano = mtrtyDate.getFullYear().toString();
      const vencimento = `${dia}/${mes}/${ano}`;

      // Get historical data
      let tituloDados = currBondName.replace(/\s\d+$/, "");
      if (tituloDados.toLowerCase().includes("renda+")) {
        tituloDados = "Tesouro Renda+ Aposentadoria Extra";
      }

      const dt = await getTesouroInfo(tituloDados, vencimento);

      // Determine window
      let janela = "";
      let statusClass = "";

      if (anulInvstmtRate < dt.q1 && anulInvstmtRate > dt.min) {
        janela = "COMPRA PÉSSIMA";
        statusClass = "status-terrible";
      } else if (anulInvstmtRate <= dt.median && anulInvstmtRate > dt.q1) {
        janela = "COMPRA RUIM";
        statusClass = "status-bad";
      } else if (anulInvstmtRate <= dt.q3 && anulInvstmtRate > dt.median) {
        janela = "COMPRA BOA";
        statusClass = "status-good";
      } else if (anulInvstmtRate <= dt.max && anulInvstmtRate > dt.q3) {
        janela = "COMPRA ÓTIMA";
        statusClass = "status-optimal";
      }

      // Create table row
      if (minInvstmtAmt > 0 && tableBody) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><a href="https://www.tesourodireto.com.br/titulos/historico-de-precos-e-taxas.htm" target="_blank">${info.titulo}</a></td>
          <td>${vencimento}</td>
          <td class="numeric">${info.investimentoMinimo}</td>
          <td class="numeric">${info.rentabilidadeAnual}%</td>
          <td class="numeric">${dt.min}</td>
          <td class="numeric">${dt.q1}</td>
          <td class="numeric">${dt.median}</td>
          <td class="numeric">${dt.q3}</td>
          <td class="numeric">${dt.max}</td>
          <td class="numeric">${dt.mean}</td>
          <td class="numeric">${dt.stdev}</td>
          <td><span class="status ${statusClass}">${janela}</span></td>
        `;

        tableBody.appendChild(tr);
      }
    }

    // Hide loading state
    if (alertElement) {
      alertElement.style.display = 'none';
    }

    // Initialize DataTable
    tabela = $("#tesouro").DataTable({
      paging: false,
      ordering: true,
      order: [[11, "desc"]], // Updated column index for sorting (was 12)
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.3/i18n/pt-BR.json",
      }
    });

    // Update dashboard
    updateDashboard();

  } catch (error) {
    console.error('Error loading initial data:', error);

    // Show error state
    if (alertElement) {
      alertElement.className = 'alert alert-danger';
      alertElement.innerHTML = `
        <h4 class="alert-title">Erro ao carregar dados</h4>
        <p>Não foi possível processar os dados do Tesouro Direto. Por favor, tente novamente mais tarde.</p>
        <button type="button" class="btn btn-danger" onclick="location.reload()">
          <i class="fas fa-sync-alt"></i> Tentar novamente
        </button>
      `;
      alertElement.style.display = 'block';
    }
  }
}

// Initialize app
function initApp() {
  // Initialize theme
  initTheme();

  // Add event listeners
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      location.reload();
    });

    // Disable reset button initially
    resetBtn.disabled = true;
  }

  // Initialize date range picker
  initDateRangePicker();

  // Load initial data
  loadInitialData();
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);