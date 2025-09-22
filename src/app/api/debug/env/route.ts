import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verificar variáveis de ambiente (sem expor valores sensíveis)
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlDomain: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Variáveis de ambiente verificadas'
    });
    
  } catch (error) {
    console.error('Erro no debug de ambiente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
