# Sistema de Monitoramento e Logs

Este documento descreve o sistema completo de monitoramento, logging e métricas implementado no WhatsApp Professional SaaS.

## 📊 Componentes do Sistema

### 1. Logging Estruturado (Winston)

**Localização**: `src/lib/logging/`

- **logger.ts**: Configuração principal do Winston com rotação de logs
- **request-logger.ts**: Logging automático de requisições HTTP
- **audit-logger.ts**: Logging de auditoria para ações de usuários

**Recursos**:
- Logs rotativos diários (14 dias de retenção)
- Separação por nível (error, warn, info, http, debug)
- Formato JSON para logs de arquivo
- Console colorido para desenvolvimento

### 2. Monitoramento de Erros (Sentry)

**Localização**: `src/lib/monitoring/sentry.ts`

**Recursos**:
- Captura automática de erros
- Performance monitoring
- Session replay
- Filtragem de erros não críticos
- Contexto customizado

### 3. Health Checks

**Localização**: `src/lib/monitoring/health-check.ts`

**Serviços monitorados**:
- Database (Supabase)
- Redis (Cache/Realtime)
- Z-API (WhatsApp)
- Serviços externos

### 4. Métricas de Performance

**Localização**: `src/lib/metrics/performance-metrics.ts`

**Métricas coletadas**:
- Web Vitals (CLS, FID, FCP, LCP, TTFB)
- Tempo de resposta de API
- Queries de banco de dados
- Eventos de tempo real
- Ações de usuário

### 5. Métricas de Negócio

**Localização**: `src/lib/metrics/business-metrics.ts`

**Métricas coletadas**:
- Registros de usuários
- Campanhas criadas/iniciadas
- Mensagens enviadas/entregues
- Contatos importados/exportados
- Atividades de equipe

## 🚀 Como Usar

### Logging Básico

```typescript
import logger from '@/lib/logging/logger'

// Logs simples
logger.info('User logged in', { userId: '123' })
logger.error('Database error', { error: error.message })
logger.warn('Rate limit exceeded', { ip: '192.168.1.1' })
```

### Logging de Auditoria

```typescript
import { auditLog } from '@/lib/logging/audit-logger'

// Logs de auditoria
auditLog.user.login('user-123')
auditLog.campaign.create('user-123', 'campaign-456', { name: 'Test Campaign' })
auditLog.team.memberAdd('user-123', 'team-789', 'member-101')
```

### Monitoramento de Performance

```typescript
import { usePerformanceMonitoring } from '@/lib/metrics/performance-metrics'

const { measureAsync, startTimer } = usePerformanceMonitoring()

// Medir operação assíncrona
const result = await measureAsync('database.query', async () => {
  return await supabase.from('users').select('*')
})

// Medir operação síncrona
const timer = startTimer('api.processing')
// ... operação ...
timer.end({ endpoint: '/api/users' })
```

### Métricas de Negócio

```typescript
import { businessMetrics } from '@/lib/metrics/business-metrics'

// Registrar métricas de negócio
businessMetrics.recordUserLogin('user-123', 'team-456')
businessMetrics.recordCampaignCreated('campaign-789', 'user-123', 'team-456')
businessMetrics.recordMessageSent('campaign-789', 'user-123', 'team-456')
```

## 📈 Dashboards

### Health Dashboard
- **URL**: `/dashboard/monitoring`
- **Funcionalidades**:
  - Status geral do sistema
  - Health checks de serviços
  - Tempo de resposta
  - Uptime

### Metrics Dashboard
- **URL**: `/dashboard/monitoring?tab=metrics`
- **Funcionalidades**:
  - Web Vitals
  - Performance de API
  - Métricas de negócio
  - Gráficos de tendências

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_token

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# App
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Configuração do Sentry

1. Crie um projeto no Sentry
2. Configure as variáveis de ambiente
3. Execute `npx @sentry/wizard -i nextjs` para configuração automática

## 📊 APIs de Monitoramento

### Health Check
```
GET /api/health
```

### Métricas
```
GET /api/metrics?type=all&teamId=123&userId=456
```

### Logs
```
GET /api/logs?type=audit&userId=123&limit=100
POST /api/logs
```

## 🛠️ Manutenção

### Limpeza de Logs
- Logs são rotativos automaticamente
- Retenção de 14 dias
- Tamanho máximo de 20MB por arquivo

### Monitoramento de Performance
- Métricas são mantidas em memória
- Limite de 1000 métricas de performance
- Limite de 5000 métricas de negócio

### Alertas
- Configure alertas no Sentry para erros críticos
- Monitore métricas de performance via dashboard
- Configure notificações para health checks falhando

## 🔍 Troubleshooting

### Logs não aparecem
1. Verifique as permissões da pasta `logs/`
2. Confirme o nível de log configurado
3. Verifique se o Winston está configurado corretamente

### Sentry não captura erros
1. Verifique o DSN configurado
2. Confirme que está em produção
3. Verifique os filtros de erro

### Health checks falhando
1. Verifique conectividade com serviços externos
2. Confirme configurações de banco de dados
3. Verifique status da Z-API

## 📚 Recursos Adicionais

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Web Vitals](https://web.dev/vitals/)
- [Health Check Patterns](https://microservices.io/patterns/observability/health-check-api.html)
