import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/contacts/export - Exportar contatos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar parâmetros de query
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const tags = searchParams.get('tags')

    // Construir query
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (tags) {
      const tagArray = tags.split(',')
      query = query.contains('tags', tagArray)
    }

    const { data: contacts, error } = await query

    if (error) {
      console.error('Erro ao exportar contatos:', error)
      return NextResponse.json(
        { error: 'Erro ao exportar contatos' },
        { status: 500 }
      )
    }

    if (format === 'csv') {
      // Gerar CSV
      const csvHeaders = [
        'Nome',
        'Telefone',
        'Email',
        'Notas',
        'Tags',
        'Data de Criação',
      ]
      const csvRows =
        contacts?.map((contact) => [
          contact.name,
          contact.phone,
          contact.email || '',
          contact.notes || '',
          contact.tags?.join(';') || '',
          new Date(contact.created_at || '').toLocaleDateString('pt-BR'),
        ]) || []

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row) => row.map((field) => `"${field}"`).join(',')),
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="contatos-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // Retornar JSON
      return NextResponse.json({
        contacts: contacts || [],
        exportedAt: new Date().toISOString(),
        total: contacts?.length || 0,
      })
    }
  } catch (error) {
    console.error('Erro no endpoint GET /api/contacts/export:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
