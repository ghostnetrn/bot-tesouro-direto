# Fluxos de Dados e Processos

## 📊 Visão Geral dos Fluxos

Este documento detalha os principais fluxos de dados e processos do sistema Bot Tesouro Direto.

## 🔄 Fluxo 1: Coleta de Dados

### Execução Manual

```
Desenvolvedor executa:
$ node downloadTesouro.js
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────────┐              ┌──────────────────────┐
│ downloadArquivoCSV()│              │ fetchTesouroInvestir()│
│                     │              │                      │
│ URL: Tesouro        │              │ URL: Investidor10    │
│ Transparente        │              │ /tesouro-direto/     │
└──────────┬──────────┘              └──────────┬───────────┘
           │                                    │
           ▼                                    ▼
┌──────────────────────┐            ┌────────────────────────┐
│ PrecoTaxaTesouro     │            │ rendimento_investir.csv│
│ Direto.csv           │            │                        │
│ (Histórico completo) │            │ (Taxas de compra)      │
└──────────────────────┘            └────────────────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────────┐
                                    │ fetchTesouroResgatar()   │
                                    │                          │
                                    │ URL: Investidor10        │
                                    │ /tesouro-direto/resgatar/│
                                    └──────────┬───────────────┘
                                               │
                                               ▼
                                    ┌────────────────────────┐
                                    │ rendimento_resgatar.csv│
                                    │                        │
                                    │ (Taxas de venda)       │
                                    └────────────────────────┘
```

### Detalhes do Scraping (Investidor10)

```
fetchTesouroInvestir()
         │
         ├─> axios.get('https://investidor10.com.br/tesouro-direto/')
         │
         ├─> cheerio.load(html)
         │
         ├─> $('#treasure-list-table tbody tr').each()
         │        │
         │        ├─> Extrai: título, rendimento, mínimo, preço, vencimento
         │        │
         │        ├─> formatarTitulo() → Normaliza nome
         │        │        │
         │        │        ├─> "Selic 2029" → "Tesouro Selic 2029"
         │        │        ├─> "IPCA+ 2035" → "Tesouro IPCA+ 2035"
         │        │        └─> "Prefixado com Juros..." → "Tesouro Prefixado com Juros..."
         │        │
         │        └─> formatMoney() → "R$ 1.234,56"
         │
         └─> Papa.unparse() → Gera CSV
                  │
                  └─> fs.writeFileSync('rendimento_investir.csv')
```

## 🤖 Fluxo 2: Consulta via Bot Telegram

### Fluxo Completo de Consulta

```
Usuário envia: /start
         │
         ▼
┌─────────────────────┐
│ bot.start()         │
│                     │
│ Exibe:              │
│ • Teclado principal │
│ • Menu inline       │
└──────────┬──────────┘
           │
           │ Usuário clica: "✅ Listar títulos bons pra comprar"
           │
           ▼
┌─────────────────────────────────────────┐
│ bot.action('titulosBons')               │
│                                         │
│ 1. listarTitulosComInvestimentoMinimo() │
│    └─> Retorna: array de nomes         │
│                                         │
│ 2. Para cada título:                    │
│    ├─> getTituloInfo(titulo)           │
│    │   └─> API Tesouro Direto          │
│    │       └─> Retorna dados atuais    │
│    │                                    │
│    ├─> getTesouroInfo(tipo, vencimento)│
│    │   └─> Lê PrecoTaxaTesouroDireto.csv│
│    │       └─> Calcula estatísticas    │
│    │                                    │
│    └─> Classifica em J1/J2/J3/J4       │
│                                         │
│ 3. Filtra apenas J3 e J4                │
│                                         │
│ 4. Envia mensagens formatadas           │
└─────────────────────────────────────────┘
```

### Detalhes da Classificação

```
Classificação de Janela
         │
         ├─> Obtém taxa atual (API)
         │
         ├─> Obtém estatísticas históricas (CSV)
         │        │
         │        ├─> min = 4.50
         │        ├─> Q1 = 5.25
         │        ├─> mediana = 5.75
         │        ├─> Q3 = 6.50
         │        └─> max = 7.20
         │
         ├─> taxa = 6.00
         │
         └─> Compara:
                  │
                  ├─> if (taxa <= Q1) → J1 😡 PÉSSIMA
                  ├─> if (Q1 < taxa <= mediana) → J2 😒 RUIM
                  ├─> if (mediana < taxa <= Q3) → J3 😗 BOA ✅
                  └─> if (Q3 < taxa <= max) → J4 😀 ÓTIMA ✅
```

