# Requisitos: Sistema Bot Tesouro Direto

## Objetivo da Spec

Documentar o estado atual do sistema Bot Tesouro Direto para facilitar:

- Onboarding de novos desenvolvedores
- Manutenção e evolução do código
- Compreensão da arquitetura e fluxos de dados
- Base para futuras melhorias e refatorações

## Escopo

Esta spec documenta **o sistema existente**, incluindo:

- ✅ Arquitetura e componentes
- ✅ Fluxos de dados
- ✅ Lógica de negócio (análise de títulos)
- ✅ Integrações (APIs, scraping)
- ✅ Interface de usuário (bot + web)
- ✅ Deployment e configuração

**Não inclui**:

- ❌ Novas funcionalidades
- ❌ Refatorações
- ❌ Correções de bugs

## Requisitos Funcionais

### RF01: Coleta de Dados do Tesouro Direto

**Descrição**: O sistema deve coletar dados de títulos do Tesouro Direto de múltiplas fontes.

**Fontes de Dados**:

1. **API Oficial Tesouro Direto** (JSON)
   - URL: `https://www.tesourodireto.com.br/json/.../treasurybondsinfo.json`
   - Dados: preços atuais, taxas, investimento mínimo, vencimentos

2. **Tesouro Transparente** (CSV)
   - URL: `https://www.tesourotransparente.gov.br/.../PrecoTaxaTesouroDireto.csv`
   - Dados: histórico completo de taxas desde o início do programa

3. **Investidor10** (Web Scraping)
   - URLs:
     - Investir: `https://investidor10.com.br/tesouro-direto/`
     - Resgatar: `https://investidor10.com.br/tesouro-direto/resgatar/`
   - Dados: taxas atuais de compra e venda

**Critérios de Aceitação**:

- ✅ Baixa CSV histórico do Tesouro Transparente
- ✅ Faz scraping de taxas de investir e resgatar do Investidor10
- ✅ Normaliza nomes de títulos para padrão oficial
- ✅ Salva dados em arquivos CSV locais
- ✅ Gerencia cache (não baixa se arquivo está atualizado)

### RF02: Análise Estatística de Títulos

**Descrição**: O sistema deve calcular estatísticas históricas para cada título.

**Métricas Calculadas**:

- Mínimo histórico
- 1º Quartil (Q1)
- Mediana (Q2)
- 3º Quartil (Q3)
- Máximo histórico
- Média
- Desvio padrão

**Biblioteca**: simple-statistics v7.8.3

**Critérios de Aceitação**:

- ✅ Lê dados históricos do CSV
- ✅ Filtra por tipo de título e vencimento
- ✅ Calcula todas as métricas estatísticas
- ✅ Retorna valores formatados com 2 casas decimais
- ✅ Retorna zeros se não houver dados históricos

### RF03: Classificação de Janelas de Compra

**Descrição**: O sistema deve classificar títulos em janelas de compra baseadas em quartis.

**Classificação**:
| Janela | Condição | Emoji | Descrição |
|--------|----------|-------|-----------|
| J1 | min < taxa ≤ Q1 | 😡 | COMPRA PÉSSIMA |
| J2 | Q1 < taxa ≤ mediana | 😒 | COMPRA RUIM |
| J3 | mediana < taxa ≤ Q3 | 😗 | COMPRA BOA |
| J4 | Q3 < taxa ≤ max | 😀 | COMPRA ÓTIMA |

**Critérios de Aceitação**:

- ✅ Compara taxa atual com quartis históricos
- ✅ Classifica corretamente em J1/J2/J3/J4
- ✅ Exclui Tesouro Selic da análise
- ✅ Trata títulos sem histórico (retorna dados zerados)

### RF04: Bot Telegram - Comandos Básicos

**Descrição**: O sistema deve fornecer interface conversacional via Telegram.

**Comandos**:
| Comando | Ação |
|---------|------|
| `/start` | Inicializa bot e exibe menu |
| `🧾 Teclado` | Exibe teclado inline |
| `📈 Gráficos` | Links para gráficos externos |

**Teclado Inline**:

- 📇 Listar todos os títulos
- 📊 Listar títulos com maior percentual de investimento
- ✅ Listar títulos bons pra comprar

**Critérios de Aceitação**:

