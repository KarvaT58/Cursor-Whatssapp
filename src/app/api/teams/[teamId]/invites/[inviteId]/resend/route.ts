import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; inviteId: string }> }
) {
  try {
    const { teamId, inviteId } = await params

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

    // Only admins and owners can resend invites
    if (teamMember.role !== 'admin' && teamMember.role !== 'owner') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .select('*')
      .eq('id', inviteId)
      .eq('team_id', teamId)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only resend pending invites' },
        { status: 400 }
      )
    }

    // Update the invite with new expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const { error: updateError } = await supabase
      .from('team_invites')
      .update({
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', inviteId)

    if (updateError) {
      console.error('Error updating invite:', updateError)
      return NextResponse.json(
        { error: 'Failed to resend invite' },
        { status: 500 }
      )
    }

    // TODO: Send email notification
    // await sendInviteEmail(invite.email, teamId, inviteId)

    return NextResponse.json({ message: 'Invite resent successfully' })
  } catch (error) {
    console.error(
      'Error in POST /api/teams/[teamId]/invites/[inviteId]/resend:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
