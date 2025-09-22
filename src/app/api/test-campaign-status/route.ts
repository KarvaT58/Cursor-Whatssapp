import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando status da campanha...');

    // Usar service role key para ter acesso completo
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar a campanha específica
    const { data: campaign, error } = await supabase
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
      .eq('id', '701a09b2-4162-412e-a7da-d94cd97f5065')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar campanha:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!campaign) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 });
    }

    console.log('📊 Status da campanha:', {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      schedules: campaign.campaign_schedules
    });

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        schedules: campaign.campaign_schedules
      }
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
