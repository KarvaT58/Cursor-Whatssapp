'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, Users, Hash, AlertCircle, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

interface GroupLink {
  id: string
  universal_link: string
  total_participants: number
  family: {
    name: string
    base_name: string
    total_participants: number
    whatsapp_groups: Array<{
      id: string
      name: string
      participants: string[]
    }>
  }
  stats: {
    totalGroups: number
    totalParticipants: number
    availableSpots: number
  }
}

export default function UniversalLinks() {
  const [groupLinks, setGroupLinks] = useState<GroupLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroupLinks()
  }, [])

  const fetchGroupLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/group-links')
      const data = await response.json()

      if (data.success) {
        setGroupLinks(data.data)
      } else {
        console.error('Erro ao buscar links universais:', data.error)
        toast.error('Erro ao carregar links universais')
      }
    } catch (error) {
      console.error('Erro ao buscar links universais:', error)
      toast.error('Erro ao carregar links universais')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link copiado para a área de transferência!')
    } catch (error) {
      console.error('Erro ao copiar:', error)
      toast.error('Erro ao copiar link')
    }
  }

  const openLink = (link: string) => {
    window.open(link, '_blank')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Links Universais</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (groupLinks.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Links Universais</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LinkIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum link universal encontrado
            </h3>
            <p className="text-gray-500 text-center">
              Crie grupos para gerar automaticamente links universais que permitem
              entrada automática de participantes.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Links Universais</h2>
        <Badge variant="secondary" className="text-sm">
          <LinkIcon className="h-4 w-4 mr-1" />
          {groupLinks.length} {groupLinks.length === 1 ? 'link' : 'links'}
        </Badge>
      </div>

      <div className="grid gap-4">
        {groupLinks.map((link) => (
          <Card key={link.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{link.family.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Base: {link.family.base_name}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.universal_link)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openLink(link.universal_link)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Abrir
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Link */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">Link Universal:</p>
                <p className="text-sm font-mono text-gray-800 break-all">
                  {link.universal_link}
                </p>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Hash className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600">Grupos</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {link.stats.totalGroups}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600">Participantes</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {link.stats.totalParticipants}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600">Vagas</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {link.stats.availableSpots}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                  </div>
                  <Badge 
                    variant={link.stats.availableSpots > 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {link.stats.availableSpots > 0 ? 'Ativo' : 'Lotado'}
                  </Badge>
                </div>
              </div>

              {/* Lista de grupos */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Grupos da Família:</p>
                <div className="space-y-1">
                  {link.family.whatsapp_groups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                      <span className="font-medium">{group.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {group.participants.length}/1024
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}