'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTeamMembers } from '@/hooks/use-teams'
import { InviteUserData, UpdateUserRoleData, TeamRole } from '@/types/teams'
import {
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface TeamMembersProps {
  className?: string
}

const roleLabels: Record<TeamRole, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  user: 'Membro',
}

const roleDescriptions: Record<TeamRole, string> = {
  owner: 'Acesso total à equipe e configurações',
  admin: 'Pode gerenciar membros e configurações',
  user: 'Acesso básico à equipe',
}

const roleIcons: Record<TeamRole, React.ReactNode> = {
  owner: <Crown className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
}

export function TeamMembers({ className }: TeamMembersProps) {
  const { members, isLoading, error, inviteUser, updateUserRole, removeUser } =
    useTeamMembers()
  const [isInviting, setIsInviting] = useState(false)
  const [inviteData, setInviteData] = useState<InviteUserData>({
    email: '',
    role: 'user',
  })

  const handleInvite = async () => {
    try {
      await inviteUser(inviteData)
      setInviteData({ email: '', role: 'user' })
      setIsInviting(false)
      toast.success('Convite enviado com sucesso!')
    } catch (error) {
      toast.error('Erro ao enviar convite')
    }
  }

  const handleUpdateRole = async (userId: string, role: TeamRole) => {
    try {
      await updateUserRole({ userId, role })
      toast.success('Função atualizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar função')
    }
  }

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja remover ${userName} da equipe?`)) {
      return
    }

    try {
      await removeUser(userId)
      toast.success('Usuário removido com sucesso!')
    } catch (error) {
      toast.error('Erro ao remover usuário')
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-muted-foreground">
            Carregando membros da equipe...
          </div>
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
              Erro ao carregar membros da equipe: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!members) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Nenhuma equipe encontrada.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Membros da Equipe</CardTitle>
          <Button onClick={() => setIsInviting(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Invite Form */}
        {isInviting && (
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Convidar Novo Membro</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, email: e.target.value })
                  }
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value: TeamRole) =>
                    setInviteData({ ...inviteData, role: value })
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
            <div className="flex gap-2">
              <Button onClick={handleInvite} size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Convite
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsInviting(false)
                  setInviteData({ email: '', role: 'user' })
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-4">
          {members.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    {member.name || member.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {roleIcons[member.role]}
                  <Badge variant="outline">{roleLabels[member.role]}</Badge>
                </div>

                {member.role === 'user' && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(value: TeamRole) =>
                        handleUpdateRole(member.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
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

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveUser(member.id, member.name || member.email)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Role Descriptions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Funções da Equipe</h4>
          <div className="space-y-2">
            {Object.entries(roleDescriptions).map(([role, description]) => (
              <div key={role} className="flex items-center gap-2 text-sm">
                {roleIcons[role as TeamRole]}
                <span className="font-medium">
                  {roleLabels[role as TeamRole]}:
                </span>
                <span className="text-muted-foreground">{description}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
