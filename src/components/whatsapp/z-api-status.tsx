'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database } from '@/types/database'
import { Wifi, WifiOff, Settings, Plus } from 'lucide-react'

type ZApiInstance = Database['public']['Tables']['z_api_instances']['Row']

export function ZApiStatus() {
  const [instances, setInstances] = useState<ZApiInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [activeInstance, setActiveInstance] = useState<ZApiInstance | null>(
    null
  )
  const supabase = createClient()

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from('z_api_instances')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar instâncias:', error)
          return
        }

        setInstances(data || [])

        // Definir instância ativa
        const active =
          data?.find((instance) => instance.is_active) || data?.[0] || null
        setActiveInstance(active)
      } catch (error) {
        console.error('Erro ao buscar instâncias:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInstances()
  }, [supabase])

  const handleInstanceSelect = async (instance: ZApiInstance) => {
    try {
      // Desativar todas as instâncias
      await supabase
        .from('z_api_instances')
        .update({ is_active: false })
        .eq('user_id', instance.user_id)

      // Ativar a instância selecionada
      await supabase
        .from('z_api_instances')
        .update({ is_active: true })
        .eq('id', instance.id)

      setActiveInstance(instance)
    } catch (error) {
      console.error('Erro ao alterar instância ativa:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 border-b">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Instâncias Z-API</h3>
            <Button size="sm" variant="outline">
              <Plus className="size-3 mr-1" />
              Nova
            </Button>
          </div>

          {instances.length === 0 ? (
            <div className="text-center py-4">
              <WifiOff className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Nenhuma instância configurada
              </p>
              <Button size="sm" variant="outline">
                <Settings className="size-3 mr-1" />
                Configurar
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {instances.map((instance) => (
                <div
                  key={instance.id}
                  className={`p-2 rounded-md border cursor-pointer transition-colors ${
                    activeInstance?.id === instance.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleInstanceSelect(instance)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {instance.name}
                        </span>
                        {instance.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            Ativa
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {instance.instance_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {instance.is_active ? (
                        <Wifi className="size-3 text-green-500" />
                      ) : (
                        <WifiOff className="size-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
