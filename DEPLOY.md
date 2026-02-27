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
4. Cole a URL: `https://github.com/rafaelccorrea/consulta-diario-uniao.git`
5. Clique em "Import"

### 2. Configurar Variáveis de Ambiente

1. Na página de configuração do projeto, vá para "Environment Variables"
2. Adicione todas as variáveis listadas acima
3. Certifique-se de que as variáveis estão disponíveis para:
   - Production
   - Preview
   - Development

### 3. Configurar Build Settings

O projeto já possui `vercel.json` configurado com:
- Build Command: `pnpm build`
- Install Command: `pnpm install`
- Framework: Vite

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build completar (geralmente 2-5 minutos)
3. Após sucesso, você terá uma URL pública para acessar o projeto

## Troubleshooting

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
