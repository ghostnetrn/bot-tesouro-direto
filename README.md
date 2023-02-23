## 🚀 **Motivação**

Retornar as informações de um título específico do Tesouro Direto.
Fonte: https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm

Utilizei como base a planilha apresentada neste vídeo: [https://www.youtube.com/watch?v=VqcGwlY3Jz4&t=239s&ab_channel=Excel%C3%AAncianoBolso](https://www.youtube.com/watch?v=VqcGwlY3Jz4&t=239s&ab_channel=Excel%C3%AAncianoBolso)

![https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white](https://t.me/tesourodiretobrasil)

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

## ⚠️ Aviso Importante ⚠️

Este código tem caráter meramente informativo e não deve ser interpretado como uma recomendação de investimento. O criador do código não se responsabiliza por quaisquer perdas financeiras decorrentes do uso deste código ou das informações aqui contidas. É importante que o usuário faça sua própria pesquisa e análise antes de tomar decisões de investimento.

## 💜 Dúvidas ou sugestões

Verifique as [Issues](https://github.com/ghostnetrn/bot-tesouro-direto/issues) que estão abertas e se já não existe alguma com a sua feature.
