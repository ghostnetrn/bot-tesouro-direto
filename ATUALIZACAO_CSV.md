# 📋 Atualização do Sistema - Migração para CSVs

## 🎯 Resumo das Alterações

O projeto foi atualizado para **não depender mais da API JSON antiga** do Tesouro Direto (que retornava HTTP 410 Gone). Agora o sistema usa **exclusivamente CSVs oficiais** com fallback automático.

## 📝 Arquivos Alterados

### 1. **downloadTesouro.js** (Reescrito Completamente)

- ❌ Removido: Scraping do Investidor10
- ❌ Removido: Dependência da API JSON antiga
- ❌ Removido: Dependência do cheerio
- ✅ Adicionado: Download de CSVs oficiais do Tesouro Direto
- ✅ Adicionado: Fallback automático usando CSV histórico
- ✅ Adicionado: Funções robustas de parsing (BOM, delimitadores, encoding)
- ✅ Adicionado: Logs detalhados de cada etapa

### 2. **apiTesouro.js** (Reescrito Completamente)

- ❌ Removido: Chamadas à API JSON antiga
- ❌ Removido: Dependência de https.Agent
- ✅ Adicionado: Leitura dos CSVs locais (rendimento_investir.csv)
- ✅ Adicionado: Parsing robusto de CSVs
- ✅ Adicionado: Conversão de números brasileiros
- ✅ Mantido: Todas as funções públicas (compatibilidade com Telegram bot)

### 3. **index.html**

- ❌ Removido: Link para API JSON antiga no rodapé
- ✅ Atualizado: Texto "CSV Tesouro Direto" em vez de "API Tesouro Direto"
- ✅ Atualizado: Link para "Tesouro Transparente" com descrição melhorada

### 4. **.env.example**

- ❌ Removido: URL_API (API JSON antiga)
- ✅ Adicionado: URL_CSV_INVESTIR
- ✅ Adicionado: URL_CSV_RESGATAR
- ✅ Mantido: URL_FILE_TESOURO (CSV histórico)

## 🔄 Novo Fluxo de Dados

### Passo 1: Download do CSV Histórico

```
URL: https://www.tesourotransparente.gov.br/.../precotaxatesourodireto.csv
Arquivo: PrecoTaxaTesouroDireto.csv
Status: ✅ Sempre necessário (fonte de dados históricos)
```

### Passo 2: Tentativa de Download dos CSVs Atuais

```
URL Investir: https://www.tesourodireto.com.br/documents/d/guest/rendimento-investir-csv?download=true
URL Resgatar: https://www.tesourodireto.com.br/documents/d/guest/rendimento-resgatar-csv?download=true
Arquivos: temp_investir.csv, temp_resgatar.csv
Status: ⚠️ Pode falhar (HTTP 403, 404, 410)
```

### Passo 3A: Sucesso - Processar CSVs Baixados

```
- Normalizar cabeçalhos
- Filtrar títulos (remover Selic e Educa+)
- Formatar datas (DD/MM/YYYY)
- Gerar: rendimento_investir.csv, rendimento_resgatar.csv
```

### Passo 3B: Falha - Usar Fallback

```
- Ler PrecoTaxaTesouroDireto.csv
- Encontrar data mais recente em "Data Base"
- Filtrar registros dessa data
- Gerar CSVs a partir dos dados históricos
- Gerar: rendimento_investir.csv, rendimento_resgatar.csv
```

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Baixar Dados Atualizados

```bash
node downloadTesouro.js
```

### 3. Verificar Logs

O script mostra logs detalhados:

