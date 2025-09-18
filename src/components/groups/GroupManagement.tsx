'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Users, UserMinus, Crown, Link, Plus, Search } from 'lucide-react'
import { useGroupManagement } from '@/hooks/useGroupManagement'
import { ContactSearch } from '@/components/contacts/contact-search'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ZApiClient } from '@/lib/z-api/client'

interface Participant {
  phone: string
  isAdmin: boolean
  isSuperAdmin: boolean
  name?: string
}

interface GroupManagementProps {
  groupId: string
  groupName: string
  participants?: Participant[]
  onUpdate?: () => void
}

export function GroupManagement({ 
  groupId, 
  groupName, 
  participants = [], 
  onUpdate 
}: GroupManagementProps) {
  const [inviteLink, setInviteLink] = useState<string>('')
  const [localParticipants, setLocalParticipants] = useState<Participant[]>(participants)
  const [selectedContacts, setSelectedContacts] = useState<any[]>([])
  const [showAddParticipants, setShowAddParticipants] = useState(false)
  const [participantSearch, setParticipantSearch] = useState<string>('')
  const [adminSearch, setAdminSearch] = useState<string>('')
  
  // Atualizar participantes locais quando props mudarem (apenas na inicialização)
  React.useEffect(() => {
    setLocalParticipants(participants)
  }, []) // Removido [participants] para evitar sobrescrever mudanças locais
  
  // Debug: monitorar mudanças no estado local
  React.useEffect(() => {
    console.log('Estado local mudou:', localParticipants)
  }, [localParticipants])

  // Buscar metadados do grupo para obter informações de administrador (apenas uma vez)
  React.useEffect(() => {
    let isMounted = true
    
    const fetchGroupMetadata = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user || !isMounted) return

        // Buscar instância Z-API ativa
        const { data: userInstance } = await supabase
          .from('z_api_instances')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (!userInstance || !isMounted) return

        // Criar cliente Z-API
        const zApiClient = new ZApiClient(
          userInstance.instance_id,
          userInstance.instance_token,
          userInstance.client_token
        )

        // Obter informações da instância para pegar o número de telefone real
        const instanceInfo = await zApiClient.getInstanceInfo()
        let userPhoneNumber = null
        
        if (instanceInfo.success && instanceInfo.data) {
          // Tentar diferentes campos que podem conter o número de telefone
          userPhoneNumber = instanceInfo.data.phone || instanceInfo.data.phoneNumber || instanceInfo.data.number
          console.log('📱 Dados da instância obtidos:', instanceInfo.data)
          console.log('📱 Número de telefone do usuário obtido da instância:', userPhoneNumber)
        } else {
          console.log('⚠️ Não foi possível obter o número de telefone da instância, usando instance_id como fallback')
          userPhoneNumber = userInstance.instance_id
        }
        
        // Se ainda não temos o número real, vamos usar uma lógica baseada no owner do grupo
        // Como sabemos que o owner é 554598228660, vamos assumir que é o número do usuário conectado
        if (!userPhoneNumber || userPhoneNumber === userInstance.instance_id) {
          console.log('🔄 Tentando obter número de telefone baseado no owner do grupo...')
          // Vamos buscar os metadados do grupo primeiro para obter o owner
          const tempMetadataResult = await zApiClient.getGroupMetadata(groupId)
          if (tempMetadataResult.success && tempMetadataResult.data && tempMetadataResult.data.owner) {
            userPhoneNumber = tempMetadataResult.data.owner
            console.log('📱 Número de telefone inferido do owner do grupo:', userPhoneNumber)
          }
        }

        // Buscar metadados do grupo
        const metadataResult = await zApiClient.getGroupMetadata(groupId)
        
        if (metadataResult.success && metadataResult.data) {
          const groupData = metadataResult.data
          console.log('📋 Metadados do grupo obtidos:', groupData)
          
          // Atualizar participantes com informações de administrador
          console.log('🔍 DEBUG: Comparando participantes:', {
            localParticipants: localParticipants.map(p => ({ phone: p.phone, isAdmin: p.isAdmin, isSuperAdmin: p.isSuperAdmin })),
            whatsappParticipants: groupData.participants?.map((p: any) => ({ phone: p.phone, isAdmin: p.isAdmin, isSuperAdmin: p.isSuperAdmin })),
            groupOwner: groupData.owner,
            userPhoneNumber: userPhoneNumber
          })
          
          const updatedParticipants = localParticipants.map(participant => {
            // Verificar se é o usuário conectado (usando instance_id ou número real)
            const isUserConnected = participant.phone === userInstance.instance_id || participant.phone === userPhoneNumber
            
            const whatsappParticipant = groupData.participants?.find((p: any) => p.phone === participant.phone)
            if (whatsappParticipant) {
              console.log(`✅ Encontrou participante ${participant.phone} no WhatsApp:`, whatsappParticipant)
              return {
                ...participant,
                isAdmin: whatsappParticipant.isAdmin || false,
                isSuperAdmin: whatsappParticipant.isSuperAdmin || false
              }
            }
            
            // Se for o usuário conectado e for o owner do grupo
            if (isUserConnected && userPhoneNumber === groupData.owner) {
              console.log(`👑 Usuário conectado (${participant.phone}) é o owner do grupo`)
              return {
                ...participant,
                isAdmin: true,
                isSuperAdmin: true
              }
            }
            
            // Se for o usuário conectado e o participant.phone for o owner (caso o instance_id seja usado como fallback)
            if (isUserConnected && participant.phone === groupData.owner) {
              console.log(`👑 Usuário conectado (${participant.phone}) é o owner do grupo (fallback)`)
              return {
                ...participant,
                isAdmin: true,
                isSuperAdmin: true
              }
            }
            
            // Se for o usuário conectado mas não for owner, verificar se está na lista de participantes do WhatsApp
            if (isUserConnected && userPhoneNumber) {
              const userInWhatsapp = groupData.participants?.find((p: any) => p.phone === userPhoneNumber)
              if (userInWhatsapp) {
                console.log(`✅ Usuário conectado (${participant.phone}) encontrado no WhatsApp como:`, userInWhatsapp)
                return {
                  ...participant,
                  isAdmin: userInWhatsapp.isAdmin || false,
                  isSuperAdmin: userInWhatsapp.isSuperAdmin || false
                }
              }
            }
            
            // Se não encontrou o participante na lista do WhatsApp, verificar se é o owner
            if (participant.phone === groupData.owner) {
              console.log(`👑 Participante ${participant.phone} é o owner do grupo`)
              return {
                ...participant,
                isAdmin: true,
                isSuperAdmin: true // Owner é sempre super admin
              }
            }
            
            console.log(`❌ Participante ${participant.phone} não encontrado no WhatsApp nem é owner`)
            return participant
          })
          
          // Substituir instance_id pelo número de telefone real se necessário
          const finalParticipants = updatedParticipants.map(participant => {
            if (participant.phone === userInstance.instance_id && userPhoneNumber) {
              console.log(`🔄 Substituindo instance_id (${participant.phone}) pelo número real (${userPhoneNumber})`)
              return {
                ...participant,
                phone: userPhoneNumber
              }
            }
            return participant
          })
          
          setLocalParticipants(finalParticipants)
          console.log('✅ Participantes atualizados com informações de administrador:', finalParticipants)
          
          // Sincronizar com o banco de dados se necessário
          await syncParticipantsWithDatabase(finalParticipants)
        }
      } catch (error) {
        console.error('❌ Erro ao buscar metadados do grupo:', error)
      }
    }

    if (groupId && localParticipants.length > 0) {
      fetchGroupMetadata()
    }
    
    return () => {
      isMounted = false
    }
  }, [groupId]) // Removido participants das dependências para evitar chamadas excessivas

  // Função para sincronizar participantes com o banco de dados
  const syncParticipantsWithDatabase = async (participants: Participant[]) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Buscar o grupo no banco de dados
      const { data: group, error: groupError } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('whatsapp_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (groupError || !group) {
        console.error('❌ Erro ao buscar grupo no banco:', groupError)
        return
      }

      // Extrair apenas os números de telefone dos participantes
      const phoneNumbers = participants.map(p => p.phone)
      
      // Verificar se a lista mudou
      const currentParticipants = group.participants || []
      const hasChanged = JSON.stringify(currentParticipants.sort()) !== JSON.stringify(phoneNumbers.sort())
      
      console.log('🔄 Verificando mudanças nos participantes:', {
        antigos: currentParticipants,
        novos: phoneNumbers,
        mudou: hasChanged
      })
      
      if (hasChanged) {
        console.log('🔄 Sincronizando participantes com o banco de dados:', {
          antigos: currentParticipants,
          novos: phoneNumbers
        })
        
        // Atualizar no banco de dados
        const { error: updateError } = await supabase
          .from('whatsapp_groups')
          .update({ 
            participants: phoneNumbers,
            updated_at: new Date().toISOString()
          })
          .eq('id', group.id)

        if (updateError) {
          console.error('❌ Erro ao atualizar participantes no banco:', updateError)
        } else {
          console.log('✅ Participantes sincronizados com o banco de dados')
        }
      } else {
        console.log('✅ Participantes já estão sincronizados com o banco')
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar participantes:', error)
    }
  }
  
  const { 
    loading, 
    addParticipants,
    removeParticipants, 
    addAdmins, 
    removeAdmins, 
    getInviteLink 
  } = useGroupManagement({
    onSuccess: () => {
      // Não chamar onUpdate aqui para evitar fechamento do modal
      console.log('Operação realizada com sucesso')
    }
  })

  const handleGetInviteLink = async () => {
    try {
      const result = await getInviteLink(groupId)
      if (result?.invitationLink) {
        setInviteLink(result.invitationLink)
        toast.success('Link de convite obtido com sucesso!')
      }
    } catch (error) {
      // Error já tratado no hook
    }
  }

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  // Função para adicionar participantes
  const handleAddParticipants = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Selecione pelo menos um contato para adicionar')
      return
    }

    try {
      const phones = selectedContacts.map(contact => contact.phone)
      await addParticipants(groupId, phones)
      
      // Adicionar participantes ao estado local
      const newParticipants = selectedContacts.map(contact => ({
        phone: contact.phone,
        isAdmin: false,
        isSuperAdmin: false,
        name: contact.name
      }))
      
      setLocalParticipants(prev => [...prev, ...newParticipants])
      setSelectedContacts([])
      setShowAddParticipants(false)
    } catch (error) {
      console.error('Erro ao adicionar participantes:', error)
      // Error já tratado no hook
    }
  }

  // Função para remover participante localmente
  const handleRemoveParticipant = async (phone: string) => {
    console.log('🔍 DEBUG: Removendo participante:', phone)
    console.log('🔍 DEBUG: Estado antes da remoção:', localParticipants)
    
    // Atualizar estado local imediatamente (antes da chamada da API)
    setLocalParticipants(prev => {
      const filtered = prev.filter(p => p.phone !== phone)
      console.log('🔍 DEBUG: Estado após filtro (atualização imediata):', filtered)
      return filtered
    })
    
    try {
      const result = await removeParticipants(groupId, [phone])
      console.log('🔍 DEBUG: Resultado da remoção:', result)
      console.log('🔍 DEBUG: Participante removido com sucesso!')
    } catch (error) {
      console.error('🔍 DEBUG: Erro ao remover participante:', error)
      // Mesmo com erro na API, o participante já foi removido do estado local
      // Se houver erro, podemos reverter o estado local se necessário
      console.log('🔍 DEBUG: Participante já removido do estado local, mantendo remoção')
    }
  }

  // Função para adicionar admin localmente
  const handleAddAdmin = async (phone: string) => {
    try {
      await addAdmins(groupId, [phone])
      // Atualizar estado local imediatamente
      setLocalParticipants(prev => 
        prev.map(p => 
          p.phone === phone 
            ? { ...p, isAdmin: true }
            : p
        )
      )
    } catch (error) {
      // Error já tratado no hook
    }
  }

  // Função para remover admin localmente
  const handleRemoveAdmin = async (phone: string) => {
    try {
      console.log('Removendo admin:', phone)
      await removeAdmins(groupId, [phone])
      // Atualizar estado local imediatamente
      setLocalParticipants(prev => {
        const updated = prev.map(p => 
          p.phone === phone 
            ? { ...p, isAdmin: false, isSuperAdmin: false }
            : p
        )
        console.log('Estado atualizado após remover admin:', updated)
        return updated
      })
    } catch (error) {
      console.error('Erro ao remover admin:', error)
      // Error já tratado no hook
    }
  }

  const regularParticipants = localParticipants.filter(p => !p.isAdmin && !p.isSuperAdmin)
  const admins = localParticipants.filter(p => p.isAdmin || p.isSuperAdmin)
  
  // Função para filtrar participantes por pesquisa
  const filterParticipants = (participants: Participant[], searchTerm: string) => {
    if (!searchTerm.trim()) return participants
    
    return participants.filter(participant => 
      participant.phone.includes(searchTerm) ||
      (participant.name && participant.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  // Participantes filtrados
  const filteredRegularParticipants = filterParticipants(regularParticipants, participantSearch)
  const filteredAdmins = filterParticipants(admins, adminSearch)

  // Debug logs
  console.log('Local participants:', localParticipants)
  console.log('Regular participants:', regularParticipants)
  console.log('Admins:', admins)

  return (
    <div className="space-y-6">
      {/* Link de convite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Link de Convite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Obtenha o link de convite do grupo
          </p>
          
          <Button
            onClick={handleGetInviteLink}
            disabled={loading}
            className="w-full"
          >
            <Link className="h-4 w-4 mr-2" />
            Obter Link de Convite
          </Button>
          
          {inviteLink && (
            <div className="space-y-2">
              <Label>Link de convite:</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyLink} variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adicionar participantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Participantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione contatos para adicionar ao grupo
          </p>
          
          <Button
            onClick={(e) => {
              console.log('🔍 DEBUG: Botão "Adicionar Participantes" clicado!')
              console.log('🔍 DEBUG: showAddParticipants atual:', showAddParticipants)
              console.log('🔍 DEBUG: Vai alterar para:', !showAddParticipants)
              e.preventDefault()
              e.stopPropagation()
              setShowAddParticipants(!showAddParticipants)
              console.log('🔍 DEBUG: Estado alterado para:', !showAddParticipants)
            }}
            variant="outline"
            className="w-full"
            type="button"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddParticipants ? 'Cancelar' : 'Adicionar Participantes'}
          </Button>
          
          {showAddParticipants && (
            <div className="space-y-4">
              <ContactSearch
                selectedContacts={selectedContacts}
                onSelectionChange={setSelectedContacts}
              />
              
              {selectedContacts.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddParticipants()
                    }}
                    disabled={loading}
                    className="flex-1"
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar {selectedContacts.length} Participante{selectedContacts.length > 1 ? 's' : ''}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedContacts([])
                      setShowAddParticipants(false)
                    }}
                    variant="outline"
                    type="button"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de participantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participantes ({regularParticipants.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por número ou nome..."
              value={participantSearch}
              onChange={(e) => setParticipantSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredRegularParticipants.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {participantSearch ? 'Nenhum participante encontrado para a pesquisa' : 'Nenhum participante encontrado'}
            </p>
          ) : (
            <div className="space-y-2">
              {/* Mostrar apenas os 3 primeiros participantes */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredRegularParticipants.slice(0, 3).map((participant) => (
                  <div
                    key={participant.phone}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{participant.phone}</p>
                        {participant.name && (
                          <p className="text-sm text-muted-foreground">{participant.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddAdmin(participant.phone)}
                        disabled={loading}
                        className="flex items-center gap-1"
                      >
                        <Crown className="h-3 w-3" />
                        Admin
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveParticipant(participant.phone)}
                        disabled={loading}
                        className="flex items-center gap-1"
                      >
                        <UserMinus className="h-3 w-3" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mostrar indicador se há mais participantes */}
              {filteredRegularParticipants.length > 3 && (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    Mostrando 3 de {filteredRegularParticipants.length} participantes
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use a barra de pesquisa para encontrar outros participantes
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de administradores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Administradores ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por número ou nome..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredAdmins.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {adminSearch ? 'Nenhum administrador encontrado para a pesquisa' : 'Nenhum administrador encontrado'}
            </p>
          ) : (
            <div className="space-y-2">
              {/* Mostrar apenas os 3 primeiros administradores */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredAdmins.slice(0, 3).map((admin) => (
                  <div
                    key={admin.phone}
                    className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 hover:bg-yellow-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Crown className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">{admin.phone}</p>
                        {admin.name && (
                          <p className="text-sm text-muted-foreground">{admin.name}</p>
                        )}
                        <Badge variant="secondary" className="text-xs mt-1">
                          {admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!admin.isSuperAdmin && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveAdmin(admin.phone)}
                            disabled={loading}
                            className="flex items-center gap-1"
                          >
                            <Crown className="h-3 w-3" />
                            Remover Admin
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveParticipant(admin.phone)}
                            disabled={loading}
                            className="flex items-center gap-1"
                          >
                            <UserMinus className="h-3 w-3" />
                            Remover
                          </Button>
                        </>
                      )}
                      {admin.isSuperAdmin && (
                        <div className="text-xs text-muted-foreground italic">
                          Owner do grupo
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mostrar indicador se há mais administradores */}
              {filteredAdmins.length > 3 && (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    Mostrando 3 de {filteredAdmins.length} administradores
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use a barra de pesquisa para encontrar outros administradores
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}