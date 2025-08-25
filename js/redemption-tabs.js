/**
 * Tesouro Direto - Redemption Tabs Management
 * Handles investment vs redemption rate comparison
 */

// Global variables for redemption data
let redemptionData = [];
let investmentData = [];
let comparisonTable;
let redemptionTable;

// Load redemption data from CSV
async function loadRedemptionData() {
  try {
    const response = await fetch('rendimento_resgatar.csv');
    const buffer = await response.arrayBuffer();

    // Try UTF-8 first, fallback to ISO-8859-1
    let csv = new TextDecoder('utf-8').decode(buffer);
    if (!csv || !csv.includes('\n')) {
      csv = new TextDecoder('iso-8859-1').decode(buffer);
    }

    // Normalize line breaks and remove BOM
    csv = csv.replace(/\r/g, '').replace(/^\uFEFF/, '');
    const lines = csv.split('\n').filter(l => l.trim().length);

    if (lines.length < 2) throw new Error('CSV sem dados de resgate');

    // Parse header
    const header = lines[0].trim();
    const delim = header.includes(';') ? ';' : ',';
    const H = header.split(delim).map(h => h.trim().toUpperCase());

    // Find column indices
    const iTitulo = H.findIndex(h => h.includes('TÍTULO') || h.includes('TITULO'));
    const iRend = H.findIndex(h => h.includes('RENDIMENTO'));
    const iPU = H.findIndex(h => h.includes('PREÇO') || h.includes('PRECO'));
    const iVenc = H.findIndex(h => h.includes('VENCIMENTO'));

    if ([iTitulo, iRend, iPU, iVenc].some(i => i < 0)) {
      throw new Error('Cabeçalhos inesperados em rendimento_resgatar.csv');
    }

    // Parse data
    redemptionData = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(delim).map(c => c.trim());
      if (!cols[iTitulo] || !cols[iVenc]) continue;

      const nm = cols[iTitulo];
      const rate = parseRendimento(cols[iRend]);
      const pu = parseNumberBR(cols[iPU]);
      const mdt = toISO(cols[iVenc]);

      redemptionData.push({
        titulo: nm,
        rendimento: rate,
        precoUnitario: pu,
        vencimento: mdt,
        vencimentoFormatado: formatDateFromISO(mdt)
      });
    }

    return redemptionData;
  } catch (error) {
    console.error('Erro ao carregar dados de resgate:', error);
    return [];
  }
}

// Helper functions
function parseNumberBR(s) {
  if (s == null) return 0;
  s = String(s).replace(/\s/g, '').replace(/[R$\u00A0]/g, '');
  s = s.replace(/[^\d,.\-]/g, '');
  if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : 0;
}

function parseRendimento(txt) {
  const t = String(txt).trim().toUpperCase();
  const plus = t.split('+')[1];
  const alvo = plus ? plus : t;
  return parseNumberBR(alvo.replace('%', ''));
}

function toISO(dmy) {
  const m = String(dmy).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return String(dmy).trim();
  const [, d, mth, y] = m;
  return `${y}-${mth}-${d}T00:00:00`;
}

function formatDateFromISO(isoDate) {
  const date = new Date(isoDate);
  const dia = date.getDate().toString().padStart(2, "0");
  const mes = (date.getMonth() + 1).toString().padStart(2, "0");
  const ano = date.getFullYear().toString();
  return `${dia}/${mes}/${ano}`;
}

// Tab management
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      document.getElementById(`content-${targetTab}`).classList.add('active');

      // Load appropriate data based on tab
      if (targetTab === 'resgatar') {
        loadRedemptionTable();
      } else if (targetTab === 'comparacao') {
        loadComparisonTable();
      }
    });
  });
}

// Load redemption table
async function loadRedemptionTable() {
  const tableBody = document.getElementById('treasuryRedemptionTableBody');
  if (!tableBody) return;

  // Show loading state
  tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Carregando dados de resgate...</td></tr>';

  try {
    const redemptionData = await loadRedemptionData();

    if (redemptionData.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum dado de resgate disponível</td></tr>';
      return;
    }

    // Clear table
    tableBody.innerHTML = '';

    // Populate table
    redemptionData.forEach(bond => {
      const tr = document.createElement('tr');

      // Calculate analysis
      let analysis = 'Neutro';
      let analysisClass = 'recommendation-neutral';

      // Simple analysis based on rate
      if (bond.rendimento > 12) {
        analysis = 'Bom momento para resgatar';
        analysisClass = 'recommendation-sell';
      } else if (bond.rendimento < 8) {
        analysis = 'Considere manter';
        analysisClass = 'recommendation-hold';
      }

      // Format rate display
      let rateDisplay = `${bond.rendimento.toFixed(2)}%`;
      if (bond.titulo.toLowerCase().includes('ipca')) {
        rateDisplay = `IPCA + ${bond.rendimento.toFixed(2)}%`;
      } else if (bond.titulo.toLowerCase().includes('selic')) {
        rateDisplay = `SELIC + ${bond.rendimento.toFixed(2)}%`;
      }

      tr.innerHTML = `
        <td><a href="https://www.tesourodireto.com.br/titulos/historico-de-precos-e-taxas.htm" target="_blank">${bond.titulo}</a></td>
        <td>${bond.vencimentoFormatado}</td>
        <td class="numeric">${rateDisplay}</td>
        <td class="numeric">R$ ${bond.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="numeric">-</td>
        <td><span class="${analysisClass}">${analysis}</span></td>
      `;

      tableBody.appendChild(tr);
    });

    // Initialize DataTable for redemption
    if (redemptionTable) {
      redemptionTable.destroy();
    }

    redemptionTable = $("#tesouro-resgate").DataTable({
      paging: false,
      ordering: true,
      order: [[2, "desc"]],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.3/i18n/pt-BR.json",
      }
    });

  } catch (error) {
    console.error('Erro ao carregar tabela de resgate:', error);
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Erro ao carregar dados de resgate</td></tr>';
  }
}

