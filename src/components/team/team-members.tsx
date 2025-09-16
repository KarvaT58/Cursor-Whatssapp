'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { useRealtimeTeam } from '@/hooks/use-realtime-team'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreHorizontal,
  Crown,
  User,
  UserMinus,
  Shield,
  UserPlus,
  Users,
  MessageSquare,
} from 'lucide-react'

type Team = Database['public']['Tables']['teams']['Row']
type User = Database['public']['Tables']['users']['Row']

interface TeamMembersProps {
  team: Team
  members: User[]
  onInviteUser: () => void
}

export function TeamMembers({ members, onInviteUser }: TeamMembersProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [userToRemove, setUserToRemove] = useState<User | null>(null)
  const { removeUser, updateUserRole } = useRealtimeTeam()

  const handleRemoveClick = (user: User) => {
    setUserToRemove(user)
    setRemoveDialogOpen(true)
  }

  const handleRemoveConfirm = async () => {
    if (userToRemove) {
      try {
        await removeUser(userToRemove.id)
        setRemoveDialogOpen(false)
        setUserToRemove(null)
      } catch (error) {
        console.error('Erro ao remover usuário:', error)
      }
    }
  }

  const handleRoleChange = async (user: User, newRole: 'admin' | 'user') => {
    try {
      await updateUserRole(user.id, newRole)
    } catch (error) {
      console.error('Erro ao atualizar função:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case 'admin':
        return <Crown className="size-4 text-yellow-500" />
      default:
        return <User className="size-4 text-muted-foreground" />
    }
  }

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      default:
        return 'Usuário'
    }
  }

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const formatJoinDate = (dateString: string | null) => {
    if (!dateString) return 'Data não disponível'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Membros da Equipe</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os membros e suas permissões
            </p>
          </div>
          <Button onClick={onInviteUser} className="flex items-center gap-2">
            <UserPlus className="size-4" />
            Convidar Membro
          </Button>
        </div>

        {members.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhum membro encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Convide membros para começar a trabalhar em equipe
              </p>
              <Button onClick={onInviteUser}>
                <UserPlus className="size-4 mr-2" />
                Convidar Primeiro Membro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card
                key={member.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {getInitials(member.name)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {member.name}
                          {getRoleIcon(member.role)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role !== 'admin' && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member, 'admin')}
                          >
                            <Crown className="size-4 mr-2" />
                            Tornar Administrador
                          </DropdownMenuItem>
                        )}
                        {member.role === 'admin' && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member, 'user')}
                          >
                            <User className="size-4 mr-2" />
                            Remover Administrador
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleRemoveClick(member)}
                          className="text-destructive"
                        >
                          <UserMinus className="size-4 mr-2" />
                          Remover da Equipe
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getRoleColor(member.role)} flex items-center gap-1`}
                      >
                        {getRoleIcon(member.role)}
                        {getRoleLabel(member.role)}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Shield className="size-4" />
                        <span>
                          Membro desde: {formatJoinDate(member.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="size-3 mr-1" />
                        Mensagem
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro da equipe</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {userToRemove?.name} da equipe?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
