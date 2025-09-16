'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWhatsAppGroups } from '@/hooks/use-whatsapp-groups'
import { useAuth } from '@/providers/auth-provider'
import { GroupChat } from '@/components/groups/group-chat'
import { GroupParticipants } from '@/components/groups/group-participants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Users, AlertCircle } from 'lucide-react'

export default function GroupChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [showParticipants, setShowParticipants] = useState(false)

  const { groups, loading, error, addParticipant, removeParticipant } =
    useWhatsAppGroups({ userId: user?.id })

  const groupId = params.id as string
  const group = groups.find((g) => g.id === groupId)

  useEffect(() => {
    if (!loading && !group && groupId) {
      // Group not found, redirect to groups list
      router.push('/dashboard/groups')
    }
  }, [group, groupId, loading, router])

  const handleAddParticipant = async (phone: string) => {
    if (!group) return

    try {
      await addParticipant(group.id, phone)
    } catch (err) {
      console.error('Erro ao adicionar participante:', err)
    }
  }

  const handleRemoveParticipant = async (phone: string) => {
    if (!group) return

    try {
      await removeParticipant(group.id, phone)
    } catch (err) {
      console.error('Erro ao remover participante:', err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Grupo não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O grupo que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => router.push('/dashboard/groups')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Grupos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/groups')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Chat do Grupo</h1>
          <p className="text-muted-foreground">
            Conversando em &quot;{group.name}&quot;
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowParticipants(true)}>
          <Users className="h-4 w-4 mr-2" />
          Participantes
        </Button>
      </div>

      <div className="h-full">
        <GroupChat
          group={group}
          onClose={() => router.push('/dashboard/groups')}
        />
      </div>

      <GroupParticipants
        group={group}
        open={showParticipants}
        onOpenChange={setShowParticipants}
        onAddParticipant={handleAddParticipant}
        onRemoveParticipant={handleRemoveParticipant}
      />
    </div>
  )
}
