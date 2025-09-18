'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Search, Link, Unlink, Settings, MessageSquare, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useCommunities } from '@/hooks/use-communities'

interface CommunityGroupsManagerProps {
  community: {
    id: string
    name: string
    description: string
    max_groups: number
    announcement_group_id: string | null
  }
  onClose?: () => void
  className?: string
}

export function CommunityGroupsManager({ community, onClose, className }: CommunityGroupsManagerProps) {
  const { getCommunityGroups, linkGroupToCommunity, unlinkGroupFromCommunity, isLoading, error, clearError } = useCommunities()
  const { toast } = useToast()

  // Estados locais
  const [linkedGroups, setLinkedGroups] = useState<any[]>([])
  const [availableGroups, setAvailableGroups] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  // Carregar grupos ao montar o componente
  useEffect(() => {
    loadGroups()
  }, [community.id])

  // Carregar grupos
  const loadGroups = async () => {
    try {
      const result = await getCommunityGroups(community.id)
      setLinkedGroups(result.linked_groups || [])
      setAvailableGroups(result.available_groups || [])
    } catch (err) {
      console.error('Erro ao carregar grupos:', err)
    }
  }

  // Filtrar grupos disponíveis
  const filteredAvailableGroups = availableGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Alternar seleção de grupo
  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Vincular grupos selecionados
  const handleLinkGroups = async () => {
    if (selectedGroups.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um grupo para vincular',
        variant: 'destructive',
      })
      return
    }

    try {
      for (const groupId of selectedGroups) {
        await linkGroupToCommunity(community.id, groupId)
      }
      
      toast({
        title: 'Grupos vinculados!',
        description: `${selectedGroups.length} grupo(s) foram vinculados à comunidade`,
      })
      
      setSelectedGroups([])
      await loadGroups()
    } catch (err) {
      console.error('Erro ao vincular grupos:', err)
    }
  }

  // Desvincular grupo
  const handleUnlinkGroup = async (groupId: string) => {
    try {
      await unlinkGroupFromCommunity(community.id, groupId)
      
      toast({
        title: 'Grupo desvinculado!',
        description: 'O grupo foi removido da comunidade',
      })
      
      await loadGroups()
    } catch (err) {
      console.error('Erro ao desvincular grupo:', err)
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciar Grupos - {community.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Vincule e desvincule grupos desta comunidade
            </p>
          </div>
          
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <Button variant="link" onClick={clearError} className="ml-2 p-0 h-auto">
                Limpar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Informações da comunidade */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Grupos vinculados:</span>
              <p className="font-semibold">{linkedGroups.length} / {community.max_groups}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Grupo de anúncios:</span>
              <p className="font-semibold">
                {community.announcement_group_id ? 'Configurado' : 'Não configurado'}
              </p>
            </div>
          </div>
        </div>

        {/* Grupos vinculados */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Grupos Vinculados</h3>
            <Badge variant="outline">
              {linkedGroups.length} / {community.max_groups}
            </Badge>
          </div>

          {linkedGroups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Nenhum grupo vinculado</h4>
              <p className="text-muted-foreground">
                Vincule grupos para organizá-los nesta comunidade
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedGroups.map((group) => (
                <Card key={group.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        <div>
                          <h4 className="font-medium">{group.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{group.participants?.length || 0} membros</span>
                            <span>•</span>
                            <span>Vinculado em {formatDate(group.linked_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {group.id === community.announcement_group_id && (
                          <Badge variant="default" className="text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Anúncios
                          </Badge>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlinkGroup(group.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Unlink className="h-4 w-4 mr-1" />
                          Desvincular
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Grupos disponíveis para vincular */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Grupos Disponíveis</h3>
            <Badge variant="outline">
              {availableGroups.length} disponíveis
            </Badge>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {availableGroups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Nenhum grupo disponível</h4>
              <p className="text-muted-foreground">
                Todos os seus grupos já estão vinculados a comunidades
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAvailableGroups.map((group) => (
                <Card 
                  key={group.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedGroups.includes(group.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleGroupSelection(group.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => toggleGroupSelection(group.id)}
                          className="rounded"
                        />
                        
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        <div>
                          <h4 className="font-medium">{group.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{group.participants?.length || 0} membros</span>
                            <span>•</span>
                            <span>Criado em {formatDate(group.created_at)}</span>
                          </div>
                          {group.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={group.is_public ? 'default' : 'secondary'} className="text-xs">
                          {group.is_public ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Público
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Privado
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Botão para vincular grupos selecionados */}
          {selectedGroups.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedGroups.length} grupo(s) selecionado(s)
              </span>
              
              <Button
                onClick={handleLinkGroups}
                disabled={isLoading || linkedGroups.length + selectedGroups.length > community.max_groups}
              >
                <Link className="h-4 w-4 mr-2" />
                Vincular Grupos
              </Button>
            </div>
          )}

          {/* Aviso sobre limite */}
          {linkedGroups.length >= community.max_groups && (
            <Alert>
              <AlertDescription>
                Limite de grupos atingido. Você pode vincular no máximo {community.max_groups} grupos a esta comunidade.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
