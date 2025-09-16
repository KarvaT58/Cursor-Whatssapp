import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
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

    // Only admins and owners can cancel invites
    if (teamMember.role !== 'admin' && teamMember.role !== 'owner') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update invite status to cancelled
    const { error: updateError } = await supabase
      .from('team_invites')
      .update({ status: 'cancelled' })
      .eq('id', inviteId)
      .eq('team_id', teamId)

    if (updateError) {
      console.error('Error cancelling invite:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel invite' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Invite cancelled successfully' })
  } catch (error) {
    console.error(
      'Error in DELETE /api/teams/[teamId]/invites/[inviteId]:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
