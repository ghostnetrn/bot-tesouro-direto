# Guia Rápido de Referência

## 🚀 Início Rápido

### Instalação

```bash
git clone https://github.com/ghostnetrn/bot-tesouro-direto.git
cd bot-tesouro-direto
npm install
cp .env.example .env
# Editar .env com suas credenciais
npm start
```

### Docker

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## 📋 Comandos Úteis

### NPM

```bash
npm start              # Inicia bot Telegram
npm install            # Instala dependências
npm update             # Atualiza dependências
```

### Scripts Manuais

```bash
node downloadTesouro.js           # Baixa todos os dados
node downloadTaxasInvestir.js     # Apenas taxas de compra
node downloadTaxasResgatar.js     # Apenas taxas de venda
```

### Docker

```bash
docker-compose up -d              # Inicia em background
docker-compose down               # Para containers
docker-compose restart            # Reinicia
docker-compose logs -f            # Logs em tempo real
docker-compose ps                 # Status dos containers
```

## 🔑 Variáveis de Ambiente

```bash
# Obrigatórias
TELEGRAM_BOT_TOKEN=<token>        # Do @BotFather
CHAT_ID=<id>                      # Do @userinfobot

# URLs (já configuradas)
URL_API=https://www.tesourodireto.com.br/json/.../treasurybondsinfo.json
URL_FILE_TESOURO=https://www.tesourotransparente.gov.br/.../PrecoTaxaTesouroDireto.csv

# Alertas (opcionais)
ALERTA_RENTABILIDADE=13           # Taxa mínima (%)
ALERTA_PERIODO_MINUTOS=720        # Intervalo (12h)
```

## 🤖 Comandos do Bot Telegram

| Comando       | Descrição                   |
| ------------- | --------------------------- |
| `/start`      | Inicializa bot e exibe menu |
| `🧾 Teclado`  | Exibe teclado inline        |
| `📈 Gráficos` | Links para gráficos         |

### Teclado Inline

- **📇 Listar todos os títulos** → Lista completa
- **📊 Listar títulos com maior percentual** → Filtra por rentabilidade (3%, 6%, 10%)
- **✅ Listar títulos bons pra comprar** → Apenas J3 e J4

## 📊 Classificação de Janelas

| Janela | Condição            | Emoji | Ação           |
| ------ | ------------------- | ----- | -------------- |
| J1     | min < taxa ≤ Q1     | 😡    | Evitar         |
| J2     | Q1 < taxa ≤ mediana | 😒    | Evitar         |
| J3     | mediana < taxa ≤ Q3 | 😗    | **Comprar** ✅ |
| J4     | Q3 < taxa ≤ max     | 😀    | **Comprar** ✅ |

## 🌐 Interface Web

### Abas

1. **Taxas para Investir** - Análise histórica + janelas
2. **Taxas para Resgatar** - Taxas de venda atuais
3. **Comparação** - Spread investir vs resgatar

### Recursos

- 🔍 Busca/filtro de texto
- 📅 Filtro por período
- 🌓 Tema claro/escuro
- 📱 Responsivo (mobile)
- ⬆️⬇️ Ordenação por coluna

## 📁 Arquivos Importantes

### Backend

```
index.js              # Entry point
telegram.js           # Bot Telegram (lógica principal)
apiTesouro.js         # API wrapper + estatísticas
downloadTesouro.js    # Download de dados
```

### Frontend

```
index.html            # Página principal
css/modern.css        # Estilos principais
js/app-colorized.js   # Lógica + colorização
```

### Dados

```
PrecoTaxaTesouroDireto.csv     # Histórico completo
rendimento_investir.csv        # Taxas de compra
rendimento_resgatar.csv        # Taxas de venda
```

## 🔧 Funções Principais

### apiTesouro.js

```javascript
getTituloInfo(bondName);
// Retorna: { titulo, investimentoMinimo, precoUnitario, vencimento, rentabilidadeAnual }

getTesouroInfo(tipoTitulo, vencimento);
// Retorna: { min, q1, median, q3, max, mean, stdev }

listarTitulosComInvestimentoMinimo();
// Retorna: array de nomes de títulos

listarTitulosComRentabilidadeAlta(percentual);
// Retorna: títulos com taxa > percentual
```

### telegram.js

```javascript
verificarRentabilidade();
// Envia alertas automáticos (11:30, dias úteis)

bot.action("titulosBons");
// Lista títulos em J3 ou J4

bot.action(/maxInvestment_(\d+)/);
// Filtra por rentabilidade mínima
```

### app-colorized.js

```javascript
loadData();
// Carrega todos os CSVs

calculateStatistics(data, startDate, endDate);
// Calcula min, Q1, mediana, Q3, max

classifyWindow(currentRate, stats);
// Classifica em J1/J2/J3/J4

calculateSpread(investRate, redeemRate);
// Calcula diferença entre taxas
```

