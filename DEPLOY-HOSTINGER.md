# Deploy na Hostinger

## Build para produção

```bash
pnpm install
pnpm run build
```

Isso gera:
- **`public/`** — frontend: `index.html` + pasta `assets/` (JS e CSS)
- **`dist/index.js`** — servidor Node.js (só usado se você tiver Node na Hostinger)

---

## Hospedagem compartilhada (FTP / Gerenciador de arquivos)

Se você entra por FTP ou “Gerenciador de arquivos” e vê uma pasta tipo `public_html`, é **hospedagem compartilhada**. Ela **não executa Node.js** — só serve arquivos (HTML, CSS, JS).

### O que enviar

Envie o **conteúdo da pasta `public/`** para a **raiz do site** (geralmente `public_html`):

| No seu PC (pasta `public/`) | Enviar para o servidor (ex.: `public_html/`) |
|-----------------------------|----------------------------------------------|
| `index.html`                | `index.html` na raiz                         |
| Pasta `assets/` (inteira)   | Pasta `assets/` na raiz                      |
| `.htaccess`                 | `.htaccess` na raiz (para rotas como /dashboard funcionarem) |

**Não envie** a pasta `dist/` nem o `index.js` do servidor. Na hospedagem compartilhada eles não são usados.

### Passo a passo

1. No FTP, abra a pasta do site (ex.: `public_html`).
2. Envie o arquivo **`public/index.html`** para essa pasta.
3. Envie a pasta **`public/assets`** inteira (com os arquivos `.js` e `.css` dentro).
4. Envie o arquivo **`public/.htaccess`** para a raiz (assim URLs como `/dashboard` passam a abrir o app em vez de 404).
5. Acesse seu domínio no navegador — o site deve abrir. Links diretos como `seusite.com/dashboard` também funcionam.

A busca do DOU funciona no navegador, então o site fica completo só com esses arquivos.

---

## Se tiver Node.js na Hostinger (VPS ou plano Node)

Aí o app roda com Node. Envie:

- Pasta `dist/` (com `index.js`)
- Pasta `public/` (com `index.html` e `assets/`)
- `package.json`

No servidor: `npm install --production` e `npm start` (ou o comando que a Hostinger indicar).
