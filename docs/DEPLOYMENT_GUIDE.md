# 🚀 WhatsApp Professional - Guia de Deploy

## 📋 Visão Geral

Este guia fornece instruções completas para fazer deploy do WhatsApp Professional em diferentes ambientes.

## 🏗️ Arquitetura

### Componentes

- **Frontend**: Next.js 15 com App Router
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Queue**: BullMQ
- **Storage**: Supabase Storage
- **Monitoring**: Sentry
- **Deploy**: Vercel

### Infraestrutura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Vercel      │    │    Supabase     │    │     Redis       │
│   (Frontend +   │◄──►│   (Database +   │◄──►│   (Cache +      │
│   API Routes)   │    │   Storage)      │    │   Queue)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Sentry      │    │     Z-API       │    │   Monitoring    │
│  (Error Track)  │    │  (WhatsApp)     │    │   (Health)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Pré-requisitos

### Contas Necessárias

- [Vercel](https://vercel.com) - Deploy da aplicação
- [Supabase](https://supabase.com) - Database e autenticação
- [Redis Cloud](https://redis.com/redis-enterprise-cloud/) - Cache e filas
- [Sentry](https://sentry.io) - Monitoramento de erros
- [Z-API](https://z-api.io) - Integração WhatsApp

### Ferramentas

- Node.js 18+
- npm ou yarn
- Git
- Vercel CLI

## 🗄️ Configuração do Banco de Dados

### 1. Criar Projeto Supabase

1. Acesse [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e chave anônima

### 2. Executar Migrações

```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de equipes
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de membros da equipe
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Tabela de contatos
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  tags TEXT[],
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de campanhas
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de grupos WhatsApp
CREATE TABLE whatsapp_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  participants_count INTEGER DEFAULT 0,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens da equipe
CREATE TABLE team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_contacts_team_id ON contacts(team_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_campaigns_team_id ON campaigns(team_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_team_messages_team_id ON team_messages(team_id);
```

### 3. Configurar RLS (Row Level Security)

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de exemplo para usuários
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para equipes
CREATE POLICY "Team members can view team" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage team" ON teams
  FOR ALL USING (owner_id = auth.uid());
```

## 🔧 Configuração do Redis

### 1. Criar Instância Redis

1. Acesse [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Crie uma nova instância
3. Anote a URL de conexão

### 2. Configurar BullMQ

```javascript
// lib/redis/queue.ts
import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
})

export const campaignQueue = new Queue('campaigns', { connection })
export const messageQueue = new Queue('messages', { connection })

// Worker para campanhas
export const campaignWorker = new Worker(
  'campaigns',
  async (job) => {
    const { campaignId } = job.data
    // Lógica de processamento da campanha
  },
  { connection }
)

// Worker para mensagens
export const messageWorker = new Worker(
  'messages',
  async (job) => {
    const { messageId } = job.data
    // Lógica de envio de mensagem
  },
  { connection }
)
```

## 📊 Configuração do Sentry

### 1. Criar Projeto Sentry

1. Acesse [Sentry](https://sentry.io)
2. Crie um novo projeto (Next.js)
3. Anote o DSN

### 2. Configurar Variáveis de Ambiente

```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token
```

## 🚀 Deploy no Vercel

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Configurar Projeto

```bash
vercel login
vercel link
```

### 3. Configurar Variáveis de Ambiente

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add REDIS_URL
vercel env add Z_API_URL
vercel env add Z_API_TOKEN
vercel env add NEXT_PUBLIC_SENTRY_DSN
vercel env add SENTRY_ORG
vercel env add SENTRY_PROJECT
vercel env add SENTRY_AUTH_TOKEN
vercel env add NEXT_PUBLIC_APP_VERSION
vercel env add NEXT_PUBLIC_APP_ENV
```

### 4. Deploy

```bash
vercel --prod
```

### 5. Configurar Domínio Personalizado

1. Acesse o dashboard do Vercel
2. Vá para Settings > Domains
3. Adicione seu domínio personalizado
4. Configure os registros DNS

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test
      - run: npm run test:integration
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔒 Configuração de Segurança

### 1. HTTPS

- Automático no Vercel
- Certificados SSL gerenciados

### 2. CORS

```javascript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://yourdomain.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}
```

### 3. Rate Limiting

```javascript
// lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

## 📊 Monitoramento

### 1. Health Checks

```javascript
// app/api/health/route.ts
export async function GET() {
  const health = await performHealthCheck()
  return Response.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
  })
}
```

### 2. Métricas

```javascript
// app/api/metrics/route.ts
export async function GET() {
  const metrics = await getSystemMetrics()
  return Response.json(metrics)
}
```

### 3. Logs

```javascript
// lib/logging/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
})
```

## 🔄 Backup e Recovery

### 1. Backup do Banco de Dados

```bash
# Script de backup automático
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
gzip backup_$DATE.sql
aws s3 cp backup_$DATE.sql.gz s3://your-backup-bucket/
```

### 2. Backup de Arquivos

```bash
# Backup do Supabase Storage
rclone sync supabase-storage: s3://your-backup-bucket/storage/
```

### 3. Restore

```bash
# Restore do banco
gunzip backup_20250101_120000.sql.gz
psql $DATABASE_URL < backup_20250101_120000.sql
```

## 🧪 Testes em Produção

### 1. Smoke Tests

```bash
# Testes básicos de funcionalidade
curl -f https://yourdomain.com/api/health
curl -f https://yourdomain.com/api/metrics
```

### 2. Load Testing

```bash
# Usando Artillery
artillery quick --count 100 --num 10 https://yourdomain.com/api/health
```

### 3. Monitoring

- Verificar logs no Sentry
- Monitorar métricas no Vercel
- Verificar health checks
- Testar funcionalidades principais

## 🚨 Troubleshooting

### Problemas Comuns

#### Build Falha

```bash
# Verificar logs
vercel logs

# Build local
npm run build
```

#### Erro de Conexão com Banco

```bash
# Verificar variáveis de ambiente
vercel env ls

# Testar conexão
psql $DATABASE_URL -c "SELECT 1;"
```

#### Erro de Redis

```bash
# Verificar conexão Redis
redis-cli -u $REDIS_URL ping
```

#### Erro de Z-API

```bash
# Verificar status da API
curl -H "Authorization: Bearer $Z_API_TOKEN" $Z_API_URL/status
```

### Logs e Debugging

```bash
# Logs do Vercel
vercel logs

# Logs do Sentry
# Acesse dashboard do Sentry

# Logs do Supabase
# Acesse dashboard do Supabase
```

## 📈 Otimização

### 1. Performance

- Otimizar imagens com Next.js Image
- Implementar cache com Redis
- Usar CDN do Vercel
- Otimizar queries do banco

### 2. SEO

```javascript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },
}
```

### 3. Monitoring

- Configurar alertas no Sentry
- Monitorar performance no Vercel
- Configurar uptime monitoring
- Implementar health checks

## 📞 Suporte

### Contato

- **Email**: deploy@whatsapp-professional.com
- **Slack**: #deployment-support
- **GitHub**: https://github.com/whatsapp-professional/deployment

### Recursos

- **Documentação**: https://docs.whatsapp-professional.com/deploy
- **Troubleshooting**: https://docs.whatsapp-professional.com/troubleshooting
- **Best Practices**: https://docs.whatsapp-professional.com/best-practices

---

_Última atualização: Setembro 2025_