- ✅ Responde a comandos do Telegram
- ✅ Exibe teclado inline com botões
- ✅ Permite navegação entre menus
- ✅ Retorna ao menu principal com `/start`

### RF05: Bot Telegram - Consulta de Títulos

**Descrição**: O sistema deve permitir consulta detalhada de títulos específicos.

**Fluxo**:

1. Usuário seleciona título do teclado inline
2. Bot busca dados atuais (API)
3. Bot busca estatísticas históricas (CSV)
4. Bot classifica em janela de compra
5. Bot envia mensagem formatada com todas as informações

**Formato da Mensagem**:

```
*Título:* Tesouro IPCA+ 2035
*Preço unitário:* R$ 3.456,78
*Investimento mínimo:* R$ 34,56
*Rentabilidade anual:* IPCA + 6.25%
*Vencimento:* 15/05/2035

*Mínimo:* 4.50
*1º quartil:* 5.25
*Mediana:* 5.75
*3º quartil:* 6.50
*Máximo:* 7.20
*Média:* 5.80
*Desvio padrão:* 0.65

😗 *J3 - COMPRA BOA*
_Entre mediana e 3º quartil_
```

**Critérios de Aceitação**:

- ✅ Busca dados em tempo real
- ✅ Calcula estatísticas históricas
- ✅ Formata valores monetários (R$)
- ✅ Formata taxas (IPCA+, SELIC+, ou valor puro)
- ✅ Exibe classificação com emoji

### RF06: Bot Telegram - Filtros de Títulos

**Descrição**: O sistema deve permitir filtrar títulos por critérios.

**Filtros Disponíveis**:

1. **Todos os títulos**: Lista todos com investimento mínimo > 0
2. **Maior rentabilidade**: Filtra por percentual mínimo (3%, 6%, 10%)
3. **Títulos bons para comprar**: Apenas J3 e J4

**Critérios de Aceitação**:

- ✅ Filtra títulos por investimento mínimo
- ✅ Filtra por rentabilidade acima de threshold
- ✅ Filtra apenas janelas J3 e J4
- ✅ Exclui títulos sem dados históricos
- ✅ Exclui Tesouro Selic e títulos "Educa+" em alguns fluxos

### RF07: Bot Telegram - Alertas Automáticos

**Descrição**: O sistema deve enviar alertas automáticos em horários programados.

**Configuração**:

- `ALERTA_RENTABILIDADE`: Taxa mínima para alertar (ex: 13%)
- `ALERTA_PERIODO_MINUTOS`: Intervalo de verificação (ex: 720 = 12h)

**Regras de Agendamento**:

- Apenas em dias úteis (segunda a sexta)
- Horário fixo: 11:30 (horário de Brasília)
- Ajusta automaticamente para fuso horário da VM

**Conteúdo do Alerta**:

1. **Relatório de Rentabilidade**: Títulos acima do threshold configurado
2. **Títulos Bons para Comprar**: Todos em janela J3 ou J4

**Critérios de Aceitação**:

- ✅ Verifica se é dia útil
- ✅ Executa no horário configurado (11:30 BR)
- ✅ Envia mensagem no chat configurado (CHAT_ID)
- ✅ Formata mensagens em HTML
- ✅ Envia "Nenhum título encontrado" se não houver oportunidades

### RF08: Interface Web - Dashboard

**Descrição**: O sistema deve fornecer interface web com dashboard informativo.

**Cards do Dashboard**:

1. **Última Atualização**: Data/hora da última coleta de dados
2. **Melhores Oportunidades**: Top 3 títulos em janela J4
3. **Visão Geral do Mercado**: Estatísticas agregadas

**Critérios de Aceitação**:

- ✅ Exibe data/hora da última atualização
- ✅ Lista top 3 oportunidades (J4)
- ✅ Calcula estatísticas do mercado
- ✅ Atualiza dinamicamente ao carregar dados

### RF09: Interface Web - Tabela de Taxas para Investir

**Descrição**: O sistema deve exibir tabela com análise de taxas de compra.

**Colunas**:

- Nome do título
- Vencimento
- Investimento mínimo
- Última taxa
- Mínimo, Q1, Mediana, Q3, Máximo
- Média e Desvio Padrão
- Janela de compra (J1/J2/J3/J4)

**Funcionalidades**:

- Ordenação por qualquer coluna
- Busca/filtro de texto
- Paginação
- Filtro por período (date range)
- Colorização por proximidade ao máximo

