# Spec: Documentação do Sistema Atual - Bot Tesouro Direto

## 📋 Visão Geral

Esta spec documenta o estado atual do sistema **Bot Tesouro Direto**, um sistema completo de análise e monitoramento de títulos do Tesouro Direto brasileiro.

**Objetivo**: Fornecer documentação técnica completa para facilitar:

- Onboarding de novos desenvolvedores
- Manutenção e evolução do código
- Compreensão da arquitetura e fluxos de dados
- Base para futuras melhorias

## 🎯 Escopo

Esta spec **documenta o sistema existente**, não propõe novas funcionalidades.

### Incluído ✅

- Arquitetura completa do sistema
- Componentes e suas responsabilidades
- Fluxos de dados entre componentes
- Lógica de negócio (análise de títulos)
- Integrações com APIs externas
- Interface de usuário (bot Telegram + web)
- Configuração e deployment

### Não Incluído ❌

- Novas funcionalidades
- Refatorações de código
- Correções de bugs
- Melhorias de performance

## 📁 Estrutura da Spec

```
.kiro/specs/documentacao-sistema-atual/
├── README.md              ← Você está aqui (visão geral)
├── SUMMARY.md             ← Sumário executivo (leitura rápida)
├── QUICK_REFERENCE.md     ← Guia rápido de referência
├── FILE_STRUCTURE.md      ← Estrutura de arquivos do projeto
├── FLOWS.md               ← Fluxos de dados e processos
├── requirements.md        ← Requisitos funcionais e não funcionais
└── design.md              ← Arquitetura e design técnico detalhado
```

### 📖 Guia de Leitura

**Para começar rapidamente**:

1. 📄 [SUMMARY.md](SUMMARY.md) - Visão geral em 5 minutos
2. 🚀 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Comandos e referências

**Para entender o sistema**: 3. 📋 [requirements.md](requirements.md) - O que o sistema faz (RF01-RF14) 4. 🏗️ [design.md](design.md) - Como o sistema funciona (arquitetura) 5. 🔄 [FLOWS.md](FLOWS.md) - Fluxos de dados detalhados

**Para navegar o código**: 6. 📁 [FILE_STRUCTURE.md](FILE_STRUCTURE.md) - Onde está cada coisa

### 📖 Guia de Leitura

**Para começar rapidamente**:

1. 📄 [SUMMARY.md](SUMMARY.md) - Visão geral em 5 minutos
2. 🚀 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Comandos e referências

**Para entender o sistema**: 3. 📋 [requirements.md](requirements.md) - O que o sistema faz (RF01-RF14) 4. 🏗️ [design.md](design.md) - Como o sistema funciona (arquitetura)

**Para navegar o código**: 5. 📁 [FILE_STRUCTURE.md](FILE_STRUCTURE.md) - Onde está cada coisa

## 🏗️ Arquitetura do Sistema

O sistema é composto por **3 componentes principais**:

### 1. 🤖 Bot Telegram

- Interface conversacional para consultas
- Comandos interativos com teclados inline
- Alertas automáticos programados
- Framework: Telegraf v4.11.2

### 2. 🌐 Interface Web

- Dashboard com análises visuais
- 3 abas: Investir, Resgatar, Comparação
- Tabelas interativas (DataTables)
- Tema claro/escuro
- Responsivo (mobile-friendly)

### 3. 📊 Sistema de Coleta de Dados

- Download de CSV histórico (Tesouro Transparente)
- Scraping de taxas atuais (Investidor10)
- Consulta à API oficial (Tesouro Direto)
- Análise estatística (quartis, média, desvio padrão)

## 🔄 Fluxo de Dados Simplificado

```
┌─────────────────────────────────────────┐
│         FONTES DE DADOS                 │
│  • API Tesouro Direto (JSON)            │
│  • Tesouro Transparente (CSV histórico) │
│  • Investidor10 (Scraping)              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      COLETA E PROCESSAMENTO             │
│  • downloadTesouro.js                   │
│  • apiTesouro.js                        │
│  • Análise estatística (quartis)        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      ARMAZENAMENTO LOCAL (CSV)          │
│  • PrecoTaxaTesouroDireto.csv           │
│  • rendimento_investir.csv              │
│  • rendimento_resgatar.csv              │
└─────────────────────────────────────────┘
                  ↓
┌──────────────────┬──────────────────────┐
│  BOT TELEGRAM    │   INTERFACE WEB      │
│  • Comandos      │   • Dashboard        │
│  • Consultas     │   • Tabelas          │
│  • Alertas       │   • Comparações      │
└──────────────────┴──────────────────────┘
```

