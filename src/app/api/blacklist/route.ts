import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/blacklist - Listar blacklist
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: blacklist, error } = await supabase
      .from('blacklist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar blacklist:', error)
      return NextResponse.json({ error: 'Erro ao buscar blacklist' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: blacklist })

  } catch (error) {
    console.error('Erro ao listar blacklist:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/blacklist - Adicionar à blacklist
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, reason } = body

    if (!phone) {
      return NextResponse.json({ error: 'Número de telefone é obrigatório' }, { status: 400 })
    }

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('blacklist')
      .select('id')
      .eq('phone', phone)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Número já está na blacklist' }, { status: 400 })
    }

    // Adicionar à blacklist
    const { data: newEntry, error } = await supabase
      .from('blacklist')
      .insert({
        phone,
        reason,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao adicionar à blacklist:', error)
      return NextResponse.json({ error: 'Erro ao adicionar à blacklist' }, { status: 500 })
    }

    // Cache não é mais necessário - sistema simples

    return NextResponse.json({ 
      success: true, 
      data: newEntry,
      message: 'Número adicionado à blacklist com sucesso'
    })

  } catch (error) {
    console.error('Erro ao adicionar à blacklist:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/blacklist - Remover da blacklist
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Remover da blacklist
    const { error } = await supabase
      .from('blacklist')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao remover da blacklist:', error)
      return NextResponse.json({ error: 'Erro ao remover da blacklist' }, { status: 500 })
    }

    // Cache não é mais necessário - sistema simples

    return NextResponse.json({ 
      success: true,
      message: 'Número removido da blacklist com sucesso'
    })

  } catch (error) {
    console.error('Erro ao remover da blacklist:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}