import { NextRequest, NextResponse } from 'next/server';
import { CampaignScheduler } from '@/lib/campaign-scheduler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    
    if (!campaignId) {
      return NextResponse.json({ error: 'ID da campanha é obrigatório' }, { status: 400 });
    }

    console.log(`🚀 Executando campanha manualmente: ${campaignId}`);

    const scheduler = new CampaignScheduler();
    const result = await scheduler.executeCampaignManually(campaignId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        stats: result.stats
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erro ao executar campanha:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

