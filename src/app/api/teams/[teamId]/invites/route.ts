import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['owner', 'admin', 'user']).default('user'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is member of the team
    const { data: teamMember, error: memberError } = await supabase
      .from('users')
      .select('team_id, role')
      .eq('id', user.id)
      .eq('team_id', teamId)
      .single()

    if (memberError || !teamMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only admins and owners can view invites
    if (teamMember.role !== 'admin' && teamMember.role !== 'owner') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get team invites
    const { data: invites, error: invitesError } = await supabase
      .from('team_invites')
      .select(
        `
        *,
        invitedBy:users!team_invites_invited_by_fkey (
          id,
          name,
          email
        )
      `
      )
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (invitesError) {
      console.error('Error fetching invites:', invitesError)
      return NextResponse.json(
        { error: 'Failed to fetch invites' },
        { status: 500 }
      )
    }

    const formattedInvites =
      invites?.map((invite) => ({
        ...invite,
        invitedByName:
          invite.invitedBy?.name || invite.invitedBy?.email || 'Unknown',
      })) || []

    return NextResponse.json({ invites: formattedInvites })
  } catch (error) {
    console.error('Error in GET /api/teams/[teamId]/invites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const body = await request.json()

    const { email, role } = createInviteSchema.parse(body)

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is member of the team
    const { data: teamMember, error: memberError } = await supabase
      .from('users')
      .select('team_id, role')
      .eq('id', user.id)
      .eq('team_id', teamId)
      .single()

    if (memberError || !teamMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only admins and owners can create invites
    if (teamMember.role !== 'admin' && teamMember.role !== 'owner') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('team_id', teamId)
      .single()

    if (memberCheckError && memberCheckError.code !== 'PGRST116') {
      console.error('Error checking existing member:', memberCheckError)
      return NextResponse.json(
        { error: 'Failed to check existing member' },
        { status: 500 }
      )
    }

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      )
    }

    // Check if there's already a pending invite
    const { data: existingInvite, error: inviteCheckError } = await supabase
      .from('team_invites')
      .select('id')
      .eq('email', email)
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .single()

    if (inviteCheckError && inviteCheckError.code !== 'PGRST116') {
      console.error('Error checking existing invite:', inviteCheckError)
      return NextResponse.json(
        { error: 'Failed to check existing invite' },
        { status: 500 }
      )
    }

    if (existingInvite) {
      return NextResponse.json(
        { error: 'There is already a pending invite for this email' },
        { status: 400 }
      )
    }

    // Create invite
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .insert({
        team_id: teamId,
        email,
        role,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invite:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      )
    }

    // TODO: Send email notification
    // await sendInviteEmail(email, teamId, invite.id)

    return NextResponse.json({ invite }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/teams/[teamId]/invites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
