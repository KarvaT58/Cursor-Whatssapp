'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Crown,
  Shield,
  User,
  Copy,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TeamRole } from '@/types/teams'

interface TeamInvite {
  id: string
  email: string
  role: TeamRole
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  invitedBy: string
  invitedByName: string
  expiresAt: string
  createdAt: string
}

interface TeamInvitesProps {
  teamId: string
  className?: string
}

const roleLabels: Record<TeamRole, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  user: 'Membro',
}

const roleIcons: Record<TeamRole, React.ReactNode> = {
  owner: <Crown className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
}

const statusLabels = {
  pending: 'Pendente',
  accepted: 'Aceito',
  expired: 'Expirado',
  cancelled: 'Cancelado',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
}

const statusIcons = {
  pending: <Clock className="h-3 w-3" />,
  accepted: <CheckCircle className="h-3 w-3" />,
  expired: <XCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
}

export function TeamInvites({ teamId, className }: TeamInvitesProps) {
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'user' as TeamRole,
  })

  // Fetch invites
  const fetchInvites = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/teams/${teamId}/invites`)
      if (!response.ok) {
        throw new Error('Failed to fetch invites')
      }

      const data = await response.json()
      setInvites(data.invites || [])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch invites'
      setError(errorMessage)
      console.error('Error fetching invites:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Create invite
  const createInvite = async () => {
    if (!newInvite.email.trim()) {
      toast.error('Por favor, insira um e-mail válido')
      return
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvite),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create invite')
      }

      const data = await response.json()
      setInvites((prev) => [data.invite, ...prev])
      setNewInvite({ email: '', role: 'user' })
      setIsCreatingInvite(false)
      toast.success('Convite criado com sucesso!')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create invite'
      toast.error(errorMessage)
    }
  }

  // Cancel invite
  const cancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/invites/${inviteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel invite')
      }

      setInvites((prev) =>
        prev.map((invite) =>
          invite.id === inviteId
            ? { ...invite, status: 'cancelled' as const }
            : invite
        )
      )
      toast.success('Convite cancelado com sucesso!')
    } catch (err) {
      toast.error('Erro ao cancelar convite')
    }
  }

  // Copy invite link
  const copyInviteLink = async (inviteId: string) => {
    try {
      const inviteLink = `${window.location.origin}/invite/${inviteId}`
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Link do convite copiado!')
    } catch (err) {
      toast.error('Erro ao copiar link')
    }
  }

  // Resend invite
  const resendInvite = async (inviteId: string) => {
    try {
      const response = await fetch(
        `/api/teams/${teamId}/invites/${inviteId}/resend`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to resend invite')
      }

      toast.success('Convite reenviado com sucesso!')
    } catch (err) {
      toast.error('Erro ao reenviar convite')
    }
  }

  useEffect(() => {
    fetchInvites()
  }, [teamId])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-muted-foreground">Carregando convites...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar convites: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const pendingInvites = invites.filter((invite) => invite.status === 'pending')
  const otherInvites = invites.filter((invite) => invite.status !== 'pending')

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Convites da Equipe</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {invites.length} convite{invites.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Dialog open={isCreatingInvite} onOpenChange={setIsCreatingInvite}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Convite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Convite</DialogTitle>
                <DialogDescription>
                  Convide um novo membro para a equipe enviando um e-mail.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newInvite.email}
                    onChange={(e) =>
                      setNewInvite({ ...newInvite, email: e.target.value })
                    }
                    placeholder="usuario@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={newInvite.role}
                    onValueChange={(value: TeamRole) =>
                      setNewInvite({ ...newInvite, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            {roleIcons[value as TeamRole]}
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingInvite(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={createInvite}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Convite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">
              Convites Pendentes ({pendingInvites.length})
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">
                      {invite.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 w-fit"
                      >
                        {roleIcons[invite.role]}
                        {roleLabels[invite.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${statusColors[invite.status]} border flex items-center gap-1 w-fit`}
                      >
                        {statusIcons[invite.status]}
                        {statusLabels[invite.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(invite.expiresAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyInviteLink(invite.id)}
                          title="Copiar link do convite"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resendInvite(invite.id)}
                          title="Reenviar convite"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvite(invite.id)}
                          title="Cancelar convite"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Other Invites */}
        {otherInvites.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">
              Histórico de Convites ({otherInvites.length})
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enviado por</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">
                      {invite.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 w-fit"
                      >
                        {roleIcons[invite.role]}
                        {roleLabels[invite.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${statusColors[invite.status]} border flex items-center gap-1 w-fit`}
                      >
                        {statusIcons[invite.status]}
                        {statusLabels[invite.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invite.invitedByName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(invite.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {invites.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4" />
            <p>Nenhum convite encontrado</p>
            <p className="text-sm">Crie um convite para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
