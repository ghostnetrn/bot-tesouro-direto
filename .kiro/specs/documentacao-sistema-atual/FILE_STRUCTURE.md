# Estrutura de Arquivos do Projeto

## 📁 Visão Geral

```
bot-tesouro-direto/
├── 📄 Arquivos de Configuração
├── 🤖 Backend (Node.js)
├── 🌐 Frontend (HTML/CSS/JS)
├── 📊 Dados (CSV)
├── 🐳 Docker
└── 📚 Documentação
```

## 📂 Estrutura Completa

```
bot-tesouro-direto/
│
├── 📄 CONFIGURAÇÃO
│   ├── package.json              # Dependências e scripts npm
│   ├── package-lock.json         # Lock de versões
│   ├── .env.example              # Template de variáveis de ambiente
│   ├── .gitignore                # Arquivos ignorados pelo Git
│   └── .gitattributes            # Configurações Git
│
├── 🤖 BACKEND (Node.js)
│   ├── index.js                  # Entry point (inicia bot)
│   ├── telegram.js               # Lógica do bot Telegram
│   ├── apiTesouro.js             # Wrapper API + estatísticas
│   ├── downloadTesouro.js        # Orquestrador de downloads
│   ├── downloadTaxasInvestir.js  # Scraping taxas de compra
│   └── downloadTaxasResgatar.js  # Scraping taxas de venda
│
├── 🌐 FRONTEND (Web)
│   ├── index.html                # Página principal
│   ├── style.css                 # Estilos globais (legado)
│   │
│   ├── css/
│   │   ├── modern.css            # Estilos modernos principais
│   │   ├── responsive-table.css  # Estilos de tabelas responsivas
│   │   └── mobile-menu-fix.css   # Correções menu mobile
│   │
│   ├── js/
│   │   ├── app-colorized.js      # Lógica principal + colorização
│   │   ├── redemption-tabs.js    # Gerenciamento de abas
│   │   ├── responsive-table.js   # Comportamento tabelas mobile
│   │   └── progress-fix.js       # Correção barra de progresso
│   │
│   └── 🎨 Assets
│       ├── logo-analise-td.svg   # Logo principal
│       └── td-logo.svg           # Logo alternativo
│
├── 📊 DADOS (CSV)
│   ├── PrecoTaxaTesouroDireto.csv     # Histórico completo oficial
│   ├── PrecoTaxaTesouroDiretobkp.csv  # Backup
│   ├── rendimento_investir.csv        # Taxas atuais de compra
│   └── rendimento_resgatar.csv        # Taxas atuais de venda
│
├── 🐳 DOCKER
│   ├── Dockerfile                # Imagem Docker
│   ├── docker-compose.yml        # Orquestração
│   └── .dockerignore             # Arquivos ignorados no build
│
├── 📚 DOCUMENTAÇÃO
│   ├── README.md                 # Documentação principal do projeto
│   ├── LICENSE                   # Licença do projeto
│   │
│   └── docs/
│       ├── FUNCIONALIDADE_RESGATE.md  # Doc funcionalidade resgate
│       └── teste-funcionalidade.html  # Página de testes
│
├── ⚙️ CI/CD
│   └── .github/
│       └── workflows/
│           └── main.yml          # GitHub Actions
│
└── 📋 SPEC (Kiro)
    └── .kiro/
        └── specs/
            └── documentacao-sistema-atual/
                ├── README.md           # Visão geral da spec
                ├── SUMMARY.md          # Sumário executivo
                ├── FILE_STRUCTURE.md   # Este arquivo
                ├── requirements.md     # Requisitos detalhados
                └── design.md           # Arquitetura técnica
```

## 📄 Descrição dos Arquivos Principais

### Backend (Node.js)

#### `index.js`

```javascript
// Entry point - apenas importa telegram.js
require("./telegram");
```

**Responsabilidade**: Iniciar o bot Telegram

#### `telegram.js` (500+ linhas)

**Responsabilidade**: Lógica completa do bot Telegram

- Comandos (`/start`, teclados)
- Handlers de botões inline
- Classificação de títulos (J1-J4)
- Sistema de alertas automáticos
- Formatação de mensagens

**Principais Funções**:

- `verificarRentabilidade()` - Alertas automáticos
- `bot.action('all')` - Lista todos os títulos
- `bot.action('titulosBons')` - Filtra J3 e J4
- `bot.action(/maxInvestment_(\d+)/)` - Filtra por rentabilidade

