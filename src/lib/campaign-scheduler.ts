import { createClient } from '@supabase/supabase-js';
import { CampaignSender } from './campaign-sender';

interface CampaignSchedule {
  id: string;
  campaign_id: string;
  schedule_name: string;
  start_time: string;
  days_of_week: string;
  is_active: boolean;
}

interface CampaignData {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  campaign_schedules?: CampaignSchedule[];
}

export class CampaignScheduler {
  private supabase: ReturnType<typeof createClient>;
  private campaignSender: CampaignSender;

  constructor() {
    // Usar service role key para ter acesso completo aos dados
    console.log('🔧 [SCHEDULER] Inicializando cliente Supabase...');
    console.log('🔧 [SCHEDULER] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Definida' : 'Não definida');
    console.log('🔧 [SCHEDULER] Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Definida' : 'Não definida');
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    console.log('🔧 [SCHEDULER] Cliente Supabase inicializado:', typeof this.supabase);
    console.log('🔧 [SCHEDULER] Método from disponível:', typeof this.supabase.from);
    
    this.campaignSender = new CampaignSender();
  }

  /**
   * Verificar e executar campanhas agendadas
   */
  async checkAndExecuteScheduledCampaigns(): Promise<void> {
    try {
      console.log('🕐 [SCHEDULER] Verificando campanhas agendadas...');

      // Usar timezone do Brasil para verificação
      const { getCurrentBrazilTimeString, getCurrentBrazilDateString, logBrazilTime } = await import('@/lib/timezone');
      
      const currentTime = getCurrentBrazilTimeString(); // HH:MM no timezone do Brasil
      const currentDate = getCurrentBrazilDateString(); // YYYY-MM-DD no timezone do Brasil
      const now = new Date();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Domingo = 7, Segunda = 1, etc.

      logBrazilTime(`📅 [SCHEDULER] Data atual: ${currentDate}`);
      logBrazilTime(`⏰ [SCHEDULER] Hora atual: ${currentTime}`);
      logBrazilTime(`📆 [SCHEDULER] Dia da semana: ${currentDay}`);

      // Buscar campanhas ativas com agendamentos
      console.log('🔍 [SCHEDULER] Buscando campanhas ativas...');
      const { data: campaigns, error } = await this.supabase
        .from('campaigns')
        .select(`
          *,
          campaign_schedules (
            id,
            schedule_name,
            start_time,
            days_of_week,
            is_active
          )
        `)
        .eq('status', 'active');

      if (error) {
        console.error('❌ [SCHEDULER] Erro ao buscar campanhas:', error);
        return;
      }

      if (!campaigns || campaigns.length === 0) {
        console.log('ℹ️ [SCHEDULER] Nenhuma campanha ativa encontrada');
        return;
      }

      console.log(`📊 [SCHEDULER] Encontradas ${campaigns.length} campanhas ativas`);
      
      // Log detalhado de cada campanha
      for (const campaign of campaigns as CampaignData[]) {
        console.log(`📋 [SCHEDULER] Campanha: ${campaign.name} (${campaign.id})`);
        console.log(`📋 [SCHEDULER] Status: ${campaign.status}`);
        console.log(`📋 [SCHEDULER] Agendamentos: ${campaign.campaign_schedules?.length || 0}`);
      }

      for (const campaign of campaigns as CampaignData[]) {
        await this.processCampaign(campaign, currentTime, currentDay);
      }

    } catch (error) {
      console.error('❌ [SCHEDULER] Erro no scheduler:', error);
    }
  }

  /**
   * Processar uma campanha específica
   */
  private async processCampaign(campaign: CampaignData, currentTime: string, currentDay: number): Promise<void> {
    try {
      console.log(`\n🎯 Processando campanha: ${campaign.name} (${campaign.id})`);

      const schedules = campaign.campaign_schedules || [];
      const activeSchedules = schedules.filter((s: CampaignSchedule) => s.is_active);

      if (activeSchedules.length === 0) {
        console.log('ℹ️ Nenhum agendamento ativo para esta campanha');
        return;
      }

      console.log(`📅 ${activeSchedules.length} agendamentos ativos encontrados`);

      for (const schedule of activeSchedules) {
        if (await this.shouldExecuteSchedule(schedule, currentTime, currentDay)) {
          console.log(`✅ Agendamento "${schedule.schedule_name}" deve ser executado agora!`);
          
          // Verificar se já foi executado hoje
          const alreadyExecuted = await this.checkIfAlreadyExecutedToday(campaign.id);
          
          if (!alreadyExecuted) {
            console.log(`🚀 Executando campanha ${campaign.name}...`);
            
            // Marcar como 'running' antes de iniciar
            await this.logScheduleExecution(campaign.id, 'running', 'Iniciando execução da campanha');
            
            const result = await this.campaignSender.sendCampaign(campaign.id);
            
            if (result.success) {
              console.log(`✅ Campanha executada com sucesso!`);
              await this.logScheduleExecution(campaign.id, 'success', result.message);
            } else {
              console.error(`❌ Erro ao executar campanha: ${result.message}`);
              await this.logScheduleExecution(campaign.id, 'error', result.message);
            }
          } else {
            console.log('ℹ️ Campanha já foi executada hoje para este agendamento');
          }
        } else {
          console.log(`⏰ Agendamento "${schedule.schedule_name}" não deve ser executado agora`);
        }
      }

    } catch (error) {
      console.error(`❌ Erro ao processar campanha ${campaign.name}:`, error);
    }
  }

