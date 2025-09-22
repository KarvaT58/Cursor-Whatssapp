import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Erro de autenticação:', authError);
      return NextResponse.json({ 
        authenticated: false, 
        error: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'Usuário não encontrado' 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