#### `apiTesouro.js` (300+ linhas)

**Responsabilidade**: Wrapper da API + análise estatística

- Consulta API oficial do Tesouro
- Leitura e parse de CSV histórico
- Cálculos estatísticos (quartis, média, desvio)
- Gerenciamento de cache

**Principais Funções**:

- `getTituloInfo(bondName)` - Dados atuais de um título
- `getTesouroInfo(tipoTitulo, vencimento)` - Estatísticas históricas
- `listarTitulosComInvestimentoMinimo()` - Lista títulos disponíveis
- `listarTitulosComRentabilidadeAlta(percentual)` - Filtra por taxa

#### `downloadTesouro.js` (200+ linhas)

**Responsabilidade**: Orquestrador de downloads

- Baixa CSV oficial do Tesouro Transparente
- Faz scraping do Investidor10 (investir e resgatar)
- Normaliza nomes de títulos
- Formata valores monetários

**Principais Funções**:

- `downloadArquivoCSV()` - Download genérico de CSV
- `fetchTesouroInvestir()` - Scraping taxas de compra
- `fetchTesouroResgatar()` - Scraping taxas de venda
- `formatarTitulo()` - Normalização de nomes

#### `downloadTaxasInvestir.js` (100+ linhas)

**Responsabilidade**: Scraping específico de taxas de compra

- Acessa Investidor10
- Extrai dados da tabela HTML
- Normaliza títulos
- Gera CSV formatado

#### `downloadTaxasResgatar.js` (Similar ao investir)

**Responsabilidade**: Scraping específico de taxas de venda

### Frontend (Web)

#### `index.html` (500+ linhas)

**Responsabilidade**: Estrutura da interface web

- Header com navegação
- Dashboard (3 cards informativos)
- 3 abas (Investir, Resgatar, Comparação)
- Tabelas DataTables
- Footer com links e disclaimer

**Seções**:

- `<header>` - Logo, menu, filtro de data, tema
- `<main>` - Dashboard + tabelas com abas
- `<footer>` - Links úteis, aviso legal

#### `css/modern.css` (800+ linhas)

**Responsabilidade**: Estilos principais

- Variáveis CSS (cores, tema claro/escuro)
- Layout responsivo
- Componentes (cards, botões, badges)
- Animações e transições

**Principais Classes**:

- `.header`, `.nav` - Navegação
- `.dashboard`, `.card` - Dashboard
- `.table-container`, `.tab-button` - Tabelas e abas
- `.status-*` - Badges de janelas (J1-J4)
- `.recommendation-*` - Badges de recomendação

#### `css/responsive-table.css` (200+ linhas)

**Responsabilidade**: Tabelas responsivas

- Scroll horizontal em mobile
- Priorização de colunas
- Hint visual de scroll

#### `css/mobile-menu-fix.css` (100+ linhas)

**Responsabilidade**: Correções menu mobile

- Menu hambúrguer
- Overlay
- Animações de abertura/fechamento

#### `js/app-colorized.js` (1000+ linhas)

**Responsabilidade**: Lógica principal da aplicação

- Carregamento de dados (CSV)
- Cálculos estatísticos
- Classificação de janelas
- Colorização de taxas
- Cálculo de spread
- Renderização de tabelas
- Dashboard dinâmico
- Filtro de período

**Principais Funções**:

- `loadData()` - Carrega todos os CSVs
- `calculateStatistics()` - Calcula quartis
- `classifyWindow()` - Classifica J1-J4
- `calculateSpread()` - Calcula spread investir/resgatar
- `renderDashboard()` - Atualiza cards do dashboard
- `initializeTables()` - Inicializa DataTables

#### `js/redemption-tabs.js` (100+ linhas)

**Responsabilidade**: Gerenciamento de abas

- Alternância entre abas
- Atualização de conteúdo
- Estado ativo

#### `js/responsive-table.js` (50+ linhas)

**Responsabilidade**: Comportamento mobile

- Detecção de scroll
- Hint de scroll horizontal

#### `js/progress-fix.js` (30+ linhas)

**Responsabilidade**: Correção barra de progresso

- Animação suave
- Ocultação após carregamento

### Dados (CSV)

#### `PrecoTaxaTesouroDireto.csv`

**Fonte**: Tesouro Transparente (oficial)
**Conteúdo**: Histórico completo de taxas desde o início do programa
**Colunas**:

