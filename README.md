## 🚀 **Motivação**

Retornar as informações de um título específico do Tesouro Direto.
Fonte: https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm

> Site funcionando: https://ghostnetrn.github.io/bot-tesouro-direto/

Utilizei como base a planilha apresentada neste vídeo: [https://www.youtube.com/watch?v=VqcGwlY3Jz4&t=239s&ab_channel=Excel%C3%AAncianoBolso](https://www.youtube.com/watch?v=VqcGwlY3Jz4&t=239s&ab_channel=Excel%C3%AAncianoBolso)

## 🗂 Como baixar e instalar o projeto

```bash

    # Clonar o repositório
    $ git clone https://github.com/ghostnetrn/bot-tesouro-direto.git

    # Entrar no diretório
    $ cd bot-tesouro-direto

    # Instalar as dependências
    $ npm install
```

## 💾 Configurar e executar

- TELEGRAM_BOT_TOKEN=1234567890:ABCDEFu // Comom criar bot Telegram https://canaltech.com.br/apps/como-criar-um-bot-no-telegram-botfather/
- CHAT_ID=98765432111111 // Obter id do Telegram https://github.com/nadam/userinfobot
- URL_API=https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json
- URL_FILE_TESOURO=https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv
- ALERTA_RENTABILIDADE=13 // taxa para alertar diariamente
- ALERTA_PERIODO_MINUTOS=720 // tempo em minutos para alertar

```bash
    # Executar
    $ npm start

    # Usando Docker
    $ docker-compose up -d
```

## 🌟 Features

- [x] Integração com Telegram
- [x] Deploy com Docker
- [x] Alerta diário com resumo dos preços
- [x] **NOVO:** Interface web com análise de taxas de investimento
- [x] **NOVO:** Análise de taxas de resgate antecipado
- [x] **NOVO:** Comparação entre taxas de compra e venda (spread)
- [x] **NOVO:** Recomendações inteligentes baseadas no spread
- [x] **NOVO:** Dashboard com melhores oportunidades do momento

## ⚠️ Aviso Importante ⚠️

Este código tem caráter meramente informativo e não deve ser interpretado como uma recomendação de investimento. O criador do código não se responsabiliza por quaisquer perdas financeiras decorrentes do uso deste código ou das informações aqui contidas. É importante que o usuário faça sua própria pesquisa e análise antes de tomar decisões de investimento.

## 🆕 Novas Funcionalidades - Interface Web

### 📊 Análise de Taxas de Resgate

A aplicação agora inclui uma interface web completa com três abas principais:

#### 1. **Taxas para Investir**

- Análise histórica completa dos títulos
- Janelas de compra baseadas em quartis estatísticos
- Identificação das melhores oportunidades de investimento

#### 2. **Taxas para Resgatar**

- Taxas atuais para resgate antecipado
- Análise de quando é vantajoso resgatar títulos
- Preços unitários de resgate em tempo real

#### 3. **Comparação (Spread)**

- Comparação lado a lado entre taxas de investimento e resgate
- Cálculo automático do spread (diferença entre as taxas)
- Recomendações inteligentes:
  - 🟢 **Favorável para investir**: Spread > 2%
  - 🔴 **Considere resgatar**: Spread < -1%
  - 🟡 **Aguardar**: Spread neutro

### 🎯 Como Usar a Nova Funcionalidade

1. **Abra o arquivo `index.html`** no seu navegador
2. **Navegue pelas abas** para ver diferentes análises
3. **Use a aba "Comparação"** para identificar:
   - Quando investir (spread positivo alto)
   - Quando resgatar (spread negativo)
   - Títulos com melhor liquidez

### 📈 Interpretação do Spread

- **Spread Positivo (+)**: Taxa de investimento > Taxa de resgate

  - Indica que é um bom momento para **comprar** o título
  - Quanto maior o spread, melhor a oportunidade

- **Spread Negativo (-)**: Taxa de resgate > Taxa de investimento
  - Pode indicar momento favorável para **resgatar**
  - Analise junto com suas necessidades de liquidez

## 💜 Dúvidas ou sugestões

Verifique as [Issues](https://github.com/ghostnetrn/bot-tesouro-direto/issues) que estão abertas e se já não existe alguma com a sua feature.
