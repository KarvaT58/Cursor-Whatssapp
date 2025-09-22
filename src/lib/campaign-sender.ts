import { createClient } from '@supabase/supabase-js';
import { ZApiClient } from '@/lib/z-api/client';

interface ZApiInstance {
  id: string;
  instance_id: string;
  instance_token: string;
  client_token: string;
  name: string;
}

interface CampaignGroup {
  id: string;
  group_id: string;
  group_type: 'universal' | 'normal';
  send_delay_seconds: number;
  is_active: boolean;
}

interface CampaignMessage {
  id: string;
  message_text: string;
  message_order: number;
  is_active: boolean;
}

interface CampaignMedia {
  id: string;
  media_type: 'image' | 'video' | 'audio' | 'document';
  media_url: string;
  media_name: string;
  media_size?: number;
  media_mime_type?: string;
  media_order: number;
  is_active: boolean;
}

interface WhatsAppGroup {
  id: string;
  whatsapp_id: string;
  name: string;
}

export class CampaignSender {
  private supabase: any;
  private zApiBaseUrl = 'https://api.z-api.io/instances';

  constructor() {
    // Inicializar supabase de forma assíncrona
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Enviar campanha para todos os grupos
   */
  async sendCampaign(campaignId: string): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      console.log(`🚀 Iniciando envio da campanha ${campaignId}`);

      // Garantir que o Supabase está inicializado
      if (!this.supabase) {
        await this.initializeSupabase();
      }

      // Buscar dados da campanha
      const campaignData = await this.getCampaignData(campaignId);
      if (!campaignData) {
        return { success: false, message: 'Campanha não encontrada' };
      }

      const { campaign, instance, groups, messages, media } = campaignData;

      if (!instance) {
        return { success: false, message: 'Instância Z-API não encontrada' };
      }

      if (groups.length === 0) {
        return { success: false, message: 'Nenhum grupo selecionado para a campanha' };
      }

      console.log(`📊 Campanha: ${campaign.name}`);
      console.log(`🔗 Instância: ${instance.name} (${instance.instance_id})`);
      console.log(`👥 Grupos: ${groups.length}`);
      console.log(`💬 Mensagens: ${messages.length}`);
      console.log(`📎 Mídias: ${media.length}`);

      let totalSent = 0;
      let totalFailed = 0;
      const errors: string[] = [];

      // Enviar para cada grupo
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        try {
          // Verificar se a campanha ainda está ativa antes de cada envio
          const { data: currentCampaign } = await this.supabase
            .from('campaigns')
            .select('status')
            .eq('id', campaignId)
            .single();

          if (!currentCampaign || currentCampaign.status !== 'active') {
            console.log(`⏹️ Campanha pausada ou cancelada. Parando execução.`);
            return { 
              success: false, 
              message: `Campanha foi ${currentCampaign?.status || 'cancelada'}. Execução interrompida.`,
              sent: totalSent,
              failed: totalFailed,
              errors
            };
          }

          console.log(`📤 Enviando para grupo: ${group.name} (${group.whatsapp_id})`);

          // Aplicar delay global entre grupos (exceto para o primeiro grupo)
          if (i > 0 && campaign.global_interval > 0) {
            console.log(`⏱️ Aguardando ${campaign.global_interval} segundos entre grupos...`);
            await this.delay(campaign.global_interval * 1000);
            
            // Verificar novamente após o delay
            const { data: delayedCampaign } = await this.supabase
              .from('campaigns')
              .select('status')
              .eq('id', campaignId)
              .single();

            if (!delayedCampaign || delayedCampaign.status !== 'active') {
              console.log(`⏹️ Campanha pausada durante o delay. Parando execução.`);
              return { 
                success: false, 
                message: `Campanha foi ${delayedCampaign?.status || 'cancelada'} durante o delay. Execução interrompida.`,
                sent: totalSent,
                failed: totalFailed,
                errors
              };
            }
          }

          // Aplicar delay individual se configurado
          if (group.send_delay_seconds > 0) {
            console.log(`⏱️ Aguardando ${group.send_delay_seconds} segundos (delay individual)...`);
            await this.delay(group.send_delay_seconds * 1000);
            
            // Verificar novamente após o delay individual
            const { data: individualDelayedCampaign } = await this.supabase
              .from('campaigns')
              .select('status')
              .eq('id', campaignId)
              .single();

            if (!individualDelayedCampaign || individualDelayedCampaign.status !== 'active') {
              console.log(`⏹️ Campanha pausada durante o delay individual. Parando execução.`);
              return { 
                success: false, 
                message: `Campanha foi ${individualDelayedCampaign?.status || 'cancelada'} durante o delay individual. Execução interrompida.`,
                sent: totalSent,
                failed: totalFailed,
                errors
              };
            }
          }

          // Determinar qual variante enviar para este grupo (distribuição cíclica)
          const activeMessages = messages.filter(m => m.is_active);
          
          if (activeMessages.length > 0) {
            const variantIndex = i % activeMessages.length; // Ciclo através das variantes
            const variantMessage = activeMessages[variantIndex];
            
            console.log(`🔄 Grupo ${i + 1}/${groups.length} (${group.name}) → Variante ${variantIndex + 1} (Mensagem ${variantMessage.message_order})`);

            // Combinar mensagem principal com mensagem variável
            let combinedMessage = '';
            if (campaign.message) {
              combinedMessage += campaign.message;
            }
            if (variantMessage.message_text) {
              if (combinedMessage) {
                combinedMessage += '\n\n' + variantMessage.message_text;
              } else {
                combinedMessage = variantMessage.message_text;
              }
            }

            // Enviar mensagem combinada se houver texto
            if (combinedMessage.trim()) {
              const messageResult = await this.sendMessage(
                instance,
                group.whatsapp_id,
                combinedMessage,
                'text'
              );

              if (messageResult.success) {
                await this.logSend(campaignId, group.id, variantMessage.id, null, 'sent', messageResult.messageId);
                totalSent++;
              } else {
                await this.logSend(campaignId, group.id, variantMessage.id, null, 'failed', null, messageResult.error);
                totalFailed++;
                errors.push(`Grupo ${group.name} - Mensagem ${variantMessage.message_order}: ${messageResult.error}`);
              }
            }

            // Enviar mídias da variante específica
            const variantMedia = media.filter(m => m.is_active && m.media_order === variantMessage.message_order);
            
            console.log(`📎 Mídias encontradas para variante ${variantMessage.message_order}:`, variantMedia.length);
            console.log(`📎 Todas as mídias disponíveis:`, media.map(m => ({ order: m.media_order, name: m.media_name, active: m.is_active })));
            
            for (const mediaItem of variantMedia) {
              const mediaResult = await this.sendMedia(
                instance,
                group.whatsapp_id,
                mediaItem
              );

              if (mediaResult.success) {
                await this.logSend(campaignId, group.id, null, mediaItem.id, 'sent', mediaResult.messageId);
                totalSent++;
              } else {
                await this.logSend(campaignId, group.id, null, mediaItem.id, 'failed', null, mediaResult.error);
                totalFailed++;
                errors.push(`Grupo ${group.name} - Mídia ${mediaItem.media_name}: ${mediaResult.error}`);
              }
            }
          } else if (campaign.message) {
            // Se não há mensagens variáveis, enviar apenas a mensagem principal
            const messageResult = await this.sendMessage(
              instance,
              group.whatsapp_id,
              campaign.message,
              'text'
            );

            if (messageResult.success) {
              await this.logSend(campaignId, group.id, null, null, 'sent', messageResult.messageId);
              totalSent++;
            } else {
              await this.logSend(campaignId, group.id, null, null, 'failed', null, messageResult.error);
              totalFailed++;
              errors.push(`Grupo ${group.name}: ${messageResult.error}`);
            }
          } else {
            console.log(`⚠️ Nenhuma mensagem ativa encontrada para o grupo ${group.name}`);
          }

        } catch (error) {
          console.error(`❌ Erro ao enviar para grupo ${group.name}:`, error);
          totalFailed++;
          errors.push(`Grupo ${group.name}: ${error}`);
        }
      }

