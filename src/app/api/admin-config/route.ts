import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin-config - Obter configuração do admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('admin_phone')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('❌ Erro ao buscar configuração do admin:', error)
      return NextResponse.json({ error: 'Erro ao buscar configuração' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        adminPhone: userData?.admin_phone || '(45) 91284-3589'
      }
    })

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/admin-config - Atualizar configuração do admin
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { adminPhone } = await request.json()

    if (!adminPhone) {
      return NextResponse.json({ error: 'Número do administrador é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .update({ admin_phone: adminPhone })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar configuração do admin:', error)
      return NextResponse.json({ error: 'Erro ao atualizar configuração' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        adminPhone: data.admin_phone
      },
      message: 'Configuração do administrador atualizada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
