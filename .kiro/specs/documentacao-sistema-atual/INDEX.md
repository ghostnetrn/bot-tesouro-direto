# 📚 Índice da Documentação - Bot Tesouro Direto

## 🎯 Navegação Rápida

### 🚀 Começando

| Documento                                    | Descrição                    | Tempo de Leitura |
| -------------------------------------------- | ---------------------------- | ---------------- |
| **[README.md](README.md)**                   | Visão geral completa da spec | 15 min           |
| **[SUMMARY.md](SUMMARY.md)**                 | Sumário executivo            | 5 min            |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Guia rápido de referência    | 10 min           |

### 📖 Documentação Técnica

| Documento                                  | Descrição                                                        | Tempo de Leitura |
| ------------------------------------------ | ---------------------------------------------------------------- | ---------------- |
| **[requirements.md](requirements.md)**     | Requisitos funcionais (RF01-RF14) e não funcionais (RNF01-RNF05) | 30 min           |
| **[design.md](design.md)**                 | Arquitetura detalhada, componentes, estratégia                   | 45 min           |
| **[FLOWS.md](FLOWS.md)**                   | Fluxos de dados e processos com diagramas                        | 30 min           |
| **[FILE_STRUCTURE.md](FILE_STRUCTURE.md)** | Estrutura de arquivos e descrição de cada um                     | 20 min           |

---

## 📋 Conteúdo por Documento

### 1. README.md

**Visão Geral Completa**

- 📋 Objetivo da spec
- 🎯 Escopo (incluído/não incluído)
- 🏗️ Arquitetura do sistema (3 componentes)
- 🔄 Fluxo de dados simplificado
- 🎓 Estratégia de investimento (quartis)
- 🚀 Funcionalidades principais
- 🛠️ Tecnologias utilizadas
- ⚙️ Configuração e comandos
- 📊 Fontes de dados
- ⚠️ Limitações conhecidas
- 🔮 Melhorias futuras
- 🔗 Links úteis

**Quando usar**: Primeiro contato com o projeto ou visão geral completa.

---

### 2. SUMMARY.md

**Sumário Executivo**

- 🎯 O que é (1 parágrafo)
- 🏗️ Componentes (lista resumida)
- 📊 Estratégia de investimento (tabela)
- 🔄 Fluxo principal (diagrama simples)
- 📁 Arquivos principais (tabela)
- 🗂️ Dados armazenados
- ⚙️ Configuração essencial
- 🚀 Execução (comandos)
- 📈 Funcionalidades principais
- ⚠️ Limitações (lista)
- 🔗 Links importantes

**Quando usar**: Leitura rápida de 5 minutos para entender o essencial.

---

### 3. QUICK_REFERENCE.md

**Guia Rápido de Referência**

- 🚀 Início rápido (instalação)
- 📋 Comandos úteis (npm, docker, scripts)
- 🔑 Variáveis de ambiente
- 🤖 Comandos do bot Telegram
- 📊 Classificação de janelas (tabela)
- 🌐 Interface web (recursos)
- 📁 Arquivos importantes
- 🔧 Funções principais (assinaturas)
- 🎨 Classes CSS principais
- 📊 Fontes de dados (URLs)
- 🐛 Troubleshooting
- 📈 Métricas estatísticas (fórmulas)
- 🔗 Links rápidos
- 🎯 Checklist de deploy

**Quando usar**: Consulta rápida durante desenvolvimento ou troubleshooting.

---

### 4. requirements.md

**Requisitos Detalhados**

#### Requisitos Funcionais (RF01-RF14)

- RF01: Coleta de Dados do Tesouro Direto
- RF02: Análise Estatística de Títulos
- RF03: Classificação de Janelas de Compra
- RF04: Bot Telegram - Comandos Básicos
- RF05: Bot Telegram - Consulta de Títulos
- RF06: Bot Telegram - Filtros de Títulos
- RF07: Bot Telegram - Alertas Automáticos
- RF08: Interface Web - Dashboard
- RF09: Interface Web - Tabela de Taxas para Investir
- RF10: Interface Web - Tabela de Taxas para Resgatar
- RF11: Interface Web - Tabela de Comparação (Spread)
- RF12: Interface Web - Filtro de Período
- RF13: Interface Web - Tema Claro/Escuro
- RF14: Interface Web - Responsividade Mobile

