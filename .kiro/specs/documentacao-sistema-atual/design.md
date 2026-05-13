# Design: Sistema Bot Tesouro Direto

## Visão Geral

O Bot Tesouro Direto é um sistema completo de análise e monitoramento de títulos do Tesouro Direto brasileiro, composto por três componentes principais:

1. **Bot Telegram** - Interface conversacional para consultas
2. **Interface Web** - Dashboard com análises visuais e comparações
3. **Sistema de Coleta de Dados** - Scripts para download e processamento de dados

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FONTES DE DADOS                          │
├─────────────────────────────────────────────────────────────┤
│ • API Tesouro Direto (JSON)                                 │
│ • Tesouro Transparente (CSV histórico)                      │
│ • Investidor10 (Scraping - taxas investir/resgatar)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CAMADA DE COLETA E PROCESSAMENTO               │
├─────────────────────────────────────────────────────────────┤
│ • downloadTesouro.js - Orquestrador principal               │
│ • downloadTaxasInvestir.js - Scraping taxas de compra      │
│ • downloadTaxasResgatar.js - Scraping taxas de venda       │
│ • apiTesouro.js - Wrapper da API + análise estatística     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   ARMAZENAMENTO LOCAL                        │
├─────────────────────────────────────────────────────────────┤
│ • PrecoTaxaTesouroDireto.csv - Histórico completo          │
│ • rendimento_investir.csv - Taxas atuais de compra         │
│ • rendimento_resgatar.csv - Taxas atuais de venda          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────┬──────────────────────────────────────┐
│   BOT TELEGRAM       │      INTERFACE WEB                   │
├──────────────────────┼──────────────────────────────────────┤
│ • telegram.js        │ • index.html                         │
│ • Comandos           │ • app-colorized.js                   │
│ • Teclados inline    │ • redemption-tabs.js                 │
│ • Alertas agendados  │ • DataTables                         │
└──────────────────────┴──────────────────────────────────────┘
```

## Componentes Detalhados

### 1. Sistema de Coleta de Dados

#### 1.1 downloadTesouro.js

**Responsabilidade**: Orquestrador principal que baixa dados de todas as fontes

**Fontes de Dados**:

- **Tesouro Transparente**: CSV histórico oficial com todas as taxas desde o início
- **Investidor10**: Scraping de taxas atuais (investir e resgatar)

**Fluxo de Execução**:

```javascript
1. downloadArquivoCSV() → Baixa PrecoTaxaTesouroDireto.csv
2. fetchTesouroInvestir() → Scraping de taxas de compra
3. fetchTesouroResgatar() → Scraping de taxas de venda
```

**Normalização de Títulos**:

- Converte nomes do Investidor10 para padrão oficial
- Exemplos:
  - "Selic 2029" → "Tesouro Selic 2029"
  - "Prefixado com Juros Semestrais 2035" → "Tesouro Prefixado com Juros Semestrais 2035"
  - "IPCA+ 2045" → "Tesouro IPCA+ 2045"

#### 1.2 apiTesouro.js

**Responsabilidade**: Wrapper da API oficial + análise estatística

**Funções Principais**:

```javascript
// Consulta API oficial do Tesouro Direto
getTituloInfo(bondName)
  → Retorna: título, investimentoMinimo, precoUnitario, vencimento, rentabilidadeAnual

// Lista títulos disponíveis
listarTitulosComInvestimentoMinimo()
  → Retorna: array de nomes de títulos com investimento > 0

listarTitulosComRentabilidadeAlta(percentual)
  → Retorna: títulos com rentabilidade > percentual especificado

// Análise estatística histórica
getTesouroInfo(tipoTitulo, vencimentoTitulo)
  → Lê PrecoTaxaTesouroDireto.csv
  → Calcula: min, q1, median, q3, max, mean, stdev
  → Usa biblioteca: simple-statistics
```

**Gerenciamento de Cache**:

- Verifica se arquivo CSV local existe
- Compara data de modificação com servidor
- Baixa apenas se desatualizado

### 2. Bot Telegram

#### 2.1 Estrutura (telegram.js)

**Framework**: Telegraf v4.11.2

**Comandos Disponíveis**:

| Comando       | Descrição                             |
| ------------- | ------------------------------------- |
| `/start`      | Inicializa bot e exibe menu principal |
| `🧾 Teclado`  | Exibe teclado inline com opções       |
| `📈 Gráficos` | Links para gráficos externos          |

**Teclado Inline**:

```
┌─────────────────────────────────────────┐
│ 📇 Listar todos os títulos              │
├─────────────────────────────────────────┤
│ 📊 Listar títulos com maior percentual  │
├─────────────────────────────────────────┤
│ ✅ Listar títulos bons pra comprar      │
└─────────────────────────────────────────┘
```

#### 2.2 Lógica de Análise de Títulos

**Classificação por Quartis**:

```javascript
if (taxa < q1 && taxa > min)
  → 😡 J1 - COMPRA PÉSSIMA (entre mínimo e 1º quartil)

