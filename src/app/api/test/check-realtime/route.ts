import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/test/check-realtime - Verificar se Realtime está funcionando
export async function GET() {
  try {
    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar se as tabelas têm Realtime habilitado
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['whatsapp_groups', 'group_participants', 'group_notifications'])

    // Verificar configurações do Realtime
    const { data: realtimeConfig, error: realtimeError } = await supabase
      .rpc('get_realtime_config')

    // Testar uma mudança simples para ver se o Realtime funciona
    const testGroupId = '4d14e228-4b4f-44c9-b9f1-446884475038'
    
    // Fazer uma mudança pequena (atualizar updated_at)
    const { data: updateResult, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', testGroupId)
      .select()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        tables: tables || [],
        tablesError: tablesError?.message,
        realtimeConfig: realtimeConfig || null,
        realtimeError: realtimeError?.message,
        testUpdate: {
          success: !updateError,
          error: updateError?.message,
          result: updateResult
        }
      }
    })

  } catch (error) {
    console.error('Erro ao verificar Realtime:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