**Critérios de Aceitação**:

- ✅ Carrega dados de rendimento_investir.csv
- ✅ Calcula estatísticas históricas
- ✅ Classifica em janelas de compra
- ✅ Aplica colorização (verde = próximo ao máximo)
- ✅ Permite ordenação e busca
- ✅ Responsiva (mobile-friendly)

### RF10: Interface Web - Tabela de Taxas para Resgatar

**Descrição**: O sistema deve exibir tabela com taxas de resgate antecipado.

**Colunas**:

- Nome do título
- Vencimento
- Taxa de resgate
- Preço unitário de resgate
- Spread vs investimento
- Análise de resgate

**Critérios de Aceitação**:

- ✅ Carrega dados de rendimento_resgatar.csv
- ✅ Calcula spread (taxa investir - taxa resgatar)
- ✅ Classifica análise de resgate
- ✅ Formata valores monetários
- ✅ Permite ordenação e busca

### RF11: Interface Web - Tabela de Comparação (Spread)

**Descrição**: O sistema deve comparar taxas de investir vs resgatar.

**Colunas**:

- Nome do título
- Vencimento
- Taxa investir
- Taxa resgatar
- Spread (diferença)
- PU investir
- PU resgatar
- Recomendação

**Lógica de Recomendação**:
| Spread | Recomendação | Cor |
|--------|--------------|-----|
| > 2.0% | 🟢 Favorável para investir | Verde |
| -1.0% a 2.0% | 🟡 Aguardar | Amarelo |
| < -1.0% | 🔴 Considere resgatar | Vermelho |

**Critérios de Aceitação**:

- ✅ Combina dados de investir e resgatar
- ✅ Calcula spread corretamente
- ✅ Gera recomendação baseada em thresholds
- ✅ Aplica cores ao spread (verde/vermelho)
- ✅ Permite ordenação por spread

### RF12: Interface Web - Filtro de Período

**Descrição**: O sistema deve permitir filtrar dados históricos por intervalo de datas.

**Funcionalidades**:

- Seletor de intervalo de datas (date range picker)
- Botão "Histórico completo" para resetar
- Recalcula estatísticas com dados filtrados
- Atualiza todas as tabelas e dashboard

**Critérios de Aceitação**:

- ✅ Filtra dados do CSV por data
- ✅ Recalcula min, Q1, mediana, Q3, max
- ✅ Atualiza classificação de janelas
- ✅ Atualiza dashboard
- ✅ Permite resetar para histórico completo

### RF13: Interface Web - Tema Claro/Escuro

**Descrição**: O sistema deve suportar alternância entre tema claro e escuro.

**Funcionalidades**:

- Botão de alternância no header
- Salva preferência no localStorage
- Aplica tema ao carregar página
- Transições suaves entre temas

**Critérios de Aceitação**:

- ✅ Alterna entre tema claro e escuro
- ✅ Persiste preferência no navegador
- ✅ Ícone muda (lua/sol)
- ✅ Todas as cores se adaptam ao tema

### RF14: Interface Web - Responsividade Mobile

**Descrição**: O sistema deve ser totalmente funcional em dispositivos móveis.

**Adaptações Mobile**:

- Menu hambúrguer
- Tabelas com scroll horizontal
- Hint visual de scroll
- Priorização de colunas (hide/show)
- Cards empilhados verticalmente

**Critérios de Aceitação**:

- ✅ Layout adapta para telas < 768px
- ✅ Menu colapsa em hambúrguer
- ✅ Tabelas scrollam horizontalmente
- ✅ Colunas menos importantes ficam ocultas
- ✅ Touch-friendly (botões grandes)

## Requisitos Não Funcionais

### RNF01: Performance

**Descrição**: O sistema deve ter performance adequada para uso diário.

**Métricas**:

- Carregamento da interface web: < 3 segundos
- Resposta do bot Telegram: < 5 segundos
- Download de CSV: < 10 segundos
- Cálculo de estatísticas: < 2 segundos por título

**Critérios de Aceitação**:

- ✅ Interface web carrega rapidamente
- ✅ Bot responde em tempo aceitável
- ✅ Não trava durante processamento

### RNF02: Disponibilidade

**Descrição**: O bot Telegram deve estar disponível 24/7.

**Requisitos**:

- Restart automático em caso de falha
- Logs de erros
- Reconexão automática ao Telegram

