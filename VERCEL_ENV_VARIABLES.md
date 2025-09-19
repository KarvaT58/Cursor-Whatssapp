# 🔧 Variáveis de Ambiente para Vercel

## 📋 Configuração no Painel do Vercel

Acesse: **Settings → Environment Variables** no seu projeto Vercel

### ✅ **Variáveis Obrigatórias:**

| Nome da Variável                | Valor                                                                                                                                                                                                                         | Descrição                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://umdzvfpnsfkmswaejavr.supabase.co`                                                                                                                                                                                    | URL do seu projeto Supabase    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZHp2ZnBuc2ZrbXN3YWVqYXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5ODY1OTgsImV4cCI6MjA3MzU2MjU5OH0.4jJ2RHRaC32ewUdfCFlUkm0NHLsOFNcLzgkwHikPQUo`            | Chave anônima do Supabase      |
| `SUPABASE_SERVICE_ROLE_KEY`     | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZHp2ZnBuc2ZrbXN3YWVqYXZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk4NjU5OCwiZXhwIjoyMDczNTYyNTk4fQ.jjI9MjMXtiL_VWmvrPQ0N4GFoujdn9WUxkNjdba4zwE` | Chave de serviço do Supabase   |
| `NEXT_PUBLIC_APP_URL`           | `https://seu-app.vercel.app`                                                                                                                                                                                                  | URL da sua aplicação no Vercel |
| `TZ`                            | `America/Sao_Paulo`                                                                                                                                                                                                           | Timezone do Brasil             |

### 🔧 **Variáveis Opcionais (mas recomendadas):**

| Nome da Variável                    | Valor                                                                                             | Descrição                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `Z_API_URL`                         | `https://api.z-api.io`                                                                            | URL da API Z-API                        |
| `Z_API_TOKEN`                       | `seu_token_z_api`                                                                                 | Token da Z-API (configure quando tiver) |
| `NEXT_PUBLIC_SENTRY_DSN`            | `https://b1a7c5ad51a4e5e09028c7f352644df5@o4510032018604042.ingest.us.sentry.io/4510032020373504` | DSN do Sentry para monitoramento        |
| `SENTRY_ORG`                        | `karvat`                                                                                          | Organização do Sentry                   |
| `SENTRY_PROJECT`                    | `javascript-nextjs`                                                                               | Projeto do Sentry                       |
| `SENTRY_AUTH_TOKEN`                 | `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`                         | Token de autenticação do Sentry         |
| `LOG_LEVEL`                         | `info`                                                                                            | Nível de log                            |
| `NEXT_PUBLIC_IGNITER_API_URL`       | `https://seu-app.vercel.app`                                                                      | URL da API Igniter                      |
| `NEXT_PUBLIC_IGNITER_API_BASE_PATH` | `/api/v1`                                                                                         | Caminho base da API                     |

## 🚀 **Passo a Passo no Vercel:**

### 1. **Acesse seu projeto no Vercel**

- Vá para [vercel.com](https://vercel.com)
- Selecione seu projeto

### 2. **Vá para Settings**

- Clique em **Settings** no menu lateral
- Clique em **Environment Variables**

### 3. **Adicione cada variável**

- Clique em **Add New**
- Cole o **Nome** e **Valor** de cada variável
- Marque **Production**, **Preview** e **Development**
- Clique em **Save**

### 4. **Importante:**

- ⚠️ **NEXT_PUBLIC_APP_URL**: Substitua `seu-app.vercel.app` pela URL real do seu projeto
- ⚠️ **Z_API_TOKEN**: Configure quando tiver o token da Z-API
- ✅ **Todas as outras variáveis**: Use exatamente como estão listadas

## 🔍 **Verificação:**

Após configurar, você pode verificar se as variáveis estão corretas:

1. **Redeploy** seu projeto
2. **Acesse** a aplicação
3. **Verifique** se não há erros de conexão com Supabase
4. **Teste** o upload de mídia
5. **Teste** o envio de campanhas

## 📞 **Suporte:**

Se houver problemas:

1. Verifique se todas as variáveis estão configuradas
2. Confirme se a URL do app está correta
3. Verifique os logs do Vercel
4. Teste a conexão com Supabase

---

**🎯 Com essas configurações, sua aplicação estará 100% funcional no Vercel!**


