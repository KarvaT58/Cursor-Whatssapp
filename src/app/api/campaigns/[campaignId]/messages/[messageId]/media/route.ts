import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Listar mídias associadas a uma variante de mensagem
export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string; messageId: string } }
) {
  try {
    const { campaignId, messageId } = params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar mídias associadas à variante
    const { data: media, error } = await supabase
      .from('campaign_message_media')
      .select(`
        *,
        campaign_media (
          id,
          media_type,
          media_url,
          media_name,
          media_size,
          media_mime_type,
          is_active
        )
      `)
      .eq('campaign_message_id', messageId)
      .order('media_order', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mídias da variante:', error);
      return NextResponse.json({ error: 'Erro ao buscar mídias' }, { status: 500 });
    }

    return NextResponse.json({ media });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Associar mídia a uma variante de mensagem
export async function POST(
  request: NextRequest,
  { params }: { params: { campaignId: string; messageId: string } }
) {
  try {
    const { campaignId, messageId } = params;
    const { mediaId, mediaOrder } = await request.json();

    if (!mediaId) {
      return NextResponse.json({ error: 'ID da mídia é obrigatório' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verificar se a mídia pertence à campanha
    const { data: media, error: mediaError } = await supabase
      .from('campaign_media')
      .select('id')
      .eq('id', mediaId)
      .eq('campaign_id', campaignId)
      .single();

    if (mediaError || !media) {
      return NextResponse.json({ error: 'Mídia não encontrada na campanha' }, { status: 404 });
    }

    // Verificar se a variante pertence à campanha
    const { data: message, error: messageError } = await supabase
      .from('campaign_messages')
      .select('id')
      .eq('id', messageId)
      .eq('campaign_id', campaignId)
      .single();

    if (messageError || !message) {
      return NextResponse.json({ error: 'Variante não encontrada na campanha' }, { status: 404 });
    }

    // Associar mídia à variante
    const { data, error } = await supabase
      .from('campaign_message_media')
      .insert({
        campaign_message_id: messageId,
        campaign_media_id: mediaId,
        media_order: mediaOrder || 1
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao associar mídia:', error);
      return NextResponse.json({ error: 'Erro ao associar mídia' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      association: data,
      message: 'Mídia associada à variante com sucesso'
    });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Remover associação de mídia de uma variante
export async function DELETE(
  request: NextRequest,
  { params }: { params: { campaignId: string; messageId: string } }
) {
  try {
    const { campaignId, messageId } = params;
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');

    if (!mediaId) {
      return NextResponse.json({ error: 'ID da mídia é obrigatório' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Remover associação
    const { error } = await supabase
      .from('campaign_message_media')
      .delete()
      .eq('campaign_message_id', messageId)
      .eq('campaign_media_id', mediaId);

    if (error) {
      console.error('Erro ao remover associação:', error);
      return NextResponse.json({ error: 'Erro ao remover associação' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Associação removida com sucesso'
    });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
