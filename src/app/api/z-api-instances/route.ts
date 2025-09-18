import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Buscar instâncias Z-API
    const { data: instances, error } = await supabase
      .from('z_api_instances')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar instâncias Z-API:', error);
      return NextResponse.json({ error: 'Erro ao buscar instâncias' }, { status: 500 });
    }

    return NextResponse.json(instances || []);

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const {
      name,
      instance_id,
      instance_token,
      client_token
    } = body;

    // Validar dados obrigatórios
    if (!name || !instance_id || !instance_token) {
      return NextResponse.json({ error: 'Nome, instance_id e instance_token são obrigatórios' }, { status: 400 });
    }

    // Criar nova instância
    const { data: instance, error } = await supabase
      .from('z_api_instances')
      .insert({
        name,
        instance_id,
        instance_token,
        client_token: client_token || '',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar instância:', error);
      return NextResponse.json({ error: 'Erro ao criar instância' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      instance,
      message: 'Instância criada com sucesso!' 
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