### Formato da Mensagem Enviada

```
┌─────────────────────────────────────────┐
│ *Título:* Tesouro IPCA+ 2035            │
│ *Preço unitário:* R$ 3.456,78           │
│ *Investimento mínimo:* R$ 34,56         │
│ *Rentabilidade anual:* IPCA + 6.00%     │
│ *Vencimento:* 15/05/2035                │
│                                         │
│ *Mínimo:* 4.50                          │
│ *1º quartil:* 5.25                      │
│ *Mediana:* 5.75                         │
│ *3º quartil:* 6.50                      │
│ *Máximo:* 7.20                          │
│ *Média:* 5.80                           │
│ *Desvio padrão:* 0.65                   │
│                                         │
│ 😗 *J3 - COMPRA BOA*                    │
│ _Entre mediana e 3º quartil_            │
└─────────────────────────────────────────┘
```

## ⏰ Fluxo 3: Alertas Automáticos

### Agendamento

```
setInterval(intervaloVerificacao)
         │
         │ A cada 12 horas (720 min)
         │
         ▼
┌─────────────────────────────────────┐
│ Verifica condições:                 │
│                                     │
│ 1. ehDiaUtil(dataAtualBR)           │
│    └─> Segunda a Sexta? ✓           │
│                                     │
│ 2. horaAtualBR === 11:30?           │
│    └─> Sim? ✓                       │
│                                     │
│ Se ambas verdadeiras:               │
│    └─> verificarRentabilidade()     │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│ verificarRentabilidade()                 │
│                                          │
│ PARTE 1: Relatório de Rentabilidade     │
│ ├─> listarTitulos()                      │
│ ├─> Filtra: taxa >= ALERTA_RENTABILIDADE│
│ └─> Envia mensagem com lista             │
│                                          │
│ PARTE 2: Títulos Bons para Comprar      │
│ ├─> listarTitulosComInvestimentoMinimo()│
│ ├─> Para cada título:                    │
│ │   ├─> getTituloInfo()                  │
│ │   ├─> getTesouroInfo()                 │
│ │   └─> Classifica em J1/J2/J3/J4        │
│ ├─> Filtra apenas J3 e J4                │
│ └─> Envia mensagens individuais          │
└──────────────────────────────────────────┘
```

### Exemplo de Alerta Enviado

```
┌─────────────────────────────────────────┐
│ 📝 Relatório diário:                    │
│ Rentabilidade acima de 13%              │
│                                         │
│ Tesouro IPCA+ 2035: 13.25%              │
│ Tesouro Prefixado 2026: 13.50%          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Título: Tesouro IPCA+ 2035              │
│ Preço unitário: R$ 3.456,78             │
│ Investimento mínimo: R$ 34,56           │
│ Rentabilidade anual: IPCA + 6.25%       │
│ Vencimento: 15/05/2035                  │
│                                         │
│ Mínimo: 4.50                            │
│ 1º quartil: 5.25                        │
│ Mediana: 5.75                           │
│ 3º quartil: 6.50                        │
│ Máximo: 7.20                            │
│ Média: 5.80                             │
│ Desvio padrão: 0.65                     │
│                                         │
│ 😗 J3 - COMPRA BOA                      │
│ Entre mediana e 3º quartil              │
└─────────────────────────────────────────┘
```

## 🌐 Fluxo 4: Interface Web

### Carregamento Inicial

```
Usuário abre index.html
         │
         ├─> Carrega CSS
         │   ├─> modern.css
         │   ├─> responsive-table.css
         │   └─> mobile-menu-fix.css
         │
         ├─> Carrega JS
         │   ├─> PapaParse
         │   ├─> simple-statistics
         │   ├─> jQuery
         │   ├─> DataTables
         │   ├─> Moment.js
         │   └─> DateRangePicker
         │
         └─> Executa app-colorized.js
                  │
                  └─> $(document).ready()
                           │
                           └─> loadData()
```

### Fluxo de Carregamento de Dados

