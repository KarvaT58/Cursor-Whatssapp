import { createClient } from '@/lib/supabase/server';
import { CampaignSender } from './campaign-sender';

interface CampaignSchedule {
  id: string;
  campaign_id: string;
  schedule_name: string;
  start_time: string;
  end_time: string;
  days_of_week: string;
  is_active: boolean;
}

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
}

export class CampaignScheduler {
  private supabase: any;
  private campaignSender: CampaignSender;

  constructor() {
    // Usar service role key para ter acesso completo aos dados
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.campaignSender = new CampaignSender();
  }

  /**
   * Verificar e executar campanhas agendadas
   */
  async checkAndExecuteScheduledCampaigns(): Promise<void> {
    try {
      console.log('🕐 Verificando campanhas agendadas...');

      // Usar timezone do Brasil para verificação
      const { getCurrentBrazilTimeString, getCurrentBrazilDateString, logBrazilTime } = await import('@/lib/timezone');
      
      const currentTime = getCurrentBrazilTimeString(); // HH:MM no timezone do Brasil
      const currentDate = getCurrentBrazilDateString(); // YYYY-MM-DD no timezone do Brasil
      const now = new Date();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Domingo = 7, Segunda = 1, etc.

      logBrazilTime(`📅 Data atual: ${currentDate}`);
      logBrazilTime(`⏰ Hora atual: ${currentTime}`);
      logBrazilTime(`📆 Dia da semana: ${currentDay}`);

      // Buscar campanhas ativas com agendamentos
      const { data: campaigns, error } = await this.supabase
        .from('campaigns')
        .select(`
          *,
          campaign_schedules (
            id,
            schedule_name,
            start_time,
            end_time,
            days_of_week,
            is_active
          )
        `)
        .eq('status', 'active');

      if (error) {
        console.error('❌ Erro ao buscar campanhas:', error);
        return;
      }

      if (!campaigns || campaigns.length === 0) {
        console.log('ℹ️ Nenhuma campanha ativa encontrada');
        return;
      }

      console.log(`📊 Encontradas ${campaigns.length} campanhas ativas`);

      for (const campaign of campaigns) {
        await this.processCampaign(campaign, currentTime, currentDay);
      }

    } catch (error) {
      console.error('❌ Erro no scheduler:', error);
    }
  }

  /**
   * Processar uma campanha específica
   */
  private async processCampaign(campaign: any, currentTime: string, currentDay: number): Promise<void> {
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
          const alreadyExecuted = await this.checkIfAlreadyExecutedToday(campaign.id, schedule.id);
          
          if (!alreadyExecuted) {
            console.log(`🚀 Executando campanha ${campaign.name}...`);
            
            const result = await this.campaignSender.sendCampaign(campaign.id);
            
            if (result.success) {
              console.log(`✅ Campanha executada com sucesso!`);
              await this.logScheduleExecution(campaign.id, schedule.id, 'success', result.message);
            } else {
              console.error(`❌ Erro ao executar campanha: ${result.message}`);
              await this.logScheduleExecution(campaign.id, schedule.id, 'error', result.message);
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
  private async checkIfAlreadyExecutedToday(campaignId: string, scheduleId: string): Promise<boolean> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const { data, error } = await this.supabase
        .from('campaign_sends')
        .select('id')
        .eq('campaign_id', campaignId)
        .gte('send_time', startOfDay.toISOString())
        .lt('send_time', endOfDay.toISOString())
        .limit(1);

      if (error) {
        console.error('Erro ao verificar execução:', error);
        return false;
      }

      return data && data.length > 0;

    } catch (error) {
      console.error('Erro ao verificar execução:', error);
      return false;
    }
  }

  /**
   * Registrar execução do agendamento
   */
  private async logScheduleExecution(campaignId: string, scheduleId: string, status: 'success' | 'error', message: string): Promise<void> {
    try {
      // Aqui você pode criar uma tabela específica para logs de agendamento
      // Por enquanto, vamos usar a tabela campaign_sends
      await this.supabase
        .from('campaign_sends')
        .insert({
          campaign_id: campaignId,
          group_id: null, // Será preenchido pelo campaign sender
          send_status: status === 'success' ? 'sent' : 'failed',
          send_time: new Date().toISOString(),
          scheduled_time: new Date().toISOString(),
          error_message: status === 'error' ? message : null
        });

    } catch (error) {
      console.error('Erro ao registrar execução:', error);
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
  async executeCampaignManually(campaignId: string): Promise<{ success: boolean; message: string; stats?: any }> {
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