#### Requisitos Não Funcionais (RNF01-RNF05)

- RNF01: Performance
- RNF02: Disponibilidade
- RNF03: Segurança
- RNF04: Manutenibilidade
- RNF05: Compatibilidade

#### Outros

- Dependências externas
- Configuração e deployment
- Limitações conhecidas
- Glossário

**Quando usar**: Entender o que o sistema faz e como deve se comportar.

---

### 5. design.md

**Arquitetura e Design Técnico**

- 📐 Visão geral
- 🏗️ Arquitetura do sistema (diagrama)
- 🔧 Componentes detalhados
  - Sistema de coleta de dados
  - Bot Telegram
  - Interface web
  - Deployment
- 🔄 Fluxos de dados (3 fluxos principais)
- 📦 Dependências principais
- 🎓 Estratégia de investimento (detalhada)
- ⚠️ Limitações e considerações
- 🔮 Melhorias futuras sugeridas
- 📚 Referências

**Quando usar**: Entender como o sistema funciona internamente.

---

### 6. FLOWS.md

**Fluxos de Dados e Processos**

#### 9 Fluxos Detalhados com Diagramas:

1. 🔄 Coleta de Dados
2. 🤖 Consulta via Bot Telegram
3. ⏰ Alertas Automáticos
4. 🌐 Interface Web
5. 📊 Cálculo de Estatísticas
6. 💰 Cálculo de Spread
7. 🎨 Colorização de Taxas
8. 🔄 Atualização de Dados
9. 🔍 Tratamento de Erros

**Quando usar**: Entender o fluxo de dados passo a passo, debugar problemas.

---

### 7. FILE_STRUCTURE.md

**Estrutura de Arquivos**

- 📁 Visão geral (árvore completa)
- 📂 Estrutura detalhada por categoria
  - Configuração
  - Backend (Node.js)
  - Frontend (Web)
  - Dados (CSV)
  - Docker
  - Documentação
  - CI/CD
- 📄 Descrição dos arquivos principais
  - Backend: index.js, telegram.js, apiTesouro.js, etc.
  - Frontend: index.html, CSS, JS
  - Dados: CSVs
- 📊 Tamanho dos arquivos
- 🔄 Fluxo de arquivos
- 🎯 Arquivos críticos
- 📝 Convenções de nomenclatura

**Quando usar**: Navegar o código, encontrar onde está cada funcionalidade.

---

## 🎯 Roteiros de Leitura Sugeridos

### Para Desenvolvedores Novos no Projeto

1. **Dia 1 - Visão Geral** (1h)
   - [ ] README.md (15 min)
   - [ ] SUMMARY.md (5 min)
   - [ ] QUICK_REFERENCE.md (10 min)
   - [ ] Instalar e rodar o projeto (30 min)

2. **Dia 2 - Entendimento Funcional** (2h)
   - [ ] requirements.md - RF01 a RF07 (Bot) (1h)
   - [ ] requirements.md - RF08 a RF14 (Web) (1h)

3. **Dia 3 - Arquitetura** (2h)
   - [ ] design.md (45 min)
   - [ ] FLOWS.md - Fluxos 1-5 (45 min)
   - [ ] FILE_STRUCTURE.md (30 min)

4. **Dia 4 - Prática** (4h)
   - [ ] Explorar código backend (2h)
   - [ ] Explorar código frontend (2h)
   - [ ] Fazer pequenas modificações

### Para Manutenção Rápida

1. **Corrigir Bug**
   - [ ] QUICK_REFERENCE.md - Troubleshooting
   - [ ] FILE_STRUCTURE.md - Localizar arquivo
   - [ ] FLOWS.md - Entender fluxo relacionado
   - [ ] Código fonte

2. **Adicionar Feature**
   - [ ] requirements.md - Entender requisitos existentes
   - [ ] design.md - Entender arquitetura
   - [ ] FLOWS.md - Identificar onde inserir
   - [ ] Implementar

### Para Auditoria/Revisão

1. **Revisão Técnica**
   - [ ] design.md - Arquitetura
   - [ ] requirements.md - RNF (não funcionais)
   - [ ] FLOWS.md - Fluxos críticos
   - [ ] Código fonte

