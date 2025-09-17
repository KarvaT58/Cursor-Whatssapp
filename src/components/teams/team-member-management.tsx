'use client'

import { useState, useCallback } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTeamMembers } from '@/hooks/use-teams'
import {
  InviteUserData,
  UpdateUserRoleData,
  TeamRole,
  TeamMember,
} from '@/types/teams'
import {
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  Trash2,
  AlertCircle,
  MoreHorizontal,
  Settings,
  UserX,
  CheckCircle,
  Clock,
  Search,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TeamMemberManagementProps {
  teamId: string
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

const roleColors: Record<TeamRole, string> = {
  owner: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  admin: 'bg-blue-100 text-blue-800 border-blue-200',
  user: 'bg-gray-100 text-gray-800 border-gray-200',
}

export function TeamMemberManagement({
  teamId,
  className,
}: TeamMemberManagementProps) {
  const { members, isLoading, error, inviteUser, updateUserRole, removeUser } =
    useTeamMembers()

  const [isInviting, setIsInviting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<TeamRole | 'all'>('all')
  const [inviteData, setInviteData] = useState<InviteUserData>({
    email: '',
    role: 'user',
  })
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)

  // Filter members based on search and role
  const filteredMembers =
    members?.members.filter((member) => {
      const matchesSearch =
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === 'all' || member.role === roleFilter

      return matchesSearch && matchesRole
    }) || []

  const handleInvite = async () => {
    if (!inviteData.email.trim()) {
      toast.error('Por favor, insira um e-mail válido')
      return
    }

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

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUser(userId)
      setShowRemoveDialog(false)
      setSelectedMember(null)
      toast.success('Usuário removido com sucesso!')
    } catch (error) {
      toast.error('Erro ao remover usuário')
    }
  }

  const openRemoveDialog = (member: TeamMember) => {
    setSelectedMember(member)
    setShowRemoveDialog(true)
  }

  const getMemberStatus = (member: TeamMember) => {
    if (member.isOnline) {
      return {
        text: 'Online',
        color: 'text-green-600',
        icon: <CheckCircle className="h-3 w-3" />,
      }
    }
    if (member.lastSeen) {
      return {
        text: `Visto ${formatDistanceToNow(new Date(member.lastSeen), { addSuffix: true, locale: ptBR })}`,
        color: 'text-gray-500',
        icon: <Clock className="h-3 w-3" />,
      }
    }
    return {
      text: 'Offline',
      color: 'text-gray-400',
      icon: <UserX className="h-3 w-3" />,
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
          <div>
            <CardTitle>Gerenciamento de Membros</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {members.members.length} membro
              {members.members.length !== 1 ? 's' : ''} na equipe
            </p>
          </div>
          <Button onClick={() => setIsInviting(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar Membro
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar membros..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as TeamRole | 'all')
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as funções</SelectItem>
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

        {/* Invite Form */}
        {isInviting && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
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
        <div className="space-y-3">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserX className="h-12 w-12 mx-auto mb-4" />
              <p>Nenhum membro encontrado</p>
              {searchTerm || roleFilter !== 'all' ? (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('all')
                  }}
                  className="mt-2"
                >
                  Limpar filtros
                </Button>
              ) : null}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const status = getMemberStatus(member)
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {member?.name?.charAt(0) || member?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member?.name || member?.email || 'Usuário'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member?.email || 'Email não disponível'}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs ${status.color}`}
                      >
                        {status.icon}
                        {status.text}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`${roleColors[member.role]} border`}
                    >
                      <div className="flex items-center gap-1">
                        {roleIcons[member.role]}
                        {roleLabels[member.role]}
                      </div>
                    </Badge>

                    {member.role === 'user' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(member.id, 'admin')}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Tornar Administrador
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openRemoveDialog(member)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover da Equipe
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Role Descriptions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Funções da Equipe</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(roleDescriptions).map(([role, description]) => (
              <div key={role} className="flex items-start gap-2 text-sm">
                <div className="flex-shrink-0 mt-0.5">
                  {roleIcons[role as TeamRole]}
                </div>
                <div>
                  <span className="font-medium">
                    {roleLabels[role as TeamRole]}:
                  </span>
                  <p className="text-muted-foreground text-xs mt-1">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Remove Member Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Membro da Equipe</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{' '}
              <strong>{selectedMember?.name || selectedMember?.email}</strong>{' '}
              da equipe? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedMember && handleRemoveUser(selectedMember.id)
              }
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