// Load comparison table
async function loadComparisonTable() {
  const tableBody = document.getElementById('treasuryComparisonTableBody');
  if (!tableBody) return;

  // Show loading state
  tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Carregando comparação...</td></tr>';

  try {
    // Load both investment and redemption data
    const [investmentBonds, redemptionBonds] = await Promise.all([
      loadTreasuryBonds(),
      loadRedemptionData()
    ]);

    // Clear table
    tableBody.innerHTML = '';

    // Create comparison data
    const comparisonData = [];

    investmentBonds.TrsrBdTradgList.forEach(invBond => {
      const invData = invBond.TrsrBd;

      // Skip SELIC and Educa+ bonds
      if (invData.nm.toLowerCase().includes("selic") ||
        invData.nm.toLowerCase().includes("educa+")) return;

      // Find matching redemption bond
      const redemptionBond = redemptionBonds.find(redBond => {
        const invName = invData.nm.toLowerCase().replace(/\s+/g, ' ').trim();
        const redName = redBond.titulo.toLowerCase().replace(/\s+/g, ' ').trim();
        return invName === redName ||
          invName.includes(redName.split(' ').slice(0, 3).join(' ')) ||
          redName.includes(invName.split(' ').slice(0, 3).join(' '));
      });

      if (redemptionBond) {
        const spread = invData.anulInvstmtRate - redemptionBond.rendimento;

        comparisonData.push({
          titulo: invData.nm,
          vencimento: formatDateFromISO(invData.mtrtyDt),
          taxaInvestir: invData.anulInvstmtRate,
          taxaResgatar: redemptionBond.rendimento,
          spread: spread,
          puInvestir: invData.untrInvstmtVal,
          puResgatar: redemptionBond.precoUnitario,
          investmentData: invData,
          redemptionData: redemptionBond
        });
      }
    });

    // Sort by spread (highest first)
    comparisonData.sort((a, b) => b.spread - a.spread);

    // Populate table
    comparisonData.forEach(item => {
      const tr = document.createElement('tr');

      // Determine recommendation
      let recommendation = 'Neutro';
      let recommendationClass = 'recommendation-neutral';

      if (item.spread > 2) {
        recommendation = 'Favorável para investir';
        recommendationClass = 'recommendation-buy';
      } else if (item.spread < -1) {
        recommendation = 'Considere resgatar';
        recommendationClass = 'recommendation-sell';
      } else if (Math.abs(item.spread) <= 1) {
        recommendation = 'Aguardar';
        recommendationClass = 'recommendation-hold';
      }

      // Format rates
      let taxaInvestirDisplay = `${item.taxaInvestir.toFixed(2)}%`;
      let taxaResgatarDisplay = `${item.taxaResgatar.toFixed(2)}%`;

      if (item.titulo.toLowerCase().includes('ipca')) {
        taxaInvestirDisplay = `IPCA + ${item.taxaInvestir.toFixed(2)}%`;
        taxaResgatarDisplay = `IPCA + ${item.taxaResgatar.toFixed(2)}%`;
      } else if (item.titulo.toLowerCase().includes('selic')) {
        taxaInvestirDisplay = `SELIC + ${item.taxaInvestir.toFixed(2)}%`;
        taxaResgatarDisplay = `SELIC + ${item.taxaResgatar.toFixed(2)}%`;
      }

      // Format spread
      const spreadClass = item.spread > 0 ? 'spread-positive' :
        item.spread < 0 ? 'spread-negative' : 'spread-neutral';
      const spreadDisplay = `${item.spread > 0 ? '+' : ''}${item.spread.toFixed(2)}%`;

      tr.innerHTML = `
        <td><a href="https://www.tesourodireto.com.br/titulos/historico-de-precos-e-taxas.htm" target="_blank">${item.titulo}</a></td>
        <td>${item.vencimento}</td>
        <td class="numeric">${taxaInvestirDisplay}</td>
        <td class="numeric">${taxaResgatarDisplay}</td>
        <td class="numeric ${spreadClass}">${spreadDisplay}</td>
        <td class="numeric">R$ ${item.puInvestir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="numeric">R$ ${item.puResgatar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td><span class="${recommendationClass}">${recommendation}</span></td>
      `;

      tableBody.appendChild(tr);
    });

    // Initialize DataTable for comparison
    if (comparisonTable) {
      comparisonTable.destroy();
    }

    comparisonTable = $("#tesouro-comparacao").DataTable({
      paging: false,
      ordering: true,
      order: [[4, "desc"]], // Sort by spread
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.3/i18n/pt-BR.json",
      }
    });

  } catch (error) {
    console.error('Erro ao carregar tabela de comparação:', error);
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Erro ao carregar dados de comparação</td></tr>';
  }
}

// Make functions available globally
window.loadRedemptionData = loadRedemptionData;
window.loadRedemptionTable = loadRedemptionTable;
window.loadComparisonTable = loadComparisonTable;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initTabs();
});