import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API-CAMPAIGNS] Iniciando busca de campanhas...');
    const supabase = await createClient();
    
    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    console.log('🔍 [API-CAMPAIGNS] Usuário autenticado:', user ? `${user.email} (${user.id})` : 'NENHUM');
    
    if (authError) {
      console.error('🔍 [API-CAMPAIGNS] Erro de autenticação:', authError);
      return NextResponse.json({ error: 'Erro de autenticação' }, { status: 401 });
    }
    
    if (!user) {
      console.log('🔍 [API-CAMPAIGNS] Usuário não encontrado, retornando 401');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    console.log('🔍 [API-CAMPAIGNS] Buscando campanhas no banco...');
    
    // Buscar campanhas com estatísticas
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_sends (
          send_status,
          send_time
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('🔍 [API-CAMPAIGNS] Erro ao buscar campanhas:', error);
      return NextResponse.json({ error: 'Erro ao buscar campanhas' }, { status: 500 });
    }

    console.log('🔍 [API-CAMPAIGNS] Campanhas encontradas:', campaigns?.length || 0);

    // Calcular estatísticas para cada campanha
    const campaignsWithStats = campaigns?.map(campaign => {
      const sends = campaign.campaign_sends || [];
      const stats = {
        sent: sends.filter((s: any) => s.send_status === 'sent').length,
        delivered: sends.filter((s: any) => s.send_status === 'delivered').length,
        read: sends.filter((s: any) => s.send_status === 'read').length,
        failed: sends.filter((s: any) => s.send_status === 'failed').length,
        total: sends.length
      };

      return {
        ...campaign,
        stats,
        campaign_sends: undefined // Remover dados desnecessários
      };
    });

    console.log('🔍 [API-CAMPAIGNS] Retornando campanhas com estatísticas:', campaignsWithStats?.length || 0);
    return NextResponse.json(campaignsWithStats);
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO DA CRIAÇÃO DE CAMPANHA ===');
    const supabase = await createClient();
    
    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    console.log('Resultado da autenticação:', { user: user?.id, authError });
    
    if (authError || !user) {
      console.log('Erro de autenticação:', authError);
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const body = await request.json();
    console.log('Body recebido:', body);
    
    const {
      name,
      description,
      instance_id,
      instanceId, // Aceitar ambos os formatos
      send_order,
      main_message,
      message, // Aceitar ambos os formatos
      selected_groups,
      schedules,
      messages,
      media,
      group_intervals,
      global_interval
    } = body;
    
    // Usar instanceId se instance_id não estiver disponível
    const finalInstanceId = instance_id || instanceId;
    // Usar message se main_message não estiver disponível, com fallback para string vazia
    const finalMessage = main_message || message || '';

    // Validar dados obrigatórios
    if (!name || !finalInstanceId) {
      return NextResponse.json({ error: 'Nome e instância são obrigatórios' }, { status: 400 });
    }

    // Criar campanha principal
    console.log('Criando campanha principal...');
    const campaignData = {
      name,
      description,
      instance_id: finalInstanceId,
      send_order: send_order || 'text_first',
      message: finalMessage,
      status: 'draft',
      user_id: user.id,
      created_by: user.id,
      global_interval: global_interval || 0
    };
    
    console.log('Dados da campanha:', campaignData);
    
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();

    console.log('Resultado da criação da campanha:', { campaign, campaignError });

    if (campaignError) {
      console.error('Erro ao criar campanha:', campaignError);
      return NextResponse.json({ error: 'Erro ao criar campanha', details: campaignError.message }, { status: 500 });
    }

    // Criar mensagens variáveis
    let createdMessages: any[] = [];
    if (messages && messages.length > 0) {
      const campaignMessages = messages.map((msg: any) => ({
        campaign_id: campaign.id,
        message_text: msg.message_text,
        message_order: msg.message_order,
        is_active: msg.is_active
      }));

      const { data: insertedMessages, error: messagesError } = await supabase
        .from('campaign_messages')
        .insert(campaignMessages)
        .select();

      if (messagesError) {
        console.error('Erro ao criar mensagens:', messagesError);
        // Continuar mesmo com erro nas mensagens
      } else {
        createdMessages = insertedMessages || [];
        console.log('Mensagens criadas:', createdMessages.length);
      }
    }

    // Criar mídias associadas às mensagens
    if (media && media.length > 0) {
      const campaignMedia = media.map((med: any) => {
        // Encontrar a mensagem correspondente baseada na ordem
        const correspondingMessage = createdMessages.find(msg => msg.message_order === med.media_order);
        
        console.log(`🔗 Associando mídia ${med.media_name} (order: ${med.media_order}) com mensagem:`, correspondingMessage?.id || 'NENHUMA');
        
        return {
          campaign_id: campaign.id,
          message_id: correspondingMessage?.id || null,
          media_type: med.media_type,
          media_url: med.media_url,
          media_name: med.media_name,
          media_size: med.media_size,
          media_mime_type: med.media_mime_type,
          media_order: med.media_order,
          is_active: med.is_active
        };
      });

      const { error: mediaError } = await supabase
        .from('campaign_media')
        .insert(campaignMedia);

      if (mediaError) {
        console.error('Erro ao criar mídias:', mediaError);
        // Continuar mesmo com erro nas mídias
      } else {
        console.log('Mídias criadas:', campaignMedia.length);
      }
    }

    // Criar agendamentos
    if (schedules && schedules.length > 0) {
      const campaignSchedules = schedules.map((schedule: any) => ({
        campaign_id: campaign.id,
        schedule_name: schedule.schedule_name,
        start_time: schedule.start_time,
        days_of_week: schedule.days_of_week || '1,2,3,4,5,6,7',
        is_active: schedule.is_active,
        is_recurring: true
      }));

      const { error: schedulesError } = await supabase
        .from('campaign_schedules')
        .insert(campaignSchedules);

      if (schedulesError) {
        console.error('Erro ao criar agendamentos:', schedulesError);
        // Continuar mesmo com erro nos agendamentos
      }
    }

    // Criar intervalos de grupo
    if (group_intervals && Object.keys(group_intervals).length > 0) {
      const campaignGroupIntervals = Object.entries(group_intervals).map(([groupId, interval]) => ({
        campaign_id: campaign.id,
        group_id: groupId,
        interval_minutes: interval as number
      }));

      const { error: intervalsError } = await supabase
        .from('campaign_group_intervals')
        .insert(campaignGroupIntervals);

      if (intervalsError) {
        console.error('Erro ao criar intervalos de grupo:', intervalsError);
        // Continuar mesmo com erro nos intervalos
      }
    }

    // Criar associações com grupos
    if (selected_groups && selected_groups.length > 0) {
      const campaignGroups = selected_groups.map((groupId: string) => ({
        campaign_id: campaign.id,
        group_id: groupId,
        group_type: 'normal', // Por enquanto, assumir que são grupos normais
        send_delay_seconds: 0,
        is_active: true
      }));

      const { error: groupsError } = await supabase
        .from('campaign_groups')
        .insert(campaignGroups);

      if (groupsError) {
        console.error('Erro ao associar grupos:', groupsError);
        // Continuar mesmo com erro nos grupos
      }
    }

    return NextResponse.json({ 
      success: true, 
      campaign,
      message: 'Campanha criada com sucesso!' 
    });
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}