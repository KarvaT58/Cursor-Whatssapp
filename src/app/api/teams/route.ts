import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateTeamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
})

const UpdateTeamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
})

// GET /api/teams - Listar equipes do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar dados do usuário para obter team_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('team_id, role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    if (!userData?.team_id) {
      return NextResponse.json({ teams: [] })
    }

    // Buscar dados da equipe
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', userData.team_id)
      .single()

    if (teamError) {
      return NextResponse.json(
        { error: 'Failed to fetch team data' },
        { status: 500 }
      )
    }

    // Buscar membros da equipe
    const { data: membersData, error: membersError } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('team_id', userData.team_id)
      .order('created_at', { ascending: true })

    if (membersError) {
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      team: teamData,
      members: membersData || [],
      userRole: userData.role,
    })
  } catch (error) {
    console.error('Error in teams GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/teams - Criar nova equipe
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = CreateTeamSchema.parse(body)

    // Verificar se o usuário já está em uma equipe
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('team_id')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    if (userData?.team_id) {
      return NextResponse.json(
        { error: 'User is already in a team' },
        { status: 400 }
      )
    }

    // Criar a equipe
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: validatedData.name,
        description: validatedData.description || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (teamError) {
      console.error('Error creating team:', teamError)
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      )
    }

    // Atualizar usuário com team_id e role de admin
    const { error: updateError } = await supabase
      .from('users')
      .update({
        team_id: teamData.id,
        role: 'admin',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user:', updateError)
      // Tentar deletar a equipe criada
      await supabase.from('teams').delete().eq('id', teamData.id)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json(teamData, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in teams POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/teams - Atualizar equipe
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = UpdateTeamSchema.parse(body)

    // Verificar se o usuário está em uma equipe e é admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('team_id, role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    if (!userData?.team_id) {
      return NextResponse.json(
        { error: 'User is not in a team' },
        { status: 400 }
      )
    }

    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only team admins can update team information' },
        { status: 403 }
      )
    }

    // Atualizar a equipe
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.team_id)
      .select()
      .single()

    if (teamError) {
      console.error('Error updating team:', teamError)
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 500 }
      )
    }

    return NextResponse.json(teamData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in teams PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/teams - Deletar equipe
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se o usuário está em uma equipe e é admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('team_id, role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    if (!userData?.team_id) {
      return NextResponse.json(
        { error: 'User is not in a team' },
        { status: 400 }
      )
    }

    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only team admins can delete the team' },
        { status: 403 }
      )
    }

    // Remover todos os usuários da equipe
    const { error: removeUsersError } = await supabase
      .from('users')
      .update({
        team_id: null,
        role: 'user',
        updated_at: new Date().toISOString(),
      })
      .eq('team_id', userData.team_id)

    if (removeUsersError) {
      console.error('Error removing users from team:', removeUsersError)
      return NextResponse.json(
        { error: 'Failed to remove users from team' },
        { status: 500 }
      )
    }

    // Deletar mensagens da equipe
    const { error: deleteMessagesError } = await supabase
      .from('team_messages')
      .delete()
      .eq('team_id', userData.team_id)

    if (deleteMessagesError) {
      console.error('Error deleting team messages:', deleteMessagesError)
      return NextResponse.json(
        { error: 'Failed to delete team messages' },
        { status: 500 }
      )
    }

    // Deletar a equipe
    const { error: deleteTeamError } = await supabase
      .from('teams')
      .delete()
      .eq('id', userData.team_id)

    if (deleteTeamError) {
      console.error('Error deleting team:', deleteTeamError)
      return NextResponse.json(
        { error: 'Failed to delete team' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in teams DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