else if (taxa <= median && taxa > q1)
  → 😒 J2 - COMPRA RUIM (entre 1º quartil e mediana)

else if (taxa <= q3 && taxa > median)
  → 😗 J3 - COMPRA BOA (entre mediana e 3º quartil)

else if (taxa <= max && taxa > q3)
  → 😀 J4 - COMPRA ÓTIMA (entre 3º quartil e máximo)
```

**Filtros Aplicados**:

- Exclui Tesouro Selic (não segue a estratégia)
- Exclui títulos com dados zerados
- Exclui "Educa+" e "semestrais" em alguns fluxos

#### 2.3 Sistema de Alertas Automáticos

**Configuração via .env**:

```
ALERTA_RENTABILIDADE=13        # Taxa mínima para alertar
ALERTA_PERIODO_MINUTOS=720     # Intervalo de verificação (12h)
```

**Agendamento**:

- Verifica apenas em dias úteis (segunda a sexta)
- Horário fixo: 11:30 (horário de Brasília)
- Envia relatório com:
  - Títulos acima da rentabilidade configurada
  - Títulos em janela J3 ou J4 (boas oportunidades)

### 3. Interface Web

#### 3.1 Estrutura (index.html)

**Tecnologias**:

- DataTables (tabelas interativas)
- PapaParse (parsing CSV)
- Simple Statistics (cálculos estatísticos)
- Moment.js + DateRangePicker (filtros de data)

**Abas Principais**:

1. **Taxas para Investir**
   - Análise histórica completa
   - Quartis estatísticos
   - Janelas de compra (J1-J4)
   - Colorização por proximidade ao máximo

2. **Taxas para Resgatar**
   - Taxas atuais de resgate antecipado
   - Preço unitário de venda
   - Análise de spread vs investimento

3. **Comparação (Spread)**
   - Lado a lado: taxa investir vs resgatar
   - Cálculo de spread (diferença percentual)
   - Recomendações automáticas

#### 3.2 Dashboard (app-colorized.js)

**Cards Informativos**:

- **Última Atualização**: Data/hora da última coleta
- **Melhores Oportunidades**: Top 3 títulos em J4
- **Visão Geral do Mercado**: Estatísticas agregadas

**Filtro de Período**:

- Permite filtrar dados históricos por intervalo de datas
- Recalcula estatísticas dinamicamente
- Botão "Histórico completo" para resetar

#### 3.3 Lógica de Colorização

**Taxas de Investimento**:

```javascript
// Calcula distância da taxa atual até o máximo histórico
distanciaMax = (max - taxaAtual) / (max - min)

if (distanciaMax < 0.1)
  → Fundo verde escuro (muito próximo do máximo)
else if (distanciaMax < 0.25)
  → Fundo verde claro
else
  → Sem destaque
```

**Spread (Comparação)**:

```javascript
spread = taxaInvestir - taxaResgatar

if (spread > 2.0)
  → 🟢 Favorável para investir (verde)
else if (spread < -1.0)
  → 🔴 Considere resgatar (vermelho)
else
  → 🟡 Aguardar (amarelo)
```

### 4. Deployment

#### 4.1 Docker

**Arquivo**: docker-compose.yml

```yaml
services:
  tesourodireto:
    image: tesourodireto
    volumes:
      - .:/usr/app
    env_file: .env
    restart: unless-stopped
```

**Dockerfile**:

- Base: Node.js >= 20.0.0
- Instala dependências
- Executa `node index.js` (inicia bot Telegram)

#### 4.2 GitHub Actions

**Arquivo**: .github/workflows/main.yml

- CI/CD automatizado
- Deploy em push para branch principal

### 5. Variáveis de Ambiente

**Arquivo**: .env.example

```bash
# Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCDEFu
CHAT_ID=98765432111111

# API Tesouro Direto
URL_API=https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json
URL_FILE_TESOURO=https://www.tesourotransparente.gov.br/.../PrecoTaxaTesouroDireto.csv