```
🚀 Iniciando download dos dados do Tesouro Direto...

📊 PASSO 1: Baixando CSV histórico oficial
⬇️  Tentando baixar: PrecoTaxaTesouroDireto.csv
   URL: https://www.tesourotransparente.gov.br/...
✅ PrecoTaxaTesouroDireto.csv baixado com sucesso (12345678 bytes)

📊 PASSO 2: Tentando baixar CSVs atuais do Tesouro Direto
⬇️  Tentando baixar: temp_investir.csv
   URL: https://www.tesourodireto.com.br/documents/...
✅ temp_investir.csv baixado com sucesso (5678 bytes)
⬇️  Tentando baixar: temp_resgatar.csv
   URL: https://www.tesourodireto.com.br/documents/...
✅ temp_resgatar.csv baixado com sucesso (5432 bytes)

📊 PASSO 3: Processando CSVs baixados
📝 Processando temp_investir.csv...
✅ rendimento_investir.csv processado com 25 títulos
📝 Processando temp_resgatar.csv...
✅ rendimento_resgatar.csv processado com 25 títulos

🎉 Processo concluído com sucesso!

📁 Arquivos gerados:
   ✓ PrecoTaxaTesouroDireto.csv
   ✓ rendimento_investir.csv
   ✓ rendimento_resgatar.csv
```

### 4. Abrir Interface Web

```bash
# Abra o arquivo index.html no navegador
# Ou use um servidor local:
npx http-server -p 8080
```

## ✅ Como Validar os CSVs

### Validar rendimento_investir.csv

```bash
# Windows PowerShell
Get-Content rendimento_investir.csv -Head 5

# Deve mostrar:
# Título;Rendimento anual do título;Investimento mínimo;Preço unitário de investimento;Vencimento do Título
# Tesouro Prefixado 2027;13,98%;R$ 712,17;R$ 7.121,70;01/01/2027
# ...
```

### Validar rendimento_resgatar.csv

```bash
# Windows PowerShell
Get-Content rendimento_resgatar.csv -Head 5

# Deve mostrar:
# Título;Rendimento anual do título;Preço unitário de resgate;Vencimento do Título
# Tesouro Prefixado 2027;13,85%;R$ 7.130,45;01/01/2027
# ...
```

### Validar Estrutura

```bash
# Contar linhas (deve ter títulos)
(Get-Content rendimento_investir.csv).Count
# Deve retornar > 1 (cabeçalho + títulos)

# Verificar se tem datas de vencimento
Select-String -Path rendimento_investir.csv -Pattern "\d{2}/\d{2}/\d{4}"
# Deve mostrar várias linhas com datas
```

## 🔧 Funções Utilitárias Implementadas

### 1. `removeBOM(text)`

Remove o BOM UTF-8 (Byte Order Mark) do início do arquivo.

### 2. `detectDelimiter(csvText)`

Detecta automaticamente se o CSV usa `;` ou `,` como delimitador.

### 3. `parseNumberBR(str)`

Converte números brasileiros para JavaScript:

- `"1.234,56"` → `1234.56`
- `"R$ 1.234,56"` → `1234.56`
- `"7,21%"` → `7.21`

### 4. `formatMoney(value)`

Formata números como moeda brasileira:

- `1234.56` → `"R$ 1.234,56"`

### 5. `formatDate(dateStr)`

Normaliza datas para DD/MM/YYYY:

- `"2027-01-01"` → `"01/01/2027"`
- `"01/01/2027"` → `"01/01/2027"` (mantém)

### 6. `formatRate(titulo, taxa)`

Adiciona prefixo correto à taxa:

- IPCA → `"IPCA + 7,21%"`
- SELIC → `"SELIC + 0,05%"`
- Prefixado → `"13,98%"`

## 📊 Formato dos CSVs Gerados

### rendimento_investir.csv

```csv
Título;Rendimento anual do título;Investimento mínimo;Preço unitário de investimento;Vencimento do Título
Tesouro Prefixado 2027;13,98%;R$ 712,17;R$ 7.121,70;01/01/2027
Tesouro IPCA+ 2029;IPCA + 7,21%;R$ 1.964,43;R$ 1.964,43;15/05/2029
```

### rendimento_resgatar.csv

```csv
Título;Rendimento anual do título;Preço unitário de resgate;Vencimento do Título
Tesouro Prefixado 2027;13,85%;R$ 7.130,45;01/01/2027
Tesouro IPCA+ 2029;IPCA + 7,15%;R$ 1.970,23;15/05/2029
```

## 🐛 Tratamento de Erros

### Erro: CSVs atuais indisponíveis (HTTP 403/404/410)

**Solução:** O sistema usa automaticamente o fallback (CSV histórico)

