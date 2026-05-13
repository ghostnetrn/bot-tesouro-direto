# Sumário Executivo - Bot Tesouro Direto

## 🎯 O Que É

Sistema completo de análise e monitoramento de títulos do Tesouro Direto brasileiro com:

- **Bot Telegram** para consultas interativas
- **Interface Web** com dashboard e análises visuais
- **Sistema de Coleta** que baixa e processa dados de múltiplas fontes

## 🏗️ Componentes

### 1. Coleta de Dados

- `downloadTesouro.js` - Orquestrador principal
- `apiTesouro.js` - Wrapper da API + análise estatística
- Fontes: API oficial, CSV histórico, scraping Investidor10

### 2. Bot Telegram

- `telegram.js` - Interface conversacional
- Comandos: listar títulos, filtrar por rentabilidade, alertas automáticos
- Framework: Telegraf v4.11.2

### 3. Interface Web

- `index.html` - Dashboard responsivo
- 3 abas: Investir, Resgatar, Comparação
- Tecnologias: DataTables, jQuery, PapaParse

## 📊 Estratégia de Investimento

Baseada em **análise de quartis estatísticos**:

- **J1** (😡): Taxa entre mínimo e Q1 → COMPRA PÉSSIMA
- **J2** (😒): Taxa entre Q1 e mediana → COMPRA RUIM
- **J3** (😗): Taxa entre mediana e Q3 → **COMPRA BOA** ✅
- **J4** (😀): Taxa entre Q3 e máximo → **COMPRA ÓTIMA** ✅

**Premissa**: Taxas próximas ao máximo histórico = bom momento para comprar

## 🔄 Fluxo Principal

```
Fontes de Dados → Coleta/Processamento → CSV Local → Bot/Web
```

## 📁 Arquivos Principais

| Arquivo              | Responsabilidade           |
| -------------------- | -------------------------- |
| `index.js`           | Entry point (inicia bot)   |
| `telegram.js`        | Lógica do bot Telegram     |
| `apiTesouro.js`      | API wrapper + estatísticas |
| `downloadTesouro.js` | Download de dados          |
| `index.html`         | Interface web              |
| `app-colorized.js`   | Lógica do dashboard        |

## 🗂️ Dados Armazenados

- `PrecoTaxaTesouroDireto.csv` - Histórico completo oficial
- `rendimento_investir.csv` - Taxas atuais de compra
- `rendimento_resgatar.csv` - Taxas atuais de venda

## ⚙️ Configuração Essencial

```bash
TELEGRAM_BOT_TOKEN=<token>
CHAT_ID=<id>
ALERTA_RENTABILIDADE=13
ALERTA_PERIODO_MINUTOS=720
```

## 🚀 Execução

```bash
npm install
npm start              # Bot Telegram
# ou
docker-compose up -d   # Container
```

## 📈 Funcionalidades Principais

### Bot Telegram

- Consulta de títulos específicos
- Filtros por rentabilidade
- Alertas automáticos (11:30, dias úteis)
- Classificação em janelas J1-J4

### Interface Web

- Dashboard com melhores oportunidades
- Tabelas interativas com ordenação/busca
- Comparação de spread (investir vs resgatar)
- Filtro por período histórico
- Tema claro/escuro

## ⚠️ Limitações

1. Scraping frágil (Investidor10)
2. Sem banco de dados (apenas CSV)
3. API não oficial pode mudar
4. Sem autenticação na web
5. Sem testes automatizados

## 📚 Documentação Completa

- **README.md** - Visão geral e guia de uso
- **requirements.md** - Requisitos funcionais (RF01-RF14) e não funcionais (RNF01-RNF05)
- **design.md** - Arquitetura detalhada, componentes, fluxos de dados

## 🔗 Links Importantes

- [Tesouro Direto](https://www.tesourodireto.com.br/)
- [Tesouro Transparente](https://www.tesourotransparente.gov.br/)
- [GitHub do Projeto](https://github.com/ghostnetrn/bot-tesouro-direto)
- [Estratégia (YouTube)](https://www.youtube.com/watch?v=VqcGwlY3Jz4)

---

**Versão**: 2.2.0 | **Data**: Janeiro 2025
