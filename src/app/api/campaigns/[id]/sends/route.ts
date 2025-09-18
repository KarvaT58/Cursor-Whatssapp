import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const supabase = await createClient();
    
    // Buscar todos os envios da campanha com dados relacionados
    const { data: sends, error } = await supabase
      .from('campaign_sends')
      .select(`
        *,
        whatsapp_groups (
          name,
          whatsapp_id
        ),
        campaign_messages (
          message_text,
          message_order
        ),
        campaign_media (
          media_name,
          media_type
        )
      `)
      .eq('campaign_id', campaignId)
      .order('send_time', { ascending: false });

    if (error) {
      console.error('Erro ao buscar envios:', error);
      return NextResponse.json({ error: 'Erro ao buscar envios' }, { status: 500 });
    }

    return NextResponse.json(sends || []);

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