```
❌ Erro HTTP 410 ao baixar temp_investir.csv
🔄 Usando fallback: gerando CSVs a partir do histórico oficial...
   Data mais recente encontrada: 10/05/2026
✅ rendimento_investir.csv gerado com 25 títulos (fallback)
```

### Erro: CSV histórico não encontrado

**Solução:** Execute novamente o script

```bash
node downloadTesouro.js
```

### Erro: Encoding incorreto

**Solução:** O sistema tenta UTF-8 primeiro, depois ISO-8859-1 automaticamente

### Erro: Delimitador incorreto

**Solução:** O sistema detecta automaticamente `;` ou `,`

## 🔍 Diferenças entre Fontes

### CSVs Atuais (Preferencial)

- ✅ Dados em tempo real
- ✅ Formatação consistente
- ✅ Investimento mínimo preciso
- ⚠️ Pode estar indisponível

### CSV Histórico (Fallback)

- ✅ Sempre disponível
- ✅ Dados oficiais do governo
- ⚠️ Investimento mínimo aproximado (1% do PU)
- ⚠️ Usa última data disponível

## 📦 Dependências

### Mantidas

- `axios` - Download de arquivos
- `papaparse` - Parsing de CSVs
- `simple-statistics` - Cálculos estatísticos
- `date-fns` - Formatação de datas

### Removidas

- ❌ `cheerio` - Não é mais necessário (sem scraping)

## 🎯 Compatibilidade

### Front-end (index.html)

✅ **100% compatível** - Nenhuma alteração necessária

- Continua lendo `rendimento_investir.csv`
- Continua lendo `rendimento_resgatar.csv`
- Formato dos CSVs mantido idêntico

### Telegram Bot (telegram.js)

✅ **100% compatível** - Nenhuma alteração necessária

- `apiTesouro.js` mantém todas as funções públicas
- Assinaturas de funções mantidas
- Retornos mantidos no mesmo formato

### Docker

✅ **100% compatível** - Nenhuma alteração necessária

- Dockerfile não precisa de mudanças
- docker-compose.yml não precisa de mudanças

## 🚨 Ações Necessárias

### 1. Atualizar .env (se existir)

Se você tem um arquivo `.env`, remova a linha antiga:

```bash
# REMOVER:
URL_API=https://www.tesourodireto.com.br/json/.../treasurybondsinfo.json

# ADICIONAR (opcional, já tem valores padrão):
URL_CSV_INVESTIR=https://www.tesourodireto.com.br/documents/d/guest/rendimento-investir-csv?download=true
URL_CSV_RESGATAR=https://www.tesourodireto.com.br/documents/d/guest/rendimento-resgatar-csv?download=true
```

### 2. Executar Download Inicial

```bash
node downloadTesouro.js
```

### 3. Testar Interface Web

```bash
# Abrir index.html no navegador
# Verificar se a tabela carrega os títulos
```

### 4. Testar Bot Telegram (se usar)

```bash
npm start
# Enviar comando /listar no Telegram
# Verificar se retorna os títulos
```

## 📈 Melhorias Implementadas

1. **Logs Detalhados**: Cada etapa mostra o que está acontecendo
2. **Fallback Automático**: Nunca falha se o CSV histórico estiver disponível
3. **Parsing Robusto**: Detecta encoding, delimitador, remove BOM
4. **Conversão de Números**: Lida com formato brasileiro automaticamente
5. **Tratamento de Erros**: Mensagens claras sobre o que falhou
6. **Compatibilidade**: Mantém formato exato dos CSVs originais

## 🎉 Resultado Final

Após executar `node downloadTesouro.js`, você terá:

```
bot-tesouro-direto/
├── PrecoTaxaTesouroDireto.csv      ← CSV histórico oficial
├── rendimento_investir.csv          ← Dados atuais para investir
├── rendimento_resgatar.csv          ← Dados atuais para resgatar
├── downloadTesouro.js               ← Script atualizado
├── apiTesouro.js                    ← API atualizada
└── index.html                       ← Interface web (sem mudanças)
```

**Sistema 100% funcional sem depender da API JSON antiga! 🎊**