**Critérios de Aceitação**:

- ✅ Docker configurado com `restart: unless-stopped`
- ✅ Bot reconecta automaticamente
- ✅ Erros são logados no console

### RNF03: Segurança

**Descrição**: O sistema deve proteger credenciais sensíveis.

**Requisitos**:

- Variáveis de ambiente para tokens
- .gitignore para .env
- Não expor tokens em logs
- HTTPS para requisições externas

**Critérios de Aceitação**:

- ✅ Tokens em variáveis de ambiente
- ✅ .env não commitado no Git
- ✅ .env.example fornecido como template
- ✅ Requisições HTTPS (exceto localhost)

### RNF04: Manutenibilidade

**Descrição**: O código deve ser fácil de entender e modificar.

**Requisitos**:

- Código modularizado (separação de responsabilidades)
- Comentários em lógica complexa
- README com instruções claras
- Nomes de variáveis descritivos

**Critérios de Aceitação**:

- ✅ Funções com responsabilidade única
- ✅ Módulos separados (apiTesouro, telegram, download)
- ✅ README documentado
- ✅ Código legível

### RNF05: Compatibilidade

**Descrição**: O sistema deve funcionar em ambientes modernos.

**Requisitos**:

- Node.js >= 20.0.0
- npm >= 10.0.0
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Docker para deployment

**Critérios de Aceitação**:

- ✅ Especifica versões no package.json
- ✅ Dockerfile funcional
- ✅ Interface web funciona em navegadores modernos
- ✅ Responsivo em mobile

## Dependências Externas

### APIs e Serviços

| Serviço              | Tipo      | Criticidade | Fallback                         |
| -------------------- | --------- | ----------- | -------------------------------- |
| API Tesouro Direto   | JSON      | Alta        | Cache local                      |
| Tesouro Transparente | CSV       | Média       | Arquivo local                    |
| Investidor10         | Scraping  | Baixa       | Dados podem ficar desatualizados |
| Telegram Bot API     | WebSocket | Alta        | Reconexão automática             |

### Bibliotecas

**Backend**:

- axios: HTTP client
- cheerio: Web scraping
- telegraf: Bot Telegram
- simple-statistics: Cálculos estatísticos
- papaparse: Parse CSV
- date-fns: Manipulação de datas

**Frontend**:

- DataTables: Tabelas interativas
- jQuery: Manipulação DOM
- Moment.js: Datas
- DateRangePicker: Filtro de período
- Font Awesome: Ícones

## Configuração e Deployment

### Variáveis de Ambiente Obrigatórias

```bash
TELEGRAM_BOT_TOKEN=<token_do_botfather>
CHAT_ID=<id_do_chat_telegram>
URL_API=<url_da_api_tesouro>
URL_FILE_TESOURO=<url_do_csv_historico>
ALERTA_RENTABILIDADE=<percentual_minimo>
ALERTA_PERIODO_MINUTOS=<intervalo_em_minutos>
```

### Comandos de Execução

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

## Limitações Conhecidas

1. **Scraping Frágil**: Dependente da estrutura HTML do Investidor10
2. **Sem Banco de Dados**: Dados em CSV podem ser perdidos
3. **API Não Oficial**: Endpoint JSON pode mudar sem aviso
4. **Sem Autenticação Web**: Interface pública
5. **Sem Testes Automatizados**: Testes manuais apenas
6. **Alertas Fixos**: Horário 11:30 hardcoded
7. **Fuso Horário**: Ajuste manual para Brasília (UTC-3)

## Avisos Legais

⚠️ **IMPORTANTE**: Este sistema é apenas educacional e não constitui recomendação de investimento. O criador não se responsabiliza por perdas financeiras decorrentes do uso deste código.

## Glossário

- **Tesouro Direto**: Programa do governo brasileiro para venda de títulos públicos
- **Quartil**: Divisão de dados em 4 partes iguais (Q1, Q2/mediana, Q3)
- **Spread**: Diferença entre taxa de compra e venda
- **PU**: Preço Unitário do título
- **Janela de Compra**: Classificação baseada em quartis (J1-J4)
- **Resgate Antecipado**: Venda do título antes do vencimento
- **Taxa de Compra**: Rentabilidade oferecida ao investir
- **Taxa de Resgate**: Rentabilidade ao resgatar antecipadamente
