import { NextRequest, NextResponse } from 'next/server';
import { CampaignScheduler } from '@/lib/campaign-scheduler';

export async function GET(request: NextRequest) {
  try {
    console.log('🕐 Iniciando verificação de campanhas agendadas...');

    const scheduler = new CampaignScheduler();
    await scheduler.checkAndExecuteScheduledCampaigns();

    return NextResponse.json({
      success: true,
      message: 'Verificação de campanhas concluída',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no cron job de campanhas:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Para ser chamado por um cron job externo (ex: Vercel Cron, GitHub Actions, etc.)
export async function POST(request: NextRequest) {
  return GET(request);
}