      // Atualizar estatísticas da campanha
      await this.updateCampaignStats(campaignId, totalSent, totalFailed);

      console.log(`✅ Campanha finalizada! Enviados: ${totalSent}, Falharam: ${totalFailed}`);

      return {
        success: true,
        message: `Campanha enviada! ${totalSent} mensagens enviadas, ${totalFailed} falharam`,
        stats: {
          sent: totalSent,
          failed: totalFailed,
          errors: errors.slice(0, 5) // Primeiros 5 erros
        }
      };

    } catch (error) {
      console.error('❌ Erro ao enviar campanha:', error);
      return { success: false, message: `Erro interno: ${error}` };
    }
  }

  /**
   * Buscar dados completos da campanha
   */
  private async getCampaignData(campaignId: string) {
    try {
      // Buscar campanha
      const { data: campaign, error: campaignError } = await this.supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError || !campaign) {
        console.error('Erro ao buscar campanha:', campaignError);
        return null;
      }

      // Buscar instância Z-API
      const { data: instance, error: instanceError } = await this.supabase
        .from('z_api_instances')
        .select('*')
        .eq('id', campaign.instance_id)
        .single();

      if (instanceError || !instance) {
        console.error('Erro ao buscar instância:', instanceError);
        return null;
      }

      // Buscar grupos da campanha
      const { data: campaignGroups, error: groupsError } = await this.supabase
        .from('campaign_groups')
        .select(`
          *,
          whatsapp_groups (
            id,
            whatsapp_id,
            name
          )
        `)
        .eq('campaign_id', campaignId)
        .eq('is_active', true);

      if (groupsError) {
        console.error('Erro ao buscar grupos:', groupsError);
        return null;
      }

      const groups = campaignGroups?.map((cg: any) => ({
        id: cg.id,
        group_id: cg.group_id,
        group_type: cg.group_type,
        send_delay_seconds: cg.send_delay_seconds,
        is_active: cg.is_active,
        name: cg.whatsapp_groups?.name || 'Grupo Desconhecido',
        whatsapp_id: cg.whatsapp_groups?.whatsapp_id || ''
      })) || [];

      // Buscar mensagens variáveis
      const { data: messages, error: messagesError } = await this.supabase
        .from('campaign_messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .order('message_order');

      if (messagesError) {
        console.error('Erro ao buscar mensagens:', messagesError);
        return null;
      }

      // Buscar mídias
      const { data: media, error: mediaError } = await this.supabase
        .from('campaign_media')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .order('media_order');

      if (mediaError) {
        console.error('Erro ao buscar mídias:', mediaError);
        return null;
      }

      return {
        campaign,
        instance,
        groups,
        messages: messages || [],
        media: media || []
      };

    } catch (error) {
      console.error('Erro ao buscar dados da campanha:', error);
      return null;
    }
  }

  /**
   * Enviar mensagem de texto
   */
  private async sendMessage(instance: ZApiInstance, groupId: string, message: string, type: string = 'text'): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log(`📤 Enviando mensagem para ${groupId}:`, message.substring(0, 50) + '...');

      // Usar o cliente Z-API com client-token
      const zApiClient = new ZApiClient(
        instance.instance_id,
        instance.instance_token,
        instance.client_token
      );

      const result = await zApiClient.sendTextMessage(groupId, message);

      if (result.success) {
        console.log(`✅ Mensagem enviada com sucesso!`);
        return { success: true, messageId: result.data?.messageId as string };
      } else {
        console.error(`❌ Erro ao enviar mensagem:`, result.error);
        return { success: false, error: result.error || 'Erro desconhecido' };
      }

    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      return { success: false, error: `Erro de rede: ${error}` };
    }
  }

  /**
   * Enviar mídia
   */
  private async sendMedia(instance: ZApiInstance, groupId: string, media: CampaignMedia): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log(`📎 Enviando ${media.media_type} para ${groupId}: ${media.media_name}`);

      // Usar URL do Supabase Storage diretamente
      let fullMediaUrl = media.media_url;
      
      // Se for uma URL do Supabase Storage, usar diretamente
      if (media.media_url.includes('supabase') || media.media_url.includes('storage.googleapis.com')) {
        fullMediaUrl = media.media_url;
        console.log(`📎 Usando URL do Supabase Storage: ${fullMediaUrl}`);
      } else if (media.media_url.startsWith('/uploads/')) {
        // Para URLs antigas, tentar converter para Supabase Storage
        const filename = media.media_url.split('/').pop();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const bucketName = 'media';
        
        if (supabaseUrl) {
          fullMediaUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/campaigns/media/${filename}`;
          console.log(`📎 Convertendo para URL do Supabase Storage: ${fullMediaUrl}`);
        } else {
          console.log(`📎 URL do Supabase não configurada, usando URL original`);
        }
      }
      
      console.log(`📎 URL final da mídia: ${fullMediaUrl}`);
      
      // Verificar se a URL é acessível
      try {
        const response = await fetch(fullMediaUrl, { method: 'HEAD' });
        console.log(`📎 Arquivo acessível: ${response.ok ? '✅' : '❌'} (Status: ${response.status})`);
        
        if (!response.ok) {
          console.log(`📎 Arquivo não acessível via URL: ${response.status}`);
          return { success: false, error: `Arquivo não acessível via URL (Status: ${response.status})` };
        }
      } catch (error) {
        console.log(`📎 Erro ao verificar arquivo: ${error}`);
        return { success: false, error: 'Erro ao verificar acessibilidade do arquivo' };
      }

      // Usar o cliente Z-API com client-token
      const zApiClient = new ZApiClient(
        instance.instance_id,
        instance.instance_token,
        instance.client_token
      );

      let result;

      // Determinar método baseado no tipo de mídia
      switch (media.media_type) {
        case 'image':
          console.log(`📎 Enviando imagem: ${fullMediaUrl}`);
          result = await zApiClient.sendImageMessage(groupId, '', fullMediaUrl);
          break;
        case 'video':
          console.log(`📎 Enviando vídeo: ${fullMediaUrl}`);
          result = await zApiClient.sendVideoMessage(groupId, fullMediaUrl);
          break;
        case 'audio':
          console.log(`📎 Enviando áudio: ${fullMediaUrl}`);
          console.log(`📎 Nome do arquivo: ${media.media_name}`);
          console.log(`📎 MIME type: ${media.media_mime_type}`);
          result = await zApiClient.sendAudioMessage(groupId, fullMediaUrl, media.media_name);
          break;
        case 'document':
          console.log(`📎 Enviando documento: ${fullMediaUrl}`);
          result = await zApiClient.sendDocumentMessage(groupId, '', fullMediaUrl, media.media_name);
          break;
        default:
          console.log(`📎 Tipo de mídia não suportado: ${media.media_type}`);
          return { success: false, error: 'Tipo de mídia não suportado' };
      }
      
      // Log detalhado da resposta
      console.log(`📎 Resposta Z-API para ${media.media_type}:`, result);

      if (result.success) {
        console.log(`✅ Mídia enviada com sucesso!`);
        return { success: true, messageId: result.data?.messageId as string };
      } else {
        console.error(`❌ Erro ao enviar mídia:`, result.error);
        
        // Log detalhado do erro para debug
        if (result.error && result.error.includes('Unable to find matching target resource method')) {
          console.log(`📎 Erro Z-API: URL não acessível externamente`);
          return { success: false, error: 'URL da mídia não é acessível externamente' };
        }
        
        return { success: false, error: result.error || 'Erro desconhecido' };
      }

    } catch (error) {
      console.error('❌ Erro na requisição de mídia:', error);
      return { success: false, error: `Erro de rede: ${error}` };
    }
  }

  /**
   * Registrar envio no histórico
   */
  private async logSend(
    campaignId: string,
    groupId: string,
    messageId: string | null,
    mediaId: string | null,
    status: 'sent' | 'failed',
    zapiMessageId?: string,
    errorMessage?: string
  ) {
    try {
      await this.supabase
        .from('campaign_sends')
        .insert({
          campaign_id: campaignId,
          group_id: groupId,
          message_id: messageId,
          media_id: mediaId,
          send_status: status,
          send_time: new Date().toISOString(),
          scheduled_time: new Date().toISOString(),
          error_message: errorMessage,
          zapi_message_id: zapiMessageId
        });
    } catch (error) {
      console.error('Erro ao registrar envio:', error);
    }
  }

  /**
   * Atualizar estatísticas da campanha
   */
  private async updateCampaignStats(campaignId: string, sent: number, failed: number) {
    try {
      const { data: currentStats } = await this.supabase
        .from('campaigns')
        .select('stats')
        .eq('id', campaignId)
        .single();

      const stats = currentStats?.stats || { sent: 0, delivered: 0, read: 0, failed: 0, total: 0 };
      
      const newStats = {
        ...stats,
        sent: stats.sent + sent,
        failed: stats.failed + failed,
        total: stats.total + sent + failed
      };

      await this.supabase
        .from('campaigns')
        .update({ stats: newStats })
        .eq('id', campaignId);

    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

