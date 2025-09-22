import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [TEST-AUTH] Iniciando teste de autenticação...');
    
    const supabase = await createClient();
    console.log('🔍 [TEST-AUTH] Cliente Supabase criado');
    
    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    console.log('🔍 [TEST-AUTH] Resultado da autenticação:', {
      user: user ? `${user.email} (${user.id})` : 'NENHUM',
      error: authError?.message || 'NENHUM'
    });
    
    if (authError) {
      console.error('🔍 [TEST-AUTH] Erro de autenticação:', authError);
      return NextResponse.json({ 
        error: 'Erro de autenticação',
        details: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      console.log('🔍 [TEST-AUTH] Usuário não encontrado, retornando 401');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    console.log('🔍 [TEST-AUTH] Usuário autenticado com sucesso!');
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('🔍 [TEST-AUTH] Erro no servidor:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
