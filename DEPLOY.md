# Guia de Deploy no Vercel

Este projeto está configurado para ser deployado no Vercel. Siga os passos abaixo para fazer o deploy.

## Pré-requisitos

- Conta no Vercel (https://vercel.com)
- Repositório no GitHub (https://github.com/rafaelccorrea/consulta-diario-uniao.git)
- Variáveis de ambiente configuradas

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no Vercel Project Settings:

### Banco de Dados
- `DATABASE_URL` - String de conexão MySQL/TiDB

### Autenticação
- `JWT_SECRET` - Chave secreta para assinar tokens JWT

### OAuth (Manus)
- `VITE_APP_ID` - ID da aplicação OAuth
- `OAUTH_SERVER_URL` - URL do servidor OAuth (ex: https://api.manus.im)
- `VITE_OAUTH_PORTAL_URL` - URL do portal de login OAuth

### Informações do Proprietário
- `OWNER_OPEN_ID` - ID aberto do proprietário
- `OWNER_NAME` - Nome do proprietário

### APIs Manus
- `BUILT_IN_FORGE_API_URL` - URL da API Forge (ex: https://api.manus.im)
- `BUILT_IN_FORGE_API_KEY` - Chave de API para backend
- `VITE_FRONTEND_FORGE_API_KEY` - Chave de API para frontend
- `VITE_FRONTEND_FORGE_API_URL` - URL da API Forge para frontend

### Analytics
- `VITE_ANALYTICS_ENDPOINT` - Endpoint de analytics
- `VITE_ANALYTICS_WEBSITE_ID` - ID do website para analytics

## Passos para Deploy

### 1. Conectar Repositório ao Vercel

1. Acesse https://vercel.com/dashboard
2. Clique em "Add New..." > "Project"
3. Selecione "Import Git Repository"
4. Cole a URL do seu repositório (ex.: `https://github.com/rafaelccorrea/consulta-diario-uniao.git`)
5. Clique em "Import"
6. **Importante:** em "Root Directory" deixe em branco (raiz do repositório)
7. Clique em **"Deploy"** para rodar o primeiro build. Sem isso aparece "No Deployment"

### 2. Configurar Variáveis de Ambiente

1. Na página de configuração do projeto, vá para "Environment Variables"
2. Adicione todas as variáveis listadas acima
3. Certifique-se de que as variáveis estão disponíveis para:
   - Production
   - Preview
   - Development

### 3. Configurar Build Settings

O projeto já possui `vercel.json` configurado com:
- Build Command: `pnpm build` (gera o client em `public/` e o server em `dist/`)
- Install Command: `pnpm install`

O deploy usa **front estático + API** na Vercel:
- **Frontend (SPA):** build do Vite em `public/` é servido como site estático (`outputDirectory: "public"`). Rotas como `/` e `/dashboard` recebem `index.html` (rewrite para SPA).
- **Backend (Express):** apenas rotas `/api/*` (tRPC, OAuth) são tratadas pelo Express em `api/index.ts` (serverless function).

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build completar (geralmente 2-5 minutos)
3. Após sucesso, você terá uma URL pública para acessar o projeto

## Troubleshooting

### Aparece "No Deployment"
Significa que ainda não existe nenhum deploy concluído. Faça o seguinte:

1. **Disparar o primeiro deploy:** no projeto na Vercel, abra a aba "Deployments" e clique em **"Deploy"** (ou "Redeploy" se já tiver tentado antes). Ou faça um **push** no branch conectado (ex.: `main`) para disparar o build automaticamente.
2. **Root Directory:** em Settings > General, confira se "Root Directory" está vazio. Se estiver preenchido com uma pasta (ex.: `client`), apague e salve — o `package.json` e o `server.ts` precisam estar na raiz que a Vercel usa.
3. **Build Command:** em Settings > General, deve estar `pnpm build` (ou em branco para usar o do `vercel.json`).
4. Depois do deploy, use a URL **do projeto** (ex.: `https://seu-projeto.vercel.app`), não a URL de um deployment específico.

### Build falha com erro de dependências
- Verifique se todas as dependências estão no `package.json`
- Execute `pnpm install` localmente para testar

### Erro de variáveis de ambiente
- Confirme que todas as variáveis obrigatórias estão configuradas
- Verifique a ortografia exata das variáveis

### Erro de conexão com banco de dados
- Verifique se o `DATABASE_URL` está correto
- Certifique-se de que o banco de dados está acessível da internet
- Adicione o IP do Vercel à whitelist do banco de dados (se aplicável)

### Erro de autenticação OAuth
- Verifique se `VITE_APP_ID` está correto
- Confirme que `OAUTH_SERVER_URL` e `VITE_OAUTH_PORTAL_URL` estão corretos

## Monitoramento

Após o deploy:

1. Acesse o projeto no Vercel Dashboard
2. Monitore logs em "Deployments" > "Logs"
3. Configure alertas de erro em "Settings" > "Alerts"

## Atualizações

Para fazer novas atualizações:

1. Faça push para o branch `main` no GitHub
2. Vercel automaticamente detectará a mudança
3. Um novo build será iniciado automaticamente
4. Após sucesso, a versão será atualizada

## Rollback

Se precisar reverter para uma versão anterior:

1. No Vercel Dashboard, vá para "Deployments"
2. Encontre o deployment anterior
3. Clique em "Promote to Production"

## Suporte

Para mais informações sobre deploy no Vercel:
- Documentação: https://vercel.com/docs
- Suporte: https://vercel.com/support