## 🎓 Estratégia de Investimento

O sistema implementa uma estratégia baseada em **análise de quartis estatísticos**:

### Classificação de Janelas de Compra

| Janela | Condição            | Emoji | Recomendação    |
| ------ | ------------------- | ----- | --------------- |
| **J1** | min < taxa ≤ Q1     | 😡    | COMPRA PÉSSIMA  |
| **J2** | Q1 < taxa ≤ mediana | 😒    | COMPRA RUIM     |
| **J3** | mediana < taxa ≤ Q3 | 😗    | COMPRA BOA ✅   |
| **J4** | Q3 < taxa ≤ max     | 😀    | COMPRA ÓTIMA ✅ |

**Premissa**: Taxas próximas ao máximo histórico indicam bom momento para comprar.

**Fonte**: [Vídeo YouTube - Excelência no Bolso](https://www.youtube.com/watch?v=VqcGwlY3Jz4)

## 🚀 Funcionalidades Principais

### Bot Telegram

#### Comandos

- `/start` - Inicializa bot e exibe menu
- `🧾 Teclado` - Exibe opções interativas
- `📈 Gráficos` - Links para gráficos externos

#### Consultas

- 📇 Listar todos os títulos
- 📊 Filtrar por rentabilidade (>3%, >6%, >10%)
- ✅ Listar apenas títulos bons para comprar (J3 e J4)

#### Alertas Automáticos

- Horário: 11:30 (horário de Brasília)
- Dias: Segunda a sexta (dias úteis)
- Conteúdo:
  - Títulos acima da rentabilidade configurada
  - Títulos em janela J3 ou J4

### Interface Web

#### Dashboard

- **Última Atualização**: Data/hora da coleta
- **Melhores Oportunidades**: Top 3 títulos em J4
- **Visão Geral do Mercado**: Estatísticas agregadas

#### Abas de Análise

1. **📈 Taxas para Investir**
   - Análise histórica completa
   - Quartis estatísticos
   - Janelas de compra (J1-J4)
   - Colorização por proximidade ao máximo

2. **📉 Taxas para Resgatar**
   - Taxas atuais de resgate antecipado
   - Preço unitário de venda
   - Análise de spread vs investimento

3. **⚖️ Comparação (Spread)**
   - Lado a lado: taxa investir vs resgatar
   - Cálculo de spread (diferença percentual)
   - Recomendações automáticas:
     - 🟢 Favorável para investir (spread > 2%)
     - 🟡 Aguardar (spread neutro)
     - 🔴 Considere resgatar (spread < -1%)

#### Recursos

- Filtro por período (date range)
- Ordenação por qualquer coluna
- Busca/filtro de texto
- Tema claro/escuro
- Responsivo (mobile)

## 🛠️ Tecnologias Utilizadas

### Backend (Node.js)

```json
{
  "axios": "^1.6.0", // HTTP client
  "cheerio": "^1.0.0-rc.12", // Web scraping
  "telegraf": "^4.11.2", // Bot Telegram
  "simple-statistics": "^7.8.3", // Cálculos estatísticos
  "papaparse": "^5.4.0", // Parse CSV
  "date-fns": "^2.29.3" // Manipulação de datas
}
```

### Frontend

- DataTables 1.13.2 (tabelas interativas)
- jQuery 3.5.1
- Moment.js 2.29.4
- DateRangePicker
- Font Awesome 6.4.2

### Infraestrutura

- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Node.js >= 20.0.0

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```bash
# Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCDEFu
CHAT_ID=98765432111111

# APIs
URL_API=https://www.tesourodireto.com.br/json/.../treasurybondsinfo.json
URL_FILE_TESOURO=https://www.tesourotransparente.gov.br/.../PrecoTaxaTesouroDireto.csv

# Alertas
ALERTA_RENTABILIDADE=13        # Taxa mínima para alertar (%)
ALERTA_PERIODO_MINUTOS=720     # Intervalo de verificação (12h)
```

### Comandos

```bash
# Instalação
npm install

# Execução local
npm start

# Docker
docker-compose up -d

# Download manual de dados
node downloadTesouro.js
```

## 📊 Fontes de Dados

| Fonte                                                                                                                       | Tipo | Dados                   | Atualização |
| --------------------------------------------------------------------------------------------------------------------------- | ---- | ----------------------- | ----------- |
| [API Tesouro Direto](https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json)      | JSON | Preços e taxas atuais   | Tempo real  |
| [Tesouro Transparente](https://www.tesourotransparente.gov.br/ckan/dataset/taxas-dos-titulos-ofertados-pelo-tesouro-direto) | CSV  | Histórico completo      | Diária      |
| [Investidor10](https://investidor10.com.br/tesouro-direto/)                                                                 | HTML | Taxas investir/resgatar | Tempo real  |

## 📈 Métricas e Estatísticas

O sistema calcula as seguintes métricas para cada título:

- **Mínimo**: Menor taxa histórica
- **Q1 (1º Quartil)**: 25% dos dados estão abaixo
- **Mediana (Q2)**: 50% dos dados estão abaixo
- **Q3 (3º Quartil)**: 75% dos dados estão abaixo
- **Máximo**: Maior taxa histórica
- **Média**: Média aritmética das taxas
- **Desvio Padrão**: Medida de dispersão dos dados

**Biblioteca**: [simple-statistics](https://simplestatistics.org/)

## ⚠️ Limitações Conhecidas

1. **Scraping Frágil**: Dependente da estrutura HTML do Investidor10
2. **Sem Banco de Dados**: Dados armazenados em CSV locais
3. **API Não Oficial**: Endpoint JSON pode mudar sem aviso
4. **Sem Autenticação**: Interface web é pública
5. **Sem Testes Automatizados**: Apenas testes manuais
6. **Horário Fixo**: Alertas às 11:30 (hardcoded)
7. **Fuso Horário**: Ajuste manual para Brasília (UTC-3)

## 🔮 Melhorias Futuras Sugeridas

1. **Banco de Dados**: Migrar de CSV para PostgreSQL/MongoDB
2. **API Própria**: Backend REST para servir dados
3. **Autenticação**: Login para interface web
4. **Notificações Push**: Além do Telegram
5. **Backtesting**: Simular estratégia com dados históricos
6. **Mais Indicadores**: RSI, médias móveis, Bollinger Bands
7. **Testes Automatizados**: Jest/Mocha para backend
8. **Monitoramento**: Logs estruturados, métricas, alertas

## 📚 Documentos da Spec

### [requirements.md](requirements.md)

Requisitos funcionais e não funcionais detalhados:

- RF01-RF14: Requisitos funcionais
- RNF01-RNF05: Requisitos não funcionais
- Dependências externas
- Configuração e deployment
- Limitações conhecidas

### [design.md](design.md)

Arquitetura e design técnico:

- Arquitetura do sistema
- Componentes detalhados
- Fluxos de dados
- Lógica de negócio
- Estratégia de investimento
- Referências técnicas

## ⚖️ Aviso Legal

⚠️ **IMPORTANTE**: Este sistema é apenas uma ferramenta educacional e **não constitui recomendação de investimento**. As informações apresentadas são baseadas em dados históricos e não garantem resultados futuros. O criador não se responsabiliza por perdas financeiras decorrentes do uso deste código. Sempre consulte um profissional qualificado antes de tomar decisões de investimento.

## 🔗 Links Úteis

- [Tesouro Direto Oficial](https://www.tesourodireto.com.br/)
- [Calculadora Tesouro](https://www.tesourodireto.com.br/titulos/calculadora.htm)
- [Preços e Taxas](https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm)
- [Tesouro Transparente - Dados Abertos](https://www.tesourotransparente.gov.br/)
- [GitHub do Projeto](https://github.com/ghostnetrn/bot-tesouro-direto)
- [Estratégia Utilizada (YouTube)](https://www.youtube.com/watch?v=VqcGwlY3Jz4)

## 📝 Versão

- **Versão do Sistema**: 2.2.0
- **Data da Documentação**: Janeiro 2025
- **Autor da Spec**: Kiro AI Assistant

---

**Próximos Passos**: Use esta documentação como base para:

1. Onboarding de novos desenvolvedores
2. Planejamento de novas features
3. Refatorações e melhorias
4. Troubleshooting e debugging
