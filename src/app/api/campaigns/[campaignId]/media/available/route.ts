import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Listar mídias disponíveis de uma campanha (não associadas a variantes específicas)
export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId'); // Opcional: para filtrar mídias já associadas

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar todas as mídias da campanha
    const { data: allMedia, error: mediaError } = await supabase
      .from('campaign_media')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('media_name');

    if (mediaError) {
      console.error('Erro ao buscar mídias da campanha:', mediaError);
      return NextResponse.json({ error: 'Erro ao buscar mídias' }, { status: 500 });
    }

    if (!messageId) {
      // Retornar todas as mídias se não especificar uma variante
      return NextResponse.json({ 
        media: allMedia,
        total: allMedia?.length || 0
      });
    }

    // Se especificou uma variante, filtrar mídias já associadas
    const { data: associatedMedia, error: assocError } = await supabase
      .from('campaign_message_media')
      .select('campaign_media_id')
      .eq('campaign_message_id', messageId);

    if (assocError) {
      console.error('Erro ao buscar mídias associadas:', assocError);
      return NextResponse.json({ error: 'Erro ao buscar mídias associadas' }, { status: 500 });
    }

    const associatedIds = associatedMedia?.map(m => m.campaign_media_id) || [];
    const availableMedia = allMedia?.filter(m => !associatedIds.includes(m.id)) || [];

    return NextResponse.json({ 
      media: availableMedia,
      total: availableMedia.length,
      associated: associatedIds.length
    });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