# Alertas
ALERTA_RENTABILIDADE=13
ALERTA_PERIODO_MINUTOS=720
```

## Fluxos de Dados

### Fluxo 1: Consulta via Bot Telegram

```
Usuário → /start
  ↓
Bot exibe teclado inline
  ↓
Usuário clica "✅ Listar títulos bons pra comprar"
  ↓
Bot chama listarTitulosComInvestimentoMinimo()
  ↓
Para cada título:
  - getTituloInfo() → dados atuais da API
  - getTesouroInfo() → estatísticas históricas do CSV
  - Classifica em J1/J2/J3/J4
  ↓
Bot envia apenas títulos J3 e J4
```

### Fluxo 2: Visualização Web

```
Usuário acessa index.html
  ↓
JavaScript carrega:
  - rendimento_investir.csv
  - rendimento_resgatar.csv
  - PrecoTaxaTesouroDireto.csv
  ↓
Para cada título:
  - Calcula estatísticas (min, q1, median, q3, max)
  - Classifica janela de compra
  - Calcula spread (investir - resgatar)
  - Aplica colorização
  ↓
Renderiza tabelas com DataTables
```

### Fluxo 3: Alerta Automático

```
setInterval (a cada ALERTA_PERIODO_MINUTOS)
  ↓
Verifica se é dia útil e horário 11:30 BR
  ↓
Se sim:
  - verificarRentabilidade()
  - Lista títulos > ALERTA_RENTABILIDADE
  - Lista títulos em J3/J4
  - Envia mensagem no Telegram (CHAT_ID)
```

## Dependências Principais

### Backend (Node.js)

```json
{
  "axios": "^1.6.0", // HTTP client
  "cheerio": "^1.0.0-rc.12", // Web scraping
  "csv-parser": "^3.0.0", // Parse CSV
  "papaparse": "^5.4.0", // Parse/unparse CSV
  "simple-statistics": "^7.8.3", // Cálculos estatísticos
  "telegraf": "^4.11.2", // Bot Telegram
  "date-fns": "^2.29.3", // Manipulação de datas
  "dotenv": "^16.0.3" // Variáveis de ambiente
}
```

### Frontend (CDN)

- DataTables 1.13.2
- jQuery 3.5.1
- Moment.js 2.29.4
- DateRangePicker
- Font Awesome 6.4.2

## Estratégia de Investimento

**Base Teórica**: Análise de quartis estatísticos
**Fonte**: [Vídeo YouTube - Excelência no Bolso](https://www.youtube.com/watch?v=VqcGwlY3Jz4)

**Premissa**:

- Taxas próximas ao máximo histórico = bom momento para comprar
- Taxas próximas ao mínimo histórico = evitar compra

**Implementação**:

1. Coleta histórico completo de taxas (CSV oficial)
2. Calcula quartis (Q1, Q2/mediana, Q3)
3. Classifica taxa atual em relação aos quartis
4. Recomenda compra apenas em J3 (boa) ou J4 (ótima)

## Limitações e Considerações

### Limitações Técnicas

1. **Scraping do Investidor10**: Dependente da estrutura HTML do site
2. **API não oficial**: Endpoint JSON pode mudar sem aviso
3. **Sem banco de dados**: Dados armazenados em CSV locais
4. **Sem autenticação**: Interface web é pública

### Avisos Legais

- Sistema é apenas educacional
- Não constitui recomendação de investimento
- Usuário é responsável por suas decisões financeiras

## Melhorias Futuras Sugeridas

1. **Banco de Dados**: Migrar de CSV para PostgreSQL/MongoDB
2. **API Própria**: Backend REST para servir dados
3. **Autenticação**: Login para interface web
4. **Notificações Push**: Além do Telegram
5. **Backtesting**: Simular estratégia com dados históricos
6. **Mais Indicadores**: RSI, médias móveis, etc.
7. **Testes Automatizados**: Jest/Mocha para backend
8. **Monitoramento**: Logs estruturados, métricas

## Referências

- [Tesouro Direto Oficial](https://www.tesourodireto.com.br/)
- [Tesouro Transparente - Dados Abertos](https://www.tesourotransparente.gov.br/)
- [Investidor10 - Tesouro Direto](https://investidor10.com.br/tesouro-direto/)
- [Telegraf Documentation](https://telegraf.js.org/)
- [Simple Statistics](https://simplestatistics.org/)