```
loadData()
    │
    ├─────────────────────────────────────┐
    │                                     │
    ▼                                     ▼
Papa.parse('rendimento_investir.csv')   Papa.parse('rendimento_resgatar.csv')
    │                                     │
    └─────────────┬───────────────────────┘
                  │
                  ▼
         Papa.parse('PrecoTaxaTesouroDireto.csv')
                  │
                  ├─> Dados carregados com sucesso
                  │
                  ├─> processData()
                  │        │
                  │        ├─> Para cada título:
                  │        │   ├─> calculateStatistics()
                  │        │   │   └─> min, Q1, median, Q3, max, mean, stdev
                  │        │   │
                  │        │   ├─> classifyWindow()
                  │        │   │   └─> J1/J2/J3/J4
                  │        │   │
                  │        │   └─> calculateColorization()
                  │        │       └─> Distância até máximo
                  │        │
                  │        └─> calculateSpread()
                  │            └─> taxa_investir - taxa_resgatar
                  │
                  ├─> renderDashboard()
                  │        │
                  │        ├─> Última Atualização
                  │        ├─> Melhores Oportunidades (top 3 J4)
                  │        └─> Visão Geral do Mercado
                  │
                  └─> initializeTables()
                           │
                           ├─> DataTable('#tesouro')
                           ├─> DataTable('#tesouro-resgate')
                           └─> DataTable('#tesouro-comparacao')
```

### Fluxo de Interação do Usuário

```
Usuário interage com interface
         │
         ├─> Clica em aba
         │   └─> redemption-tabs.js
         │       └─> Alterna conteúdo visível
         │
         ├─> Seleciona período
         │   └─> DateRangePicker
         │       └─> filterByDateRange()
         │           ├─> Filtra dados do CSV
         │           ├─> Recalcula estatísticas
         │           └─> Atualiza tabelas
         │
         ├─> Digita na busca
         │   └─> DataTables.search()
         │       └─> Filtra linhas em tempo real
         │
         ├─> Clica em coluna
         │   └─> DataTables.order()
         │       └─> Ordena por coluna
         │
         └─> Clica em tema
             └─> toggleTheme()
                 ├─> document.body.classList.toggle('dark-theme')
                 └─> localStorage.setItem('theme', 'dark')
```

## 📊 Fluxo 5: Cálculo de Estatísticas

### Processo Detalhado

```
calculateStatistics(data, startDate, endDate)
         │
         ├─> Filtra dados por período
         │   └─> data.filter(d => d.date >= startDate && d.date <= endDate)
         │
         ├─> Extrai taxas
         │   └─> rates = data.map(d => parseFloat(d.taxa))
         │
         ├─> Calcula métricas
         │   ├─> min = ss.min(rates)
         │   ├─> q1 = ss.quantile(rates, 0.25)
         │   ├─> median = ss.median(rates)
         │   ├─> q3 = ss.quantile(rates, 0.75)
         │   ├─> max = ss.max(rates)
         │   ├─> mean = ss.mean(rates)
         │   └─> stdev = ss.standardDeviation(rates)
         │
         └─> Retorna objeto
             {
               min: 4.50,
               q1: 5.25,
               median: 5.75,
               q3: 6.50,
               max: 7.20,
               mean: 5.80,
               stdev: 0.65
             }
```

### Exemplo Numérico

```
Dados históricos (taxas):
[4.50, 4.80, 5.10, 5.25, 5.50, 5.75, 6.00, 6.25, 6.50, 7.20]
  │     │     │     │     │     │     │     │     │     │
  min   │     │     Q1    │   median  │     │     Q3    max
        │     │           │           │     │           │
        └─────┴───────────┴───────────┴─────┴───────────┘
                    Distribuição dos dados

Classificação:
• 4.50 - 5.25 → J1 😡 (25% dos dados)
• 5.25 - 5.75 → J2 😒 (25% dos dados)
• 5.75 - 6.50 → J3 😗 (25% dos dados)
• 6.50 - 7.20 → J4 😀 (25% dos dados)

Taxa atual = 6.00
→ Está entre mediana (5.75) e Q3 (6.50)
→ Classificação: J3 😗 COMPRA BOA
```

## 💰 Fluxo 6: Cálculo de Spread

### Processo

