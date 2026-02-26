# Integração com douScraper.js

## Visão Geral

O dashboard LEGALIX está pronto para receber dados do seu script `douScraper.js`. Este documento descreve como integrar a API.

## Estrutura Esperada dos Dados

O dashboard espera receber artigos com a seguinte estrutura:

```javascript
{
  id: number,
  title: string,           // Título do artigo
  date: string,            // Data formatada (ex: "26 de fevereiro de 2024")
  section: string,         // Seção do DOU (ex: "Seção 1")
  summary: string,         // Resumo/descrição do artigo
  url: string              // Link para o artigo no site oficial
}
```

## Endpoints Necessários

### 1. GET `/api/articles` - Buscar artigos

**Parâmetros de Query:**
- `query` (string, opcional): Termo de busca
- `section` (string, opcional): Filtrar por seção
- `dateFrom` (string, opcional): Data inicial (YYYY-MM-DD)
- `dateTo` (string, opcional): Data final (YYYY-MM-DD)
- `limit` (number, opcional): Quantidade de resultados (padrão: 50)
- `offset` (number, opcional): Paginação (padrão: 0)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Portaria sobre diretrizes...",
      "date": "26 de fevereiro de 2024",
      "section": "Seção 1",
      "summary": "Descrição do artigo...",
      "url": "https://www.in.gov.br/..."
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### 2. GET `/api/articles/export` - Exportar resultados

**Parâmetros de Query:**
- `format` (string): 'csv' ou 'json'
- `query` (string, opcional): Termo de busca
- `section` (string, opcional): Filtrar por seção
- `dateFrom` (string, opcional): Data inicial
- `dateTo` (string, opcional): Data final

**Resposta:**
- CSV ou JSON com os artigos

## Implementação no Frontend

### 1. Atualizar o arquivo `Dashboard.tsx`

Localize a função `loadArticles()` e substitua o comentário TODO:

```typescript
const loadArticles = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      query: searchQuery,
      // Adicione outros filtros conforme necessário
    });

    const response = await fetch(`/api/articles?${params}`);
    const data = await response.json();

    if (data.success) {
      setArticles(data.data);
    } else {
      console.error('Erro ao carregar artigos:', data.error);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  } finally {
    setLoading(false);
  }
};
```

### 2. Implementar exportação

Adicione a função para exportar dados:

```typescript
const handleExport = async (format: 'csv' | 'json') => {
  try {
    const params = new URLSearchParams({
      format,
      query: searchQuery,
    });

    const response = await fetch(`/api/articles/export?${params}`);
    const blob = await response.blob();

    // Criar link de download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artigos-dou.${format === 'csv' ? 'csv' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar:', error);
  }
};
```

## Integração com Backend (Node.js/Express)

Se você estiver usando um backend Node.js, aqui está um exemplo de como implementar os endpoints:

```javascript
// routes/articles.js
import express from 'express';
import { scrapeAndFilter } from '../douScraper.js';

const router = express.Router();

router.get('/articles', async (req, res) => {
  try {
    const { query, section, dateFrom, dateTo, limit = 50, offset = 0 } = req.query;

    // Chamar seu script douScraper com os filtros
    const articles = await scrapeAndFilter({
      query,
      section,
      dateFrom,
      dateTo,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: articles,
      total: articles.length,
      limit,
      offset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/articles/export', async (req, res) => {
  try {
    const { format, query, section, dateFrom, dateTo } = req.query;

    const articles = await scrapeAndFilter({
      query,
      section,
      dateFrom,
      dateTo,
    });

    if (format === 'csv') {
      // Converter para CSV
      const csv = convertToCSV(articles);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=artigos-dou.csv');
      res.send(csv);
    } else {
      res.json(articles);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

## Próximos Passos

1. **Implementar backend** com os endpoints descritos
2. **Testar a integração** com dados reais do DOU
3. **Adicionar autenticação** se necessário
4. **Configurar cache** para melhor performance
5. **Implementar notificações** para novos artigos

## Suporte

Para dúvidas sobre a integração, verifique:
- Estrutura dos dados retornados
- Formato das datas
- Códigos de erro HTTP
- Limites de requisição da API

