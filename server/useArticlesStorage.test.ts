import { describe, it, expect } from 'vitest';

/**
 * Teste para validar a função buildFullUrl do useArticlesStorage
 * Simula a lógica de construção de URLs do DOU no frontend
 */

// Simular a função buildFullUrl do useArticlesStorage
function buildFullUrl(urlPart: string, classPK: string): string {
  if (!urlPart && classPK) return `https://www.in.gov.br/consulta/-/detalhe/${classPK}`;
  const up = urlPart?.trim() || "";
  if (up.startsWith("http")) return up;
  if (up.startsWith("/web/dou/-/")) return "https://www.in.gov.br" + up;
  if (up.startsWith("/")) return "https://www.in.gov.br" + up;
  if (up.startsWith("web/dou/-/")) return "https://www.in.gov.br/" + up;
  if (up.startsWith("web/") || up.startsWith("consulta/")) return "https://www.in.gov.br/" + up;
  if (up.includes("-") && !isNaN(parseInt(up.slice(-1)))) return `https://www.in.gov.br/web/dou/-/${up}`;
  return classPK ? `https://www.in.gov.br/consulta/-/detalhe/${classPK}` : "https://www.in.gov.br";
}

describe('buildFullUrl - Frontend URL Construction', () => {
  it('should handle absolute URLs (http/https)', () => {
    const url = 'https://www.in.gov.br/web/dou/-/extrato-de-apostilamento-01/2026-uasg-510178-689074720';
    expect(buildFullUrl(url, '')).toBe(url);
  });

  it('should handle URLs starting with /web/dou/-/', () => {
    const urlPart = '/web/dou/-/extrato-de-apostilamento-01/2026-uasg-510178-689074720';
    const expected = 'https://www.in.gov.br/web/dou/-/extrato-de-apostilamento-01/2026-uasg-510178-689074720';
    expect(buildFullUrl(urlPart, '')).toBe(expected);
  });

  it('should handle URLs starting with web/dou/-/', () => {
    const urlPart = 'web/dou/-/extrato-de-apostilamento-01/2026-uasg-510178-689074720';
    const expected = 'https://www.in.gov.br/web/dou/-/extrato-de-apostilamento-01/2026-uasg-510178-689074720';
    expect(buildFullUrl(urlPart, '')).toBe(expected);
  });

  it('should handle URLs starting with /', () => {
    const urlPart = '/consulta/-/detalhe/689074720';
    const expected = 'https://www.in.gov.br/consulta/-/detalhe/689074720';
    expect(buildFullUrl(urlPart, '')).toBe(expected);
  });

  it('should handle slug format with classPK fallback', () => {
    const urlPart = 'extrato-de-apostilamento-01/2026-uasg-510178-689074720';
    const expected = 'https://www.in.gov.br/web/dou/-/extrato-de-apostilamento-01/2026-uasg-510178-689074720';
    expect(buildFullUrl(urlPart, '')).toBe(expected);
  });

  it('should use classPK when urlPart is empty', () => {
    const classPk = '689074720';
    const expected = 'https://www.in.gov.br/consulta/-/detalhe/689074720';
    expect(buildFullUrl('', classPk)).toBe(expected);
  });

  it('should return base URL when both urlPart and classPK are empty', () => {
    expect(buildFullUrl('', '')).toBe('https://www.in.gov.br');
  });

  it('should handle whitespace in urlPart', () => {
    const urlPart = '  /web/dou/-/test-article-123  ';
    const expected = 'https://www.in.gov.br/web/dou/-/test-article-123';
    expect(buildFullUrl(urlPart, '')).toBe(expected);
  });

  it('should prioritize urlPart over classPK', () => {
    const urlPart = '/web/dou/-/test-article-123';
    const classPk = '999999999';
    const expected = 'https://www.in.gov.br/web/dou/-/test-article-123';
    expect(buildFullUrl(urlPart, classPk)).toBe(expected);
  });

  it('should handle real example URL from user', () => {
    const urlPart = 'extrato-de-apostilamento-01/2026-uasg-510178-689074720';
    const expected = 'https://www.in.gov.br/web/dou/-/extrato-de-apostilamento-01/2026-uasg-510178-689074720';
    expect(buildFullUrl(urlPart, '')).toBe(expected);
  });

  it('should handle null or undefined urlPart gracefully', () => {
    const classPk = '689074720';
    const expected = 'https://www.in.gov.br/consulta/-/detalhe/689074720';
    expect(buildFullUrl('', classPk)).toBe(expected);
  });
});