- Tipo Titulo
- Data Vencimento
- Data Base
- Taxa Compra Manha
- Taxa Venda Manha
- PU Compra Manha
- PU Venda Manha

**Tamanho**: ~50MB (milhares de linhas)
**Atualização**: Diária (via download)

#### `rendimento_investir.csv`

**Fonte**: Investidor10 (scraping)
**Conteúdo**: Taxas atuais de compra
**Colunas**:

- Título
- Rendimento anual do título
- Investimento mínimo
- Preço unitário de investimento
- Vencimento do Título

**Tamanho**: ~2KB (10-20 linhas)
**Atualização**: Manual (via script)

#### `rendimento_resgatar.csv`

**Fonte**: Investidor10 (scraping)
**Conteúdo**: Taxas atuais de venda
**Colunas**:

- Título
- Rendimento anual do título
- Preço unitário de resgate
- Vencimento do Título

**Tamanho**: ~2KB (10-20 linhas)
**Atualização**: Manual (via script)

### Docker

#### `Dockerfile`

```dockerfile
FROM node:20
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
```

#### `docker-compose.yml`

```yaml
services:
  tesourodireto:
    build: .
    volumes:
      - .:/usr/app
    env_file: .env
    restart: unless-stopped
```

### Configuração

#### `package.json`

**Dependências Principais**:

- axios (HTTP client)
- cheerio (web scraping)
- telegraf (bot Telegram)
- simple-statistics (cálculos)
- papaparse (CSV)

**Scripts**:

- `npm start` → `node index.js`

#### `.env.example`

```bash
TELEGRAM_BOT_TOKEN=
CHAT_ID=
URL_API=
URL_FILE_TESOURO=
ALERTA_RENTABILIDADE=13
ALERTA_PERIODO_MINUTOS=720
```

## 📊 Tamanho dos Arquivos

| Tipo                  | Quantidade   | Tamanho Total |
| --------------------- | ------------ | ------------- |
| JavaScript (Backend)  | 6 arquivos   | ~50KB         |
| JavaScript (Frontend) | 4 arquivos   | ~80KB         |
| HTML                  | 1 arquivo    | ~30KB         |
| CSS                   | 3 arquivos   | ~60KB         |
| CSV (dados)           | 4 arquivos   | ~50MB         |
| Documentação          | 10+ arquivos | ~200KB        |

## 🔄 Fluxo de Arquivos

### Execução do Bot

```
npm start
  ↓
index.js
  ↓
telegram.js
  ↓
apiTesouro.js → PrecoTaxaTesouroDireto.csv
```

### Download de Dados

```
node downloadTesouro.js
  ↓
downloadArquivoCSV() → PrecoTaxaTesouroDireto.csv
fetchTesouroInvestir() → rendimento_investir.csv
fetchTesouroResgatar() → rendimento_resgatar.csv
```

### Interface Web

```
Abrir index.html
  ↓
Carrega CSS (modern.css, responsive-table.css, mobile-menu-fix.css)
  ↓
Carrega JS (app-colorized.js, redemption-tabs.js, responsive-table.js)
  ↓
app-colorized.js carrega CSVs:
  - rendimento_investir.csv
  - rendimento_resgatar.csv
  - PrecoTaxaTesouroDireto.csv
  ↓
Renderiza tabelas e dashboard
```

## 🎯 Arquivos Críticos

**Não podem ser perdidos**:

- ✅ `PrecoTaxaTesouroDireto.csv` - Histórico completo (pode ser re-baixado)
- ⚠️ `.env` - Credenciais (não commitado, usar .env.example)

**Podem ser regenerados**:

- `rendimento_investir.csv` - Via `downloadTesouro.js`
- `rendimento_resgatar.csv` - Via `downloadTesouro.js`
- `node_modules/` - Via `npm install`

## 📝 Convenções de Nomenclatura

- **Backend**: camelCase (`getTituloInfo`, `listarTitulos`)
- **Frontend**: kebab-case para arquivos (`app-colorized.js`, `modern.css`)
- **CSS Classes**: kebab-case (`.table-container`, `.nav-link`)
- **Variáveis CSS**: kebab-case (`--color-primary`, `--font-size-base`)
- **CSV**: snake_case para colunas (`Taxa Compra Manha`, `Tipo Titulo`)

---

**Última Atualização**: Janeiro 2025