```
calculateSpread(investRate, redeemRate)
         │
         ├─> spread = investRate - redeemRate
         │
         ├─> Classifica:
         │   │
         │   ├─> if (spread > 2.0)
         │   │   └─> 🟢 Favorável para investir
         │   │
         │   ├─> if (spread < -1.0)
         │   │   └─> 🔴 Considere resgatar
         │   │
         │   └─> else
         │       └─> 🟡 Aguardar
         │
         └─> Retorna { spread, recommendation, color }
```

### Exemplo Prático

```
Título: Tesouro IPCA+ 2035

Taxa de Investir: 6.25%
Taxa de Resgatar: 5.80%
         │
         ├─> spread = 6.25 - 5.80 = +0.45%
         │
         └─> Classificação: 🟡 Aguardar
             (spread entre -1.0 e 2.0)

─────────────────────────────────────

Título: Tesouro Prefixado 2026

Taxa de Investir: 12.50%
Taxa de Resgatar: 10.00%
         │
         ├─> spread = 12.50 - 10.00 = +2.50%
         │
         └─> Classificação: 🟢 Favorável para investir
             (spread > 2.0)

─────────────────────────────────────

Título: Tesouro IPCA+ 2045

Taxa de Investir: 5.50%
Taxa de Resgatar: 7.00%
         │
         ├─> spread = 5.50 - 7.00 = -1.50%
         │
         └─> Classificação: 🔴 Considere resgatar
             (spread < -1.0)
```

## 🎨 Fluxo 7: Colorização de Taxas

### Algoritmo

```
colorizeRate(currentRate, min, max)
         │
         ├─> range = max - min
         │
         ├─> distanceFromMax = (max - currentRate) / range
         │
         ├─> Aplica cor:
         │   │
         │   ├─> if (distanceFromMax < 0.1)
         │   │   └─> background: #16a34a (verde escuro)
         │   │       color: white
         │   │
         │   ├─> if (distanceFromMax < 0.25)
         │   │   └─> background: #86efac (verde claro)
         │   │       color: black
         │   │
         │   └─> else
         │       └─> Sem destaque
         │
         └─> Retorna estilo CSS
```

### Exemplo Visual

```
Histórico: min = 4.50, max = 7.20
Range = 7.20 - 4.50 = 2.70

Taxa atual = 7.10
distanceFromMax = (7.20 - 7.10) / 2.70 = 0.037 (3.7%)
→ < 10% → Verde escuro ✅

Taxa atual = 6.80
distanceFromMax = (7.20 - 6.80) / 2.70 = 0.148 (14.8%)
→ < 25% → Verde claro ✅

Taxa atual = 5.50
distanceFromMax = (7.20 - 5.50) / 2.70 = 0.630 (63%)
→ > 25% → Sem destaque
```

## 🔄 Fluxo 8: Atualização de Dados

### Ciclo Completo

```
┌─────────────────────────────────────────┐
│ Início do Dia                           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 1. Tesouro Transparente atualiza CSV    │
│    (madrugada)                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Desenvolvedor executa:               │
│    $ node downloadTesouro.js            │
│    (ou cron job automático)             │
└──────────────┬──────────────────────────┘
               │
               ├─> Baixa PrecoTaxaTesouroDireto.csv
               ├─> Scraping rendimento_investir.csv
               └─> Scraping rendimento_resgatar.csv
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Bot Telegram usa dados atualizados   │
│    (próxima consulta)                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. Interface Web recarrega CSVs        │
│    (próximo acesso)                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. Alerta automático às 11:30           │
│    (se dia útil)                        │
└─────────────────────────────────────────┘
```

## 🔍 Fluxo 9: Tratamento de Erros

### Bot Telegram

```
Erro na API Tesouro Direto
         │
         ├─> try/catch
         │   └─> console.error(error.message)
         │   └─> ctx.reply("Ocorreu um erro...")
         │
         └─> Bot continua funcionando
```

### Interface Web

```
Erro ao carregar CSV
         │
         ├─> Papa.parse error callback
         │   └─> console.error("Erro ao carregar:", error)
         │   └─> Exibe mensagem na tela
         │
         └─> Tenta carregar próximo arquivo
```

### Download de Dados

```
Erro no scraping (Investidor10)
         │
         ├─> try/catch
         │   └─> console.error("Erro ao buscar dados:", error.message)
         │
         └─> Continua com próximo download
             (não interrompe processo completo)
```

---

**Última Atualização**: Janeiro 2025
