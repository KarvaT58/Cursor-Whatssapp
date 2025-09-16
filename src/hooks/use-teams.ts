import { useState, useEffect, useCallback } from 'react'
import {
  TeamResponse,
  TeamMembersResponse,
  CreateTeamData,
  UpdateTeamData,
  InviteUserData,
  UpdateUserRoleData,
} from '@/types/teams'

interface UseTeamsOptions {
  refreshInterval?: number
  enabled?: boolean
}

export function useTeams(options: UseTeamsOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options
  const [team, setTeam] = useState<TeamResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeam = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/teams')

      if (!response.ok) {
        if (response.status === 404) {
          setTeam(null)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTeam(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch team'
      setError(errorMessage)
      console.error('Error fetching team:', err)
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  // Initial fetch
  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  // Set up polling
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(fetchTeam, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchTeam, refreshInterval, enabled])

  const createTeam = useCallback(
    async (data: CreateTeamData) => {
      try {
        setError(null)

        const response = await fetch('/api/teams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create team')
        }

        const teamData = await response.json()
        await fetchTeam() // Refresh team data
        return teamData
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create team'
        setError(errorMessage)
        throw err
      }
    },
    [fetchTeam]
  )

  const updateTeam = useCallback(
    async (data: UpdateTeamData) => {
      try {
        setError(null)

        const response = await fetch('/api/teams', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update team')
        }

        const teamData = await response.json()
        await fetchTeam() // Refresh team data
        return teamData
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update team'
        setError(errorMessage)
        throw err
      }
    },
    [fetchTeam]
  )

  const deleteTeam = useCallback(async () => {
    try {
      setError(null)

      const response = await fetch('/api/teams', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete team')
      }

      setTeam(null)
      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete team'
      setError(errorMessage)
      throw err
    }
  }, [])

  const refresh = useCallback(() => {
    fetchTeam()
  }, [fetchTeam])

  return {
    team,
    isLoading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    refresh,
  }
}

// Hook for managing team members
export function useTeamMembers(options: UseTeamsOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options
  const [members, setMembers] = useState<TeamMembersResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/teams/members')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMembers(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch team members'
      setError(errorMessage)
      console.error('Error fetching team members:', err)
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  // Initial fetch
  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Set up polling
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(fetchMembers, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchMembers, refreshInterval, enabled])

  const inviteUser = useCallback(
    async (data: InviteUserData) => {
      try {
        setError(null)

        const response = await fetch('/api/teams/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to invite user')
        }

        const result = await response.json()
        await fetchMembers() // Refresh members data
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to invite user'
        setError(errorMessage)
        throw err
      }
    },
    [fetchMembers]
  )

  const updateUserRole = useCallback(
    async (data: UpdateUserRoleData) => {
      try {
        setError(null)

        const response = await fetch('/api/teams/members', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update user role')
        }

        const result = await response.json()
        await fetchMembers() // Refresh members data
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update user role'
        setError(errorMessage)
        throw err
      }
    },
    [fetchMembers]
  )

  const removeUser = useCallback(
    async (userId: string) => {
      try {
        setError(null)

        const response = await fetch(`/api/teams/members?userId=${userId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to remove user')
        }

        const result = await response.json()
        await fetchMembers() // Refresh members data
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to remove user'
        setError(errorMessage)
        throw err
      }
    },
    [fetchMembers]
  )

  const refresh = useCallback(() => {
    fetchMembers()
  }, [fetchMembers])

  return {
    members,
    isLoading,
    error,
    inviteUser,
    updateUserRole,
    removeUser,
    refresh,
  }
}
