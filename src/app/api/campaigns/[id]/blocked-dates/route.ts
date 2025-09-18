import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar datas bloqueadas da campanha
    const { data: blockedDates, error } = await supabase
      .from('campaign_blocked_dates')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('blocked_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar datas bloqueadas:', error);
      return NextResponse.json({ error: 'Erro ao buscar datas bloqueadas' }, { status: 500 });
    }

    return NextResponse.json(blockedDates || []);

  } catch (error) {
    console.error('Erro na API de datas bloqueadas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const body = await request.json();
    const { dates, reason } = body;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: 'Datas são obrigatórias' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('📥 API recebeu datas para bloqueio:', dates);
    
    // Preparar dados para inserção
    const blockedDatesData = dates.map((blockedDate: any) => {
      const data = {
        campaign_id: campaignId,
        blocked_date: blockedDate.date,
        blocking_type: blockedDate.type || 'specific',
        blocking_value: blockedDate.type === 'day_of_week' ? blockedDate.value : null,
        reason: reason || blockedDate.reason || null
      };
      console.log('📝 Preparando dados para inserção:', data);
      return data;
    });

    // Inserir datas bloqueadas
    const { data, error } = await supabase
      .from('campaign_blocked_dates')
      .insert(blockedDatesData)
      .select();

    if (error) {
      console.error('Erro ao criar datas bloqueadas:', error);
      return NextResponse.json({ error: 'Erro ao criar datas bloqueadas' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `${dates.length} data(s) bloqueada(s) com sucesso`,
      blockedDates: data 
    });

  } catch (error) {
    console.error('Erro na API de datas bloqueadas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const body = await request.json();
    const { type, value } = body;

    if (!type) {
      return NextResponse.json({ error: 'Tipo de bloqueio é obrigatório' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let deleteQuery = supabase
      .from('campaign_blocked_dates')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('blocking_type', type);

    if (value !== undefined) {
      deleteQuery = deleteQuery.eq('blocking_value', value);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Erro ao remover datas bloqueadas:', error);
      return NextResponse.json({ error: 'Erro ao remover datas bloqueadas' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Bloqueio do tipo ${type} removido com sucesso`
    });

  } catch (error) {
    console.error('Erro na API de datas bloqueadas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
