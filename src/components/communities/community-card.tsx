'use client'

import { useState } from 'react'
import { Users, MessageSquare, Settings, MoreHorizontal, Eye, EyeOff, Link, Trash2, Edit, Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useCommunities } from '@/hooks/use-communities'

interface CommunityCardProps {
  community: {
    id: string
    name: string
    description: string
    image_url: string | null
    announcement_group_id: string | null
    max_groups: number
    is_public: boolean
    created_at: string
    groups_count?: number
    total_members?: number
  }
  onEdit?: (community: any) => void
  onManageGroups?: (community: any) => void
  onViewDetails?: (community: any) => void
  className?: string
}

export function CommunityCard({ 
  community, 
  onEdit, 
  onManageGroups, 
  onViewDetails,
  className 
}: CommunityCardProps) {
  const { deleteCommunity, isLoading } = useCommunities()
  const { toast } = useToast()

  // Estados locais
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Formatar data relativa
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semanas atrás`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} meses atrás`
    return `${Math.ceil(diffDays / 365)} anos atrás`
  }

  // Deletar comunidade
  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteCommunity(community.id)
      
      toast({
        title: 'Comunidade excluída!',
        description: 'A comunidade foi removida com sucesso',
      })
      
      setShowDeleteDialog(false)
    } catch (err) {
      console.error('Erro ao excluir comunidade:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Copiar link da comunidade
  const handleCopyLink = () => {
    const link = `${window.location.origin}/communities/${community.id}`
    navigator.clipboard.writeText(link)
    
    toast({
      title: 'Link copiado!',
      description: 'Link da comunidade copiado para a área de transferência',
    })
  }

  return (
    <>
      <Card className={`group hover:shadow-md transition-shadow ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Imagem da comunidade */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {community.image_url ? (
                  <img
                    src={community.image_url}
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{community.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={community.is_public ? 'default' : 'secondary'} className="text-xs">
                    {community.is_public ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Pública
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Privada
                      </>
                    )}
                  </Badge>
                  
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(community.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Menu de ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onViewDetails?.(community)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onEdit?.(community)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onManageGroups?.(community)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar Grupos
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link className="h-4 w-4 mr-2" />
                  Copiar Link
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Descrição */}
          {community.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {community.description}
            </p>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">
                {community.groups_count || 0}
              </div>
              <div className="text-xs text-muted-foreground">Grupos</div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">
                {community.total_members || 0}
              </div>
              <div className="text-xs text-muted-foreground">Membros</div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Máximo de grupos:</span>
              <span>{community.max_groups}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Criada em:</span>
              <span>{formatDate(community.created_at)}</span>
            </div>
            
            {community.announcement_group_id && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>Grupo de anúncios configurado</span>
              </div>
            )}
          </div>

          {/* Ações principais */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(community)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageGroups?.(community)}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-1" />
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Comunidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a comunidade "{community.name}"? 
              Esta ação não pode ser desfeita e todos os grupos vinculados serão desvinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
