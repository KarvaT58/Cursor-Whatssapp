import { useState } from 'react'
import { toast } from 'sonner'

interface GroupManagementOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useGroupManagement(options: GroupManagementOptions = {}) {
  const [loading, setLoading] = useState(false)

  const removeParticipants = async (groupId: string, phones: string[]) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove-participants',
          phones
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao remover participantes')
      }

      toast.success('Participantes removidos com sucesso!')
      options.onSuccess?.()
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao remover participantes'
      toast.error(errorMessage)
      options.onError?.(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const addAdmins = async (groupId: string, phones: string[]) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-admins',
          phones
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao adicionar administradores')
      }

      toast.success('Administradores adicionados com sucesso!')
      options.onSuccess?.()
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao adicionar administradores'
      toast.error(errorMessage)
      options.onError?.(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeAdmins = async (groupId: string, phones: string[]) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove-admins',
          phones
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao remover administradores')
      }

      toast.success('Administradores removidos com sucesso!')
      options.onSuccess?.()
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao remover administradores'
      toast.error(errorMessage)
      options.onError?.(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const addParticipants = async (groupId: string, phones: string[]) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-participants',
          phones
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao adicionar participantes')
      }

      toast.success('Participantes adicionados com sucesso!')
      options.onSuccess?.()
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao adicionar participantes'
      toast.error(errorMessage)
      options.onError?.(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getInviteLink = async (groupId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-invite-link'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao obter link de convite')
      }

      return result.data
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao obter link de convite'
      toast.error(errorMessage)
      options.onError?.(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    addParticipants,
    removeParticipants,
    addAdmins,
    removeAdmins,
    getInviteLink
  }
}
