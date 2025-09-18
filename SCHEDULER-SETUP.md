# 🕐 Configuração do Scheduler de Campanhas

## 📋 Visão Geral

O sistema agora suporta **execução automática recorrente** de campanhas. As campanhas são executadas automaticamente todos os dias no horário configurado.

## ✨ Funcionalidades

- ✅ **Execução diária automática** no horário configurado
- ✅ **Sem horário de fim** - campanha para automaticamente após enviar para todos os grupos
- ✅ **Controle de execução** - não executa duas vezes no mesmo dia
- ✅ **Logs detalhados** para acompanhar execuções
- ✅ **Intervalos entre grupos** respeitados durante execução

## 🚀 Como Funciona

1. **Configure o horário** na campanha (ex: 17:00)
2. **Ative o agendamento** 
3. **Salve a campanha**
4. **O sistema executa automaticamente** todos os dias às 17:00
5. **Envia para todos os grupos** com intervalos configurados
6. **Para automaticamente** após completar
7. **Aguarda o próximo dia** para executar novamente

## ⚙️ Configuração do Scheduler

### Windows (Recomendado)

1. **Execute o script de configuração:**
   ```bash
   scripts\setup-scheduler.bat
   ```

2. **Verifique se a tarefa foi criada:**
   ```bash
   schtasks /query /tn "CampaignScheduler"
   ```

### Linux/Mac

1. **Adicione ao crontab:**
   ```bash
   crontab -e
   ```

2. **Adicione a linha:**
   ```bash
   * * * * * cd /caminho/para/projeto && node scripts/scheduler.js
   ```

## 🧪 Testando o Scheduler

### Teste Manual
```bash
node test-scheduler.js
```

### Teste da API
```bash
curl -X POST http://localhost:3000/api/campaigns/scheduler
```

## 📊 Monitoramento

### Logs do Scheduler
O scheduler gera logs detalhados:
- ✅ Campanhas encontradas
- ⏰ Horários verificados
- 🚀 Execuções iniciadas
- 📊 Resultados das execuções

### Tabela de Execuções
Todas as execuções são registradas na tabela `campaign_executions`:
- `status`: pending, running, completed, failed
- `executed_at`: data/hora da execução
- `result`: resultado detalhado
- `error_message`: mensagem de erro (se houver)

## 🔧 Estrutura do Banco

### Tabela `campaign_schedules`
- `start_time`: Horário de execução (HH:MM)
- `is_recurring`: Sempre true para execução diária
- `last_executed_at`: Última execução
- `days_of_week`: Dias da semana (1,2,3,4,5,6,7 = todos os dias)

### Tabela `campaign_executions`
- `campaign_id`: ID da campanha
- `schedule_id`: ID do agendamento
- `status`: Status da execução
- `result`: Resultado detalhado
- `executed_at`: Data/hora da execução

## 🚨 Solução de Problemas

### Scheduler não está executando
1. Verifique se a tarefa está ativa:
   ```bash
   schtasks /query /tn "CampaignScheduler"
   ```

2. Teste manualmente:
   ```bash
   node test-scheduler.js
   ```

### Campanha não executa no horário
1. Verifique se o agendamento está ativo
2. Verifique se a campanha está ativa
3. Verifique se já foi executada hoje
4. Verifique os logs do scheduler

### Erro de permissão
1. Execute o script como administrador
2. Verifique se o Node.js está no PATH
3. Verifique se o projeto está acessível

## 📝 Exemplo de Uso

1. **Criar campanha** com nome "Promoção Diária"
2. **Configurar horário** para 17:00
3. **Selecionar grupos** (ex: 3 grupos)
4. **Configurar intervalo** de 30 segundos entre grupos
5. **Ativar agendamento**
6. **Salvar campanha**

**Resultado:**
- Todos os dias às 17:00
- Grupo 1: mensagem enviada imediatamente
- Grupo 2: mensagem enviada após 30 segundos
- Grupo 3: mensagem enviada após mais 30 segundos
- Campanha para automaticamente
- Aguarda o próximo dia

## 🎯 Próximos Passos

- [ ] Interface para visualizar execuções
- [ ] Relatórios de execução
- [ ] Notificações de falha
- [ ] Pausar/retomar agendamentos
- [ ] Múltiplos horários por campanha
