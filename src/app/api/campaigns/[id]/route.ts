import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const supabase = await createClient();
    
    // Buscar campanha com todos os dados relacionados
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 });
    }

    // Buscar mensagens variáveis
    const { data: messages, error: messagesError } = await supabase
      .from('campaign_messages')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('message_order');

    // Buscar mídias
    const { data: media, error: mediaError } = await supabase
      .from('campaign_media')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('media_order');

    // Buscar agendamentos
    const { data: schedules, error: schedulesError } = await supabase
      .from('campaign_schedules')
      .select('*')
      .eq('campaign_id', campaignId);

    // Buscar grupos associados
    const { data: campaignGroups, error: groupsError } = await supabase
      .from('campaign_groups')
      .select('group_id')
      .eq('campaign_id', campaignId)
      .eq('is_active', true);

    const selectedGroups = campaignGroups?.map(cg => cg.group_id) || [];

    return NextResponse.json({
      ...campaign,
      messages: messages || [],
      media: media || [],
      schedules: schedules || [],
      selected_groups: selectedGroups
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== INÍCIO DA EDIÇÃO DE CAMPANHA ===');
    const { id: campaignId } = await params;
    console.log('Campaign ID:', campaignId);
    
    const supabase = await createClient();
    const body = await request.json();
    console.log('Body recebido:', body);
    
    const {
      name,
      description,
      instance_id,
      send_order,
      main_message,
      status,
      selected_groups,
      schedules,
      messages,
      media,
      global_interval
    } = body;

    console.log('Dados extraídos:', {
      name,
      description,
      instance_id,
      send_order,
      main_message,
      status,
      selected_groups: selected_groups?.length,
      schedules: schedules?.length,
      messages: messages?.length,
      media: media?.length,
      global_interval
    });

    // Validar dados obrigatórios apenas se não for uma atualização parcial
    const isPartialUpdate = Object.keys(body).length === 1 && body.status !== undefined;
    
    if (!isPartialUpdate && (!name || !instance_id)) {
      console.log('Erro de validação: Nome ou instância faltando');
      return NextResponse.json({ error: 'Nome e instância são obrigatórios' }, { status: 400 });
    }

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

    // Atualizar campanha principal
    console.log('Atualizando campanha principal...');
    
    // Se for uma atualização parcial (apenas status), buscar dados existentes primeiro
    let updateData;
    if (isPartialUpdate) {
      console.log('Atualização parcial detectada - buscando dados existentes...');
      const { data: existingCampaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();
        
      if (fetchError || !existingCampaign) {
        console.error('Erro ao buscar campanha existente:', fetchError);
        return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 });
      }
      
      updateData = {
        ...existingCampaign,
        status: status
      };
    } else {
      updateData = {
        name,
        description,
        instance_id,
        send_order: send_order || 'text_first',
        message: main_message || '',
        status: status || 'draft',
        global_interval: global_interval || 0
      };
    }
    
    console.log('Dados para atualização:', updateData);
    
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .eq('user_id', user.id) // Garantir que o usuário só edite suas próprias campanhas
      .select()
      .single();

    console.log('Resultado da atualização:', { campaign, campaignError });

    if (campaignError) {
      console.error('Erro ao atualizar campanha:', campaignError);
      return NextResponse.json({ error: 'Erro ao atualizar campanha' }, { status: 500 });
    }

    // Remover mensagens existentes e criar novas (apenas se não for atualização parcial)
    let createdMessages: any[] = [];
    if (!isPartialUpdate) {
      await supabase
        .from('campaign_messages')
        .delete()
        .eq('campaign_id', campaignId);

      if (messages && messages.length > 0) {
        const campaignMessages = messages.map((msg: any) => ({
          campaign_id: campaignId,
          message_text: msg.message_text,
          message_order: msg.message_order,
          is_active: msg.is_active
        }));

        const { data: insertedMessages, error: messagesError } = await supabase
          .from('campaign_messages')
          .insert(campaignMessages)
          .select();

        if (messagesError) {
          console.error('Erro ao atualizar mensagens:', messagesError);
        } else {
          createdMessages = insertedMessages || [];
          console.log('Mensagens atualizadas:', createdMessages.length);
        }
      }
    }

    // Remover mídias existentes e criar novas (apenas se não for atualização parcial)
    if (!isPartialUpdate) {
      await supabase
        .from('campaign_media')
        .delete()
        .eq('campaign_id', campaignId);

      if (media && media.length > 0) {
        const campaignMedia = media.map((med: any) => {
          // Encontrar a mensagem correspondente baseada na ordem
          const correspondingMessage = createdMessages.find(msg => msg.message_order === med.media_order);
          
          console.log(`🔗 [EDIT] Associando mídia ${med.media_name} (order: ${med.media_order}) com mensagem:`, correspondingMessage?.id || 'NENHUMA');
          
          return {
            campaign_id: campaignId,
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
          console.error('Erro ao atualizar mídias:', mediaError);
        } else {
          console.log('Mídias atualizadas:', campaignMedia.length);
        }
      }
    }

    // Remover agendamentos existentes e criar novos (apenas se não for atualização parcial)
    if (!isPartialUpdate) {
      await supabase
        .from('campaign_schedules')
        .delete()
        .eq('campaign_id', campaignId);

      if (schedules && schedules.length > 0) {
        const campaignSchedules = schedules.map((schedule: any) => ({
          campaign_id: campaignId,
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
          console.error('Erro ao atualizar agendamentos:', schedulesError);
        }
      }

      // Remover grupos existentes e criar novos
      await supabase
        .from('campaign_groups')
        .delete()
        .eq('campaign_id', campaignId);

      if (selected_groups && selected_groups.length > 0) {
        const campaignGroups = selected_groups.map((groupId: string) => ({
          campaign_id: campaignId,
          group_id: groupId,
          group_type: 'normal', // Por enquanto, assumir que são grupos normais
          send_delay_seconds: 0,
          is_active: true
        }));

        const { error: groupsError } = await supabase
          .from('campaign_groups')
          .insert(campaignGroups);

        if (groupsError) {
          console.error('Erro ao atualizar grupos:', groupsError);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      campaign,
      message: 'Campanha atualizada com sucesso!' 
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const supabase = await createClient();

    // Deletar campanha (cascade vai deletar os relacionamentos)
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) {
      console.error('Erro ao deletar campanha:', error);
      return NextResponse.json({ error: 'Erro ao deletar campanha' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Campanha deletada com sucesso!' 
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}