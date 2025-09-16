# Sistema de Processamento de Campanhas

Este documento descreve o sistema completo de processamento de campanhas implementado, incluindo rate limiting, agendamento, retry logic e monitoramento de progresso.

## Arquitetura

O sistema utiliza BullMQ com Redis para gerenciar filas de processamento assíncrono, garantindo escalabilidade e confiabilidade no envio de mensagens em massa.

### Componentes Principais

1. **Queue Manager** (`queue-manager.ts`)
   - Gerencia todas as filas do sistema
   - Define tipos de jobs e processadores
   - Implementa lógica de processamento

2. **Rate Limiter** (`rate-limiter.ts`)
   - Controla taxa de envio de mensagens
   - Previne spam e respeita limites da API
   - Implementa diferentes tipos de rate limiting

3. **Workers** (`workers/`)
   - Processam jobs das filas
   - Gerenciam concorrência e recursos
   - Implementam retry logic

4. **Monitoramento** (`hooks/` e `components/`)
   - Acompanha progresso em tempo real
   - Monitora rate limits
   - Fornece feedback visual

## Filas Implementadas

### 1. Campaign Messages (`campaign-messages`)

- **Propósito**: Envio individual de mensagens de campanha
- **Concorrência**: 5 mensagens simultâneas
- **Retry**: 3 tentativas com backoff exponencial
- **Rate Limiting**: WhatsApp (20/min) + Campanha (100/min)

### 2. Campaign Notifications (`campaign-notifications`)

- **Propósito**: Notificações de status de campanha
- **Concorrência**: 3 notificações simultâneas
- **Retry**: 2 tentativas

### 3. Message Retry (`message-retry`)

- **Propósito**: Retry de mensagens falhadas
- **Concorrência**: 3 retries simultâneos
- **Retry**: 5 tentativas com backoff exponencial
- **Rate Limiting**: Retry (10/5min) + WhatsApp

### 4. Campaign Scheduler (`campaign-scheduler`)

- **Propósito**: Agendamento de campanhas
- **Concorrência**: 2 campanhas simultâneas
- **Retry**: 3 tentativas

## Rate Limiting

### Tipos de Rate Limiting

1. **WhatsApp Rate Limiter**
   - 20 mensagens por minuto por instância
   - Previne bloqueio da conta WhatsApp

2. **Campaign Rate Limiter**
   - 100 mensagens de campanha por minuto por usuário
   - Controla volume total de campanhas

3. **API Rate Limiter**
   - 1000 requisições por minuto por usuário
   - Protege a API contra abuso

4. **Retry Rate Limiter**
   - 10 retries por 5 minutos por mensagem
   - Previne loops infinitos de retry

### Implementação

```typescript
// Verificação de rate limit antes do envio
const [whatsappLimit, campaignLimit] = await Promise.all([
  whatsappRateLimiter.checkLimit(instanceId),
  campaignRateLimiter.checkLimit(userId),
])

if (!whatsappLimit.allowed) {
  // Reschedule job com delay
  await job.moveToDelayed(Date.now() + retryAfter * 1000)
  return
}
```

## Agendamento de Campanhas

### Funcionalidades

- Agendamento para data/hora específica
- Verificação automática de tempo
- Reschedule automático se necessário
- Delay entre mensagens (1 segundo)

### Implementação

```typescript
// Agendamento de campanha
if (campaign.status === 'scheduled' && campaign.scheduled_at) {
  const scheduledTime = new Date(campaign.scheduled_at)
  const delay = scheduledTime.getTime() - Date.now()

  await schedulerQueue.add(
    'schedule-campaign',
    {
      campaignId: campaign.id,
      scheduledAt: campaign.scheduled_at,
      userId: user.id,
    },
    { delay }
  )
}
```

## Retry Logic

### Estratégia de Retry

1. **Backoff Exponencial**: Delay aumenta exponencialmente
2. **Rate Limit Awareness**: Respeita limites durante retry
3. **Máximo de Tentativas**: Evita loops infinitos
4. **Logging Detalhado**: Rastreamento de falhas

### Implementação

```typescript
// Configuração de retry no job
defaultJobOptions: {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
}
```

## Monitoramento de Progresso

### Métricas Rastreadas

- Mensagens enviadas
- Mensagens falhadas
- Mensagens entregues
- Mensagens lidas
- Taxa de sucesso
- Tempo estimado de conclusão

### Real-time Updates

- WebSocket para atualizações em tempo real
- Polling como fallback
- Componentes React para visualização

### Implementação

```typescript
// Hook para monitoramento
const { progress, isLoading, error } = useCampaignProgress({
  campaignId,
  refreshInterval: 5000,
})
```

## Configuração

### Variáveis de Ambiente

```env
REDIS_URL=redis://localhost:6379
# ou para Upstash
UPSTASH_REDIS_REST_URL=https://...
```

### Inicialização dos Workers

```typescript
import { startAllWorkers } from '@/lib/workers/worker-manager'

// Iniciar todos os workers
startAllWorkers()
```

## Monitoramento e Debugging

### Logs

- Logs detalhados para cada job
- Rastreamento de rate limits
- Monitoramento de falhas

### Métricas

- Progresso de campanhas
- Status de rate limits
- Performance dos workers

### Componentes de UI

- `CampaignProgress`: Progresso individual
- `RateLimitStatus`: Status dos limites
- `MultipleCampaignProgress`: Múltiplas campanhas

## Boas Práticas

1. **Rate Limiting**: Sempre verificar limites antes do envio
2. **Error Handling**: Implementar retry logic robusto
3. **Monitoring**: Acompanhar progresso em tempo real
4. **Resource Management**: Controlar concorrência adequadamente
5. **Logging**: Manter logs detalhados para debugging

## Troubleshooting

### Problemas Comuns

1. **Rate Limit Exceeded**
   - Verificar configurações de rate limiting
   - Ajustar delays entre mensagens

2. **Jobs Stuck**
   - Verificar status do Redis
   - Reiniciar workers se necessário

3. **Memory Issues**
   - Ajustar concorrência dos workers
   - Limitar número de jobs em memória

### Comandos Úteis

```bash
# Verificar status do Redis
redis-cli ping

# Monitorar filas
redis-cli monitor

# Limpar filas (cuidado!)
redis-cli flushall
```
