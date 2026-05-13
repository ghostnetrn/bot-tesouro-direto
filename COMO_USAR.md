# Como Usar o Sistema de Análise do Tesouro Direto

## 🚀 Início Rápido

### 1. Atualizar os dados do Tesouro Direto

Antes de visualizar o dashboard, você precisa baixar os dados mais recentes:

```bash
# Baixar dados de investimento
node downloadTaxasInvestir.js

# Baixar dados de resgate
node downloadTaxasResgatar.js

# Baixar histórico completo (opcional, mas recomendado)
node downloadTesouro.js
```

### 2. Iniciar o servidor web

```bash
npm run server
# ou
node server.js
```

O servidor será iniciado em: **http://localhost:3000**

### 3. Acessar o dashboard

Abra seu navegador e acesse:
- **http://localhost:3000** ou
- **http://localhost:3000/index.html**

## 📊 Funcionalidades

### Abas Disponíveis

1. **Taxas para Investir**: Análise histórica das taxas de compra
2. **Taxas para Resgatar**: Taxas atuais para resgate antecipado
3. **Comparação**: Spread entre taxas de compra e venda

### Filtros

- **Filtro de Data**: Selecione um período específico para análise
- **Histórico Completo**: Botão para resetar e ver todos os dados

## 🔄 Atualização dos Dados

Os dados devem ser atualizados regularmente executando os scripts de download:

```bash
# Atualizar tudo de uma vez
node downloadTaxasInvestir.js && node downloadTaxasResgatar.js
```

## 📁 Arquivos Gerados

- `rendimento_investir.csv`: Dados de investimento
- `rendimento_resgatar.csv`: Dados de resgate
- `PrecoTaxaTesouroDireto.csv`: Histórico completo

## ⚠️ Problemas Comuns

### Dados não aparecem no dashboard

1. Verifique se os arquivos CSV foram gerados:
   ```bash
   ls -lh *.csv
   ```

2. Verifique se o servidor está rodando:
   ```bash
   npm run server
   ```

3. Abra o console do navegador (F12) para ver erros

### Erro ao baixar dados

Se o script de download falhar:
- Verifique sua conexão com a internet
- O site Investidor10 pode estar fora do ar temporariamente
- Tente novamente em alguns minutos

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
bot-tesouro-direto/
├── index.html              # Dashboard principal
├── server.js               # Servidor HTTP
├── downloadTaxasInvestir.js   # Script de download (investimento)
├── downloadTaxasResgatar.js   # Script de download (resgate)
├── downloadTesouro.js         # Script de download (histórico)
├── js/
│   ├── app-colorized.js       # Lógica principal do dashboard
│   ├── redemption-tabs.js     # Gerenciamento de abas
│   └── ...
├── css/
│   └── ...
└── *.csv                   # Arquivos de dados
```

## 📝 Notas

- Os dados são obtidos do site Investidor10
- O histórico completo vem do Tesouro Transparente
- Este é um projeto educacional, não constitui recomendação de investimento
