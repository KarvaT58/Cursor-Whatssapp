'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTeams } from '@/hooks/use-teams'
import { UpdateTeamData } from '@/types/teams'
import { Save, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TeamSettingsProps {
  teamId: string
  className?: string
}

export function TeamSettings({ teamId, className }: TeamSettingsProps) {
  const { team, isLoading, error, updateTeam, deleteTeam } = useTeams()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<UpdateTeamData>({
    name: '',
    description: '',
  })

  // Initialize form data when team is loaded
  useState(() => {
    if (team) {
      setFormData({
        name: team?.team?.name || '',
        description: team.team.description || '',
      })
    }
  })

  const handleSave = async () => {
    try {
      await updateTeam(formData)
      setIsEditing(false)
      toast.success('Equipe atualizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar equipe')
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        'Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita.'
      )
    ) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteTeam()
      toast.success('Equipe excluída com sucesso!')
    } catch (error) {
      toast.error('Erro ao excluir equipe')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (team) {
      setFormData({
        name: team?.team?.name || '',
        description: team.team.description || '',
      })
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-muted-foreground">
            Carregando configurações da equipe...
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
              Erro ao carregar configurações da equipe: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!team) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma equipe encontrada. Crie uma equipe para começar.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Configurações da Equipe</CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Team Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant="default">Ativa</Badge>
        </div>

        {/* Team Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Equipe</Label>
          {isEditing ? (
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Digite o nome da equipe"
            />
          ) : (
            <div className="text-sm font-medium">{team?.team?.name || 'Equipe'}</div>
          )}
        </div>

        {/* Team Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          {isEditing ? (
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Digite uma descrição para a equipe"
              rows={3}
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              {team.team.description || 'Nenhuma descrição fornecida'}
            </div>
          )}
        </div>

        {/* Team Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Criada em:</span>
            <div className="font-medium">
              {new Date(team.team.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Última atualização:</span>
            <div className="font-medium">
              {new Date(team.team.updated_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t pt-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-destructive">
              Zona de Perigo
            </h4>
            <p className="text-sm text-muted-foreground">
              Excluir uma equipe removerá todos os membros e dados associados.
              Esta ação não pode ser desfeita.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Excluindo...' : 'Excluir Equipe'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
