# 📊 Nova Funcionalidade: Análise de Taxas de Resgate

## 🎯 Objetivo

A nova funcionalidade permite comparar as taxas de **investimento** vs **resgate** dos títulos do Tesouro Direto, ajudando investidores a tomar decisões mais informadas sobre quando comprar, manter ou resgatar seus títulos.

## 🔍 Como Funciona

### 1. **Aba "Taxas para Investir"**

- Mostra a análise histórica tradicional
- Janelas de compra baseadas em quartis estatísticos
- Identifica os melhores momentos para investir

### 2. **Aba "Taxas para Resgatar"** ⭐ NOVA

- Exibe as taxas atuais para resgate antecipado
- Mostra o preço unitário de resgate
- Análise simples de quando considerar o resgate

### 3. **Aba "Comparação"** ⭐ NOVA

- **Spread = Taxa Investimento - Taxa Resgate**
- Recomendações automáticas baseadas no spread
- Comparação lado a lado dos preços unitários

## 📈 Interpretação dos Resultados

### Spread Positivo (Verde) 🟢

```
Tesouro Prefixado 2028
Taxa Investir: 13.22%
Taxa Resgatar: 11.50%
Spread: +1.72%
Recomendação: Favorável para investir
```

### Spread Negativo (Vermelho) 🔴

```
Tesouro IPCA+ 2029
Taxa Investir: 6.15%
Taxa Resgatar: 6.45%
Spread: -0.30%
Recomendação: Considere resgatar
```

## 🎯 Casos de Uso Práticos

### 1. **Investidor Iniciante**

- Use a aba "Taxas para Investir" para identificar oportunidades
- Foque em títulos com "COMPRA ÓTIMA" ou "COMPRA BOA"

### 2. **Investidor com Títulos em Carteira**

- Use a aba "Comparação" para avaliar seus títulos atuais
- Se o spread estiver muito negativo, considere resgatar

### 3. **Análise de Liquidez**

- Compare os preços unitários de investimento vs resgate
- Avalie o custo de liquidez antecipada

## 📊 Exemplo Real de Análise

Imagine que você possui um **Tesouro Prefixado 2028** e quer saber se deve manter ou resgatar:

| Métrica            | Valor                                    |
| ------------------ | ---------------------------------------- |
| Taxa para Investir | 13.22%                                   |
| Taxa para Resgatar | 11.50%                                   |
| Spread             | +1.72%                                   |
| **Interpretação**  | **Mantenha o título** - ainda é atrativo |

Se o spread fosse negativo (-1.72%), seria um sinal para considerar o resgate.

## 🚀 Benefícios da Nova Funcionalidade

1. **Decisões Mais Informadas**: Compare taxas de compra e venda
2. **Timing de Resgate**: Identifique quando resgatar é vantajoso
3. **Análise de Spread**: Entenda o custo da liquidez
4. **Interface Intuitiva**: Três abas organizadas por tipo de análise
5. **Recomendações Automáticas**: Sistema sugere ações baseadas no spread

## 🔧 Dados Utilizados

- **Investimento**: `rendimento_investir.csv` (Tesouro Direto)
- **Resgate**: `rendimento_resgatar.csv` (Tesouro Direto)
- **Histórico**: `PrecoTaxaTesouroDireto.csv` (Tesouro Transparente)

## 💡 Dicas de Uso

1. **Sempre considere seu perfil**: A ferramenta é educacional
2. **Analise o contexto**: Spread é apenas um dos fatores
3. **Considere seus objetivos**: Prazo, liquidez, diversificação
4. **Use junto com outras análises**: Cenário econômico, metas pessoais

---

**⚠️ IMPORTANTE**: Esta ferramenta é educacional e não constitui recomendação de investimento. Sempre consulte um profissional qualificado antes de tomar decisões financeiras.
