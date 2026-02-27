# LEGALIX - Refatoração para localStorage

## Arquitetura
- [x] Remover banco de dados MySQL
- [x] Implementar localStorage para armazenar até 10.000 artigos
- [x] Criar hook customizado para gerenciar dados no localStorage
- [x] Validar limite de 10.000 artigos

## Funcionalidades
- [x] Exportar dados para CSV
- [x] Exportar dados para JSON
- [x] Botão "Buscar Agora" para executar douScraper.js
- [ ] Integração com API real do douScraper
- [x] Atualizar dados em tempo real

## Interface
- [x] Adicionar botão "Buscar Agora" no dashboard
- [x] Mostrar status de busca (carregando, sucesso, erro)
- [x] Indicador de quantidade de artigos armazenados
- [x] Botões de exportação funcionais

## Correção de URLs
- [x] Atualizar função buildFullUrl no douScraper.cjs
- [x] Atualizar função buildFullUrl no useArticlesStorage.ts
- [x] Adicionar suporte ao padrão /web/dou/-/{slug}
- [x] Criar testes unitários para validação de URLs
- [x] Todos os testes passando (28 testes)
- [x] **NOVO**: Atualizar douScraper para entrar em cada artigo e extrair URL completa
- [x] **NOVO**: Retornar URL completa no response do scraper
- [x] **NOVO**: Simplificar lógica de construção de URLs no frontend

## Testes
- [x] Testar construção de URLs do DOU
- [x] Testar localStorage com 10.000 artigos
- [x] Testar exportação para CSV
- [x] Testar exportação para JSON
- [x] Testar busca em tempo real

## Deploy
- [ ] Salvar checkpoint final com correção de URLs
- [ ] Entregar ao usuário
