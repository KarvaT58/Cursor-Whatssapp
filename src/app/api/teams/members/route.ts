import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const InviteUserSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'user']).default('user'),
})

const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID é obrigatório'),
  role: z.enum(['admin', 'user']),
})

const RemoveUserSchema = z.object({
  userId: z.string().min(1, 'User ID é obrigatório'),
})

// GET /api/teams/members - Listar membros da equipe
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
      return NextResponse.json(
        { error: 'User is not in a team' },
        { status: 400 }
      )
    }

    // Buscar membros da equipe
    const { data: membersData, error: membersError } = await supabase
      .from('users')
      .select('id, name, email, role, created_at, updated_at')
      .eq('team_id', userData.team_id)
      .order('created_at', { ascending: true })

    if (membersError) {
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      members: membersData || [],
      userRole: userData.role,
    })
  } catch (error) {
    console.error('Error in teams/members GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/teams/members - Convidar usuário para a equipe
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
    const validatedData = InviteUserSchema.parse(body)

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
        { error: 'Only team admins can invite users' },
        { status: 403 }
      )
    }

    // Verificar se o usuário já existe
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', validatedData.email)
      .single()

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      )
    }

    if (existingUser) {
      // Verificar se o usuário já está em uma equipe
      if (existingUser.team_id) {
        return NextResponse.json(
          { error: 'User is already in a team' },
          { status: 400 }
        )
      }

      // Adicionar usuário à equipe
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          team_id: userData.team_id,
          role: validatedData.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select('id, name, email, role, created_at')
        .single()

      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json(
          { error: 'Failed to add user to team' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'User added to team successfully',
      })
    } else {
      // Usuário não existe - implementar sistema de convites
      // Por enquanto, retornar erro
      return NextResponse.json(
        {
          error: 'User not found. Invitation system not implemented yet.',
          suggestion:
            'The user must first create an account before being added to the team.',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in teams/members POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/teams/members - Atualizar role do usuário
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
    const validatedData = UpdateUserRoleSchema.parse(body)

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
        { error: 'Only team admins can update user roles' },
        { status: 403 }
      )
    }

    // Verificar se o usuário alvo está na mesma equipe
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('team_id, role')
      .eq('id', validatedData.userId)
      .single()

    if (targetUserError) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }

    if (targetUser.team_id !== userData.team_id) {
      return NextResponse.json(
        { error: 'User is not in the same team' },
        { status: 400 }
      )
    }

    // Não permitir que o usuário mude seu próprio role
    if (validatedData.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Atualizar role do usuário
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        role: validatedData.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.userId)
      .select('id, name, email, role, updated_at')
      .single()

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User role updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in teams/members PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/members - Remover usuário da equipe
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
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
        { error: 'Only team admins can remove users' },
        { status: 403 }
      )
    }

    // Verificar se o usuário alvo está na mesma equipe
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('team_id, role')
      .eq('id', userId)
      .single()

    if (targetUserError) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }

    if (targetUser.team_id !== userData.team_id) {
      return NextResponse.json(
        { error: 'User is not in the same team' },
        { status: 400 }
      )
    }

    // Não permitir que o usuário se remova da equipe
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the team' },
        { status: 400 }
      )
    }

    // Remover usuário da equipe
    const { error: removeError } = await supabase
      .from('users')
      .update({
        team_id: null,
        role: 'user',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (removeError) {
      console.error('Error removing user from team:', removeError)
      return NextResponse.json(
        { error: 'Failed to remove user from team' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User removed from team successfully',
    })
  } catch (error) {
    console.error('Error in teams/members DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