2. **Revisão de Segurança**
   - [ ] requirements.md - RNF03 (Segurança)
   - [ ] QUICK_REFERENCE.md - Variáveis de ambiente
   - [ ] design.md - Limitações
   - [ ] Código fonte (autenticação, tokens)

---

## 📊 Estatísticas da Documentação

| Métrica                       | Valor               |
| ----------------------------- | ------------------- |
| **Total de Documentos**       | 7 arquivos          |
| **Linhas de Documentação**    | ~3.500 linhas       |
| **Tempo Total de Leitura**    | ~3 horas            |
| **Requisitos Funcionais**     | 14 (RF01-RF14)      |
| **Requisitos Não Funcionais** | 5 (RNF01-RNF05)     |
| **Fluxos Documentados**       | 9 fluxos            |
| **Diagramas**                 | 15+ diagramas ASCII |

---

## 🔍 Busca Rápida por Tópico

### Arquitetura

- [design.md](design.md) - Arquitetura completa
- [FLOWS.md](FLOWS.md) - Fluxos de dados

### Bot Telegram

- [requirements.md](requirements.md) - RF04, RF05, RF06, RF07
- [design.md](design.md) - Seção "Bot Telegram"
- [FLOWS.md](FLOWS.md) - Fluxo 2 e 3

### Interface Web

- [requirements.md](requirements.md) - RF08 a RF14
- [design.md](design.md) - Seção "Interface Web"
- [FLOWS.md](FLOWS.md) - Fluxo 4

### Coleta de Dados

- [requirements.md](requirements.md) - RF01
- [design.md](design.md) - Seção "Sistema de Coleta"
- [FLOWS.md](FLOWS.md) - Fluxo 1

### Análise Estatística

- [requirements.md](requirements.md) - RF02, RF03
- [design.md](design.md) - Seção "Estratégia de Investimento"
- [FLOWS.md](FLOWS.md) - Fluxo 5

### Configuração

- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Comandos e variáveis
- [requirements.md](requirements.md) - Seção "Configuração e Deployment"

### Troubleshooting

- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Seção "Troubleshooting"
- [FLOWS.md](FLOWS.md) - Fluxo 9 (Tratamento de Erros)

---

## 📝 Convenções da Documentação

### Emojis Utilizados

- 📋 Requisitos
- 🏗️ Arquitetura
- 🔄 Fluxos
- 📁 Arquivos
- 🚀 Início rápido
- ⚙️ Configuração
- 🐛 Troubleshooting
- ⚠️ Avisos/Limitações
- ✅ Sucesso/Recomendado
- ❌ Erro/Não recomendado

### Formatação

- **Negrito**: Termos importantes, títulos
- `Código`: Comandos, variáveis, funções
- > Citações: Avisos importantes
- Tabelas: Comparações, listas estruturadas
- Diagramas ASCII: Fluxos e arquitetura

---

## 🔗 Links Externos Úteis

### Documentação Oficial

- [Node.js](https://nodejs.org/docs/)
- [Telegraf](https://telegraf.js.org/)
- [DataTables](https://datatables.net/)
- [Simple Statistics](https://simplestatistics.org/)

### Tesouro Direto

- [Site Oficial](https://www.tesourodireto.com.br/)
- [Tesouro Transparente](https://www.tesourotransparente.gov.br/)
- [Calculadora](https://www.tesourodireto.com.br/titulos/calculadora.htm)

### Projeto

- [GitHub](https://github.com/ghostnetrn/bot-tesouro-direto)
- [Issues](https://github.com/ghostnetrn/bot-tesouro-direto/issues)

---

**Versão da Documentação**: 1.0.0  
**Data de Criação**: Janeiro 2025  
**Última Atualização**: Janeiro 2025  
**Autor**: Kiro AI Assistant

---

## 💡 Dicas de Uso

1. **Começe pelo README.md** para ter uma visão geral
2. **Use QUICK_REFERENCE.md** como cola durante desenvolvimento
3. **Consulte FLOWS.md** quando precisar debugar
4. **Leia requirements.md** antes de adicionar features
5. **Mantenha esta documentação atualizada** ao fazer mudanças no código

---

**Boa leitura! 📚**