## 🎨 Classes CSS Principais

### Status/Badges

```css
.status-optimal      /* J4 - Verde escuro */
.status-good         /* J3 - Verde claro */
.status-bad          /* J2 - Laranja */
.status-terrible     /* J1 - Vermelho */
```

### Recomendações

```css
.recommendation-buy   /* Favorável investir - Verde */
.recommendation-hold  /* Aguardar - Amarelo */
.recommendation-sell  /* Considere resgatar - Vermelho */
```

### Spread

```css
.spread-positive     /* Verde */
.spread-negative     /* Vermelho */
```

## 📊 Fontes de Dados

### API Tesouro Direto (JSON)

```
https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json
```

**Dados**: Preços e taxas atuais em tempo real

### Tesouro Transparente (CSV)

```
https://www.tesourotransparente.gov.br/ckan/dataset/.../PrecoTaxaTesouroDireto.csv
```

**Dados**: Histórico completo desde o início do programa

### Investidor10 (Scraping)

```
https://investidor10.com.br/tesouro-direto/
https://investidor10.com.br/tesouro-direto/resgatar/
```

**Dados**: Taxas atuais de compra e venda

## 🐛 Troubleshooting

### Bot não responde

```bash
# Verificar se está rodando
docker-compose ps

# Ver logs
docker-compose logs -f

# Verificar token
echo $TELEGRAM_BOT_TOKEN

# Reiniciar
docker-compose restart
```

### Dados desatualizados

```bash
# Baixar manualmente
node downloadTesouro.js

# Verificar arquivos CSV
ls -lh *.csv
```

### Interface web não carrega dados

```bash
# Verificar se CSVs existem
ls rendimento_*.csv PrecoTaxaTesouroDireto.csv

# Verificar console do navegador (F12)
# Procurar erros de CORS ou 404
```

### Erro de scraping (Investidor10)

```bash
# Site pode ter mudado estrutura HTML
# Verificar manualmente: https://investidor10.com.br/tesouro-direto/
# Atualizar seletores em downloadTesouro.js
```

## 📈 Métricas Estatísticas

```javascript
// Quartis
Q1 = quantile(data, 0.25); // 25% dos dados
Q2 = median(data); // 50% dos dados (mediana)
Q3 = quantile(data, 0.75); // 75% dos dados

// Outras
min = min(data); // Mínimo
max = max(data); // Máximo
mean = mean(data); // Média aritmética
stdev = standardDeviation(data); // Desvio padrão
```

**Biblioteca**: simple-statistics v7.8.3

## 🔗 Links Rápidos

### Oficial

- [Tesouro Direto](https://www.tesourodireto.com.br/)
- [Calculadora](https://www.tesourodireto.com.br/titulos/calculadora.htm)
- [Preços e Taxas](https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm)
- [Simulador](https://www.tesourodireto.com.br/simulador/)

### Dados

- [Tesouro Transparente](https://www.tesourotransparente.gov.br/)
- [Dataset CSV](https://www.tesourotransparente.gov.br/ckan/dataset/taxas-dos-titulos-ofertados-pelo-tesouro-direto)

### Projeto

- [GitHub](https://github.com/ghostnetrn/bot-tesouro-direto)
- [Site Demo](https://ghostnetrn.github.io/bot-tesouro-direto/)
- [Estratégia (YouTube)](https://www.youtube.com/watch?v=VqcGwlY3Jz4)

### Telegram

- [Criar Bot](https://canaltech.com.br/apps/como-criar-um-bot-no-telegram-botfather/)
- [Obter Chat ID](https://github.com/nadam/userinfobot)

## 🎯 Checklist de Deploy

- [ ] Clonar repositório
- [ ] Instalar dependências (`npm install`)
- [ ] Criar `.env` com credenciais
- [ ] Baixar dados (`node downloadTesouro.js`)
- [ ] Testar bot localmente (`npm start`)
- [ ] Configurar Docker (`docker-compose up -d`)
- [ ] Verificar logs (`docker-compose logs -f`)
- [ ] Testar comandos no Telegram
- [ ] Abrir interface web (`index.html`)
- [ ] Configurar CI/CD (GitHub Actions)

## ⚠️ Avisos Importantes

1. **Não commitar `.env`** - Contém credenciais sensíveis
2. **Backup dos CSVs** - Dados históricos são valiosos
3. **Scraping frágil** - Investidor10 pode mudar estrutura
4. **API não oficial** - Endpoint pode mudar sem aviso
5. **Apenas educacional** - Não é recomendação de investimento

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/ghostnetrn/bot-tesouro-direto/issues)
- **Documentação**: `.kiro/specs/documentacao-sistema-atual/`

---

**Versão**: 2.2.0 | **Última Atualização**: Janeiro 2025
