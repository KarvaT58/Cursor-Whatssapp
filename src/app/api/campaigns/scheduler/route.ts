import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CampaignSender } from '@/lib/campaign-sender';
import { getCurrentBrazilTimeString, getCurrentBrazilDateString, isTimeToExecute, logBrazilTime } from '@/lib/timezone';

export async function POST() {
  try {
    console.log('🕐 Verificando campanhas agendadas...');
    
    // Usar service role key para ter acesso completo aos dados
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    console.log('🔧 Supabase client criado:', !!supabase);
    
    // Buscar agendamentos ativos primeiro
    console.log('🔍 Buscando agendamentos ativos...');
    const { data: schedules, error: schedulesError } = await supabase
      .from('campaign_schedules')
      .select('*')
      .eq('is_active', true)
      .eq('is_recurring', true);

    console.log('📊 Agendamentos encontrados:', schedules);

    if (schedulesError) {
      console.error('Erro ao buscar agendamentos:', schedulesError);
      return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
    }

    if (!schedules || schedules.length === 0) {
      console.log('📭 Nenhum agendamento ativo encontrado');
      return NextResponse.json({ message: 'Nenhuma campanha agendada' });
    }

    // Buscar campanhas ativas para os agendamentos encontrados
    const campaignIds = schedules.map(s => s.campaign_id);
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, name, status, global_interval')
      .in('id', campaignIds)
      .eq('status', 'active');

    console.log('📊 Campanhas ativas encontradas:', campaigns);

    if (campaignsError) {
      console.error('Erro ao buscar campanhas:', campaignsError);
      return NextResponse.json({ error: 'Erro ao buscar campanhas' }, { status: 500 });
    }

    // Filtrar agendamentos que têm campanhas ativas
    const activeSchedules = schedules.filter(schedule => 
      campaigns.some(campaign => campaign.id === schedule.campaign_id)
    );

    console.log('📊 Agendamentos com campanhas ativas:', activeSchedules);

    if (!activeSchedules || activeSchedules.length === 0) {
      console.log('📭 Nenhuma campanha agendada encontrada');
      return NextResponse.json({ message: 'Nenhuma campanha agendada' });
    }

    console.log(`📋 Encontradas ${activeSchedules.length} campanhas agendadas`);

    // Usar horário do Brasil
    const currentTime = getCurrentBrazilTimeString(); // HH:MM no timezone do Brasil
    const currentDate = getCurrentBrazilDateString(); // YYYY-MM-DD no timezone do Brasil
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    logBrazilTime('⏰ Horário atual do Brasil:', currentTime);
    logBrazilTime('📅 Data atual do Brasil:', currentDate);
    logBrazilTime('📅 Dia da semana:', currentDay);
    
    const executionsToRun: Array<{ schedule: Record<string, unknown>; campaign: Record<string, unknown> }> = [];

    for (const schedule of activeSchedules) {
      const campaign = campaigns.find(c => c.id === schedule.campaign_id);
      
      if (!campaign) {
        logBrazilTime(`⚠️ Campanha não encontrada para agendamento: ${schedule.schedule_name || 'Sem nome'}`);
        continue;
      }
      
      logBrazilTime(`🔍 Verificando agendamento: ${schedule.schedule_name || 'Sem nome'}`);
      logBrazilTime(`⏰ Horário agendado: ${schedule.start_time}`);
      logBrazilTime(`⏰ Horário atual do Brasil: ${currentTime}`);
      logBrazilTime(`📅 Dias válidos: ${schedule.days_of_week}`);
      
      // Verificar se é o horário correto usando timezone do Brasil
      const scheduleTime = schedule.start_time.slice(0, 5); // Remove segundos se existirem
      if (!isTimeToExecute(scheduleTime, 1)) { // Tolerância de 1 minuto
        logBrazilTime(`⏭️ Horário não confere (${scheduleTime} vs ${currentTime}), pulando...`);
        continue;
      }

      // Verificar se é um dia válido
      const validDays = schedule.days_of_week.split(',').map(Number);
      if (!validDays.includes(currentDay)) {
        continue;
      }

      // Verificar se hoje está bloqueado (data específica ou dia da semana)
      const today = currentDate; // Usar data do Brasil
      const dayOfWeek = now.getDay();
      
      const { data: blockedToday } = await supabase
        .from('campaign_blocked_dates')
        .select('id, blocking_type, blocking_value')
        .eq('campaign_id', campaign.id)
        .or(`and(blocking_type.eq.specific,blocked_date.eq.${today}),and(blocking_type.eq.day_of_week,blocking_value.eq.${dayOfWeek})`)
        .limit(1);

      if (blockedToday && blockedToday.length > 0) {
        const blockType = blockedToday[0].blocking_type;
        const blockValue = blockedToday[0].blocking_value;
        
        let blockReason = '';
        if (blockType === 'specific') {
          blockReason = `data específica (${today})`;
        } else if (blockType === 'day_of_week') {
          const dayNames = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
          blockReason = `todas as ${dayNames[blockValue]}s`;
        }
        
        logBrazilTime(`🚫 Campanha ${campaign.name} está bloqueada para hoje (${today}) - ${blockReason}`);
        continue;
      }

      // Verificar se já foi executada hoje
      const { data: todayExecution } = await supabase
        .from('campaign_executions')
        .select('id')
        .eq('campaign_id', campaign.id)
        .gte('executed_at', `${today}T00:00:00`)
        .lte('executed_at', `${today}T23:59:59`)
        .eq('status', 'completed')
        .limit(1);

      if (todayExecution && todayExecution.length > 0) {
        logBrazilTime(`⏭️ Campanha ${campaign.name} já foi executada hoje`);
        continue;
      }

      executionsToRun.push({ schedule, campaign });
    }

    if (executionsToRun.length === 0) {
      logBrazilTime('📭 Nenhuma campanha para executar agora');
      return NextResponse.json({ message: 'Nenhuma campanha para executar' });
    }

    logBrazilTime(`🚀 Executando ${executionsToRun.length} campanhas...`);

    const results = [];

    for (const { schedule, campaign } of executionsToRun) {
      try {
        // Criar registro de execução
        const { data: execution, error: executionError } = await supabase
          .from('campaign_executions')
          .insert({
            campaign_id: campaign.id,
            schedule_id: schedule.id,
            status: 'running'
          })
          .select()
          .single();

        if (executionError) {
          logBrazilTime(`❌ Erro ao criar execução para ${campaign.name}:`, executionError);
          continue;
        }

        logBrazilTime(`🎯 Executando campanha: ${campaign.name}`);

        // Executar campanha
        const campaignSender = new CampaignSender();
        const result = await campaignSender.sendCampaign(campaign.id as string);

        // Atualizar status da execução
        await supabase
          .from('campaign_executions')
          .update({
            status: result.success ? 'completed' : 'failed',
            result: result,
            error_message: result.success ? null : result.message
          })
          .eq('id', execution.id);

        // Atualizar último horário de execução
        await supabase
          .from('campaign_schedules')
          .update({
            last_executed_at: now.toISOString()
          })
          .eq('id', schedule.id);

        results.push({
          campaign: campaign.name,
          success: result.success,
          message: result.message
        });

        logBrazilTime(`✅ Campanha ${campaign.name} executada: ${result.success ? 'Sucesso' : 'Falha'}`);

      } catch (error) {
        logBrazilTime(`❌ Erro ao executar campanha ${campaign.name}:`, error);
        
        // Atualizar execução como falha
        await supabase
          .from('campaign_executions')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Erro desconhecido'
          })
          .eq('campaign_id', campaign.id)
          .eq('status', 'running');

        results.push({
          campaign: campaign.name,
          success: false,
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    return NextResponse.json({
      message: `Executadas ${results.length} campanhas`,
      results
    });

  } catch (error) {
    logBrazilTime('❌ Erro no scheduler:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
