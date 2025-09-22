import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// PUT - Atualizar ordem da mídia na variante
export async function PUT(
  request: NextRequest,
  { params }: { params: { campaignId: string; messageId: string; associationId: string } }
) {
  try {
    const { campaignId, messageId, associationId } = params;
    const { mediaOrder } = await request.json();

    if (mediaOrder === undefined || mediaOrder < 1) {
      return NextResponse.json({ error: 'Ordem da mídia deve ser um número maior que 0' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Atualizar ordem da mídia
    const { data, error } = await supabase
      .from('campaign_message_media')
      .update({ 
        media_order: mediaOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', associationId)
      .eq('campaign_message_id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar ordem da mídia:', error);
      return NextResponse.json({ error: 'Erro ao atualizar ordem da mídia' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      association: data,
      message: 'Ordem da mídia atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Remover associação específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { campaignId: string; messageId: string; associationId: string } }
) {
  try {
    const { campaignId, messageId, associationId } = params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Remover associação
    const { error } = await supabase
      .from('campaign_message_media')
      .delete()
      .eq('id', associationId)
      .eq('campaign_message_id', messageId);

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