  /**
   * Verificar se um agendamento deve ser executado
   */
  private async shouldExecuteSchedule(schedule: CampaignSchedule, currentTime: string, currentDay: number): Promise<boolean> {
    try {
      // Verificar dia da semana
      const allowedDays = schedule.days_of_week.split(',').map(d => parseInt(d.trim()));
      if (!allowedDays.includes(currentDay)) {
        return false;
      }

      // Verificar horário usando timezone do Brasil
      const { isTimeToExecute, logBrazilTime } = await import('@/lib/timezone');
      
      const startTime = schedule.start_time.slice(0, 5); // Remove segundos se existirem
      
      logBrazilTime(`🔍 Verificando agendamento: ${schedule.schedule_name || 'Sem nome'}`);
      logBrazilTime(`⏰ Horário agendado: ${startTime}`);
      logBrazilTime(`⏰ Horário atual do Brasil: ${currentTime}`);
      logBrazilTime(`📅 Dias válidos: ${schedule.days_of_week}`);
      
      // Verificar se é o horário correto usando timezone do Brasil
      if (!isTimeToExecute(startTime, 1)) { // Tolerância de 1 minuto
        logBrazilTime(`⏭️ Horário não confere (${startTime} vs ${currentTime}), pulando...`);
        return false;
      }

      logBrazilTime(`✅ Horário confere! Deve executar agora.`);
      return true;

    } catch (error) {
      console.error('Erro ao verificar agendamento:', error);
      return false;
    }
  }

  /**
   * Converter horário HH:MM para minutos
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Verificar se a campanha já foi executada hoje para este agendamento
   */
  private async checkIfAlreadyExecutedToday(campaignId: string): Promise<boolean> {
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD

      console.log(`🔍 Verificando se campanha ${campaignId} já foi executada hoje (${todayString})`);

      const { data, error } = await this.supabase
        .from('campaign_execution_logs')
        .select('id, status')
        .eq('campaign_id', campaignId)
        .eq('execution_date', todayString)
        .in('status', ['success', 'running'])
        .limit(1);

      if (error) {
        console.error('❌ Erro ao verificar execução:', error);
        return false;
      }

      const alreadyExecuted = data && data.length > 0;
      console.log(`📊 Resultado da verificação: ${alreadyExecuted ? 'JÁ EXECUTADA' : 'NÃO EXECUTADA'}`);
      
      if (alreadyExecuted) {
        console.log(`ℹ️ Campanha já foi executada hoje com status: ${data[0].status}`);
      }

      return alreadyExecuted;

    } catch (error) {
      console.error('❌ Erro ao verificar execução:', error);
      return false;
    }
  }

  /**
   * Registrar execução do agendamento
   */
  private async logScheduleExecution(campaignId: string, status: 'success' | 'error', message: string): Promise<void> {
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD

      console.log(`📝 Registrando execução da campanha ${campaignId} com status: ${status}`);

      // Verificar se já existe um log para hoje
      const { data: existingLog } = await this.supabase
        .from('campaign_execution_logs')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('execution_date', todayString)
        .limit(1);

      if (existingLog && existingLog.length > 0) {
        // Atualizar log existente
        const { error: updateError } = await this.supabase
          .from('campaign_execution_logs')
          .update({
            status,
            message,
            error_message: status === 'error' ? message : null,
            execution_time: new Date().toISOString()
          })
          .eq('id', existingLog[0].id);

        if (updateError) {
          console.error('❌ Erro ao atualizar log de execução:', updateError);
        } else {
          console.log('✅ Log de execução atualizado com sucesso');
        }
      } else {
        // Criar novo log
        const { error: insertError } = await this.supabase
          .from('campaign_execution_logs')
          .insert({
            campaign_id: campaignId,
            execution_date: todayString,
            execution_time: new Date().toISOString(),
            status,
            message,
            error_message: status === 'error' ? message : null
          });

        if (insertError) {
          console.error('❌ Erro ao criar log de execução:', insertError);
        } else {
          console.log('✅ Log de execução criado com sucesso');
        }
      }

    } catch (error) {
      console.error('❌ Erro ao registrar execução:', error);
    }
  }

  /**
   * Iniciar o scheduler (para ser chamado em um cron job)
   */
  async startScheduler(): Promise<void> {
    console.log('🚀 Iniciando Campaign Scheduler...');
    
    // Executar imediatamente
    await this.checkAndExecuteScheduledCampaigns();
    
    // Configurar para executar a cada minuto
    setInterval(async () => {
      await this.checkAndExecuteScheduledCampaigns();
    }, 60000); // 60 segundos

    console.log('✅ Campaign Scheduler iniciado! Verificando a cada minuto.');
  }

  /**
   * Executar campanha manualmente
   */
  async executeCampaignManually(campaignId: string): Promise<{ success: boolean; message: string; stats?: Record<string, unknown> }> {
    try {
      console.log(`🎯 Executando campanha manualmente: ${campaignId}`);
      
      const result = await this.campaignSender.sendCampaign(campaignId);
      
      if (result.success) {
        console.log(`✅ Campanha executada com sucesso!`);
      } else {
        console.error(`❌ Erro ao executar campanha: ${result.message}`);
      }
      
      return result;

    } catch (error) {
      console.error('❌ Erro ao executar campanha manualmente:', error);
      return { success: false, message: `Erro interno: ${error}` };
    }
  }
}

