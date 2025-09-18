# Configuração do Vercel para WhatsApp Professional

## 🌍 Configuração de Timezone

### 1. Variáveis de Ambiente no Vercel

Configure as seguintes variáveis de ambiente no painel do Vercel:

```bash
# Timezone do Brasil
TZ=America/Sao_Paulo

# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Z-API
Z_API_BASE_URL=sua_url_da_z_api
Z_API_TOKEN=seu_token_da_z_api
```

### 2. Configuração do Cron Job

Para que as campanhas executem automaticamente, configure um cron job no Vercel:

1. **Acesse o painel do Vercel**
2. **Vá em Functions > Cron Jobs**
3. **Crie um novo cron job:**

```json
{
  "cron": "*/5 * * * *",
  "path": "/api/campaigns/scheduler"
}
```

**Explicação do cron:**
- `*/5 * * * *` = A cada 5 minutos
- `*/1 * * * *` = A cada 1 minuto (mais preciso)
- `0 * * * *` = A cada hora

### 3. Configuração de Timeout

O arquivo `vercel.json` já está configurado para:
- **Timeout de 5 minutos** para o scheduler
- **Timezone do Brasil** como padrão

## 🕐 Como Funciona o Sistema de Horários

### Antes (Problema):
- **Vercel roda em UTC** (Londres)
- **Brasil está em UTC-3**
- **Campanhas executavam 3 horas antes** do horário configurado

### Agora (Solução):
- **Sistema usa timezone do Brasil** (`America/Sao_Paulo`)
- **Horários são convertidos corretamente**
- **Campanhas executam no horário exato** configurado

### Exemplo Prático:

**Configuração:**
- Campanha agendada para **14:30** (horário do Brasil)
- Cron job roda a cada **5 minutos**

**Funcionamento:**
1. **14:25** - Cron executa, verifica horário (não é hora)
2. **14:30** - Cron executa, verifica horário (é hora! ✅)
3. **14:35** - Cron executa, verifica horário (já executou hoje)

## 📊 Logs com Timezone

Todos os logs agora mostram o horário do Brasil:

```
[18/09/2025 14:30:15 BR] 🕐 Verificando campanhas agendadas...
[18/09/2025 14:30:15 BR] ⏰ Horário atual do Brasil: 14:30
[18/09/2025 14:30:15 BR] 🎯 Executando campanha: Promoção Black Friday
```

## 🔧 Funções de Timezone Disponíveis

### `src/lib/timezone.ts`

```typescript
// Obter horário atual do Brasil
getCurrentBrazilTimeString() // "14:30"

// Obter data atual do Brasil
getCurrentBrazilDateString() // "2025-09-18"

// Verificar se é hora de executar
isTimeToExecute("14:30", 1) // true se estiver no horário

// Log com timestamp do Brasil
logBrazilTime("Mensagem", dados)
```

## 🚀 Deploy

1. **Configure as variáveis de ambiente** no Vercel
2. **Configure o cron job** para executar a cada 5 minutos
3. **Faça o deploy** do projeto
4. **Teste** criando uma campanha agendada

## ⚠️ Importante

- **Cron job deve rodar pelo menos a cada 5 minutos** para precisão
- **Timezone está configurado** para `America/Sao_Paulo`
- **Logs mostram horário do Brasil** para facilitar debug
- **Sistema funciona 24/7** no Vercel

## 🧪 Teste

Para testar se está funcionando:

1. **Crie uma campanha** agendada para 2 minutos no futuro
2. **Aguarde** o cron job executar
3. **Verifique os logs** no Vercel Functions
4. **Confirme** que executou no horário correto
