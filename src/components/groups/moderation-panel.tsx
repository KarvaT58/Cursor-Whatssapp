'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, MessageSquare, User, Clock, CheckCircle, XCircle, Filter, Search, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useGroupModeration } from '@/hooks/use-group-moderation'

interface ModerationPanelProps {
  groupId: string
  isAdmin: boolean
  className?: string
}

export function ModerationPanel({ groupId, isAdmin, className }: ModerationPanelProps) {
  const { getReports, updateReportStatus, isLoading, error, clearError } = useGroupModeration()
  const { toast } = useToast()

  // Estados locais
  const [reports, setReports] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as 'all' | 'pending' | 'approved' | 'rejected' | 'discarded',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  const [selectedReports, setSelectedReports] = useState<string[]>([])

  // Carregar relatórios ao montar o componente
  useEffect(() => {
    if (isAdmin) {
      loadReports()
    }
  }, [groupId, isAdmin, filters])

  // Carregar relatórios
  const loadReports = async () => {
    try {
      const result = await getReports(groupId, {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status === 'all' ? undefined : filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      
      setReports(result.reports || [])
      setPagination(result.pagination || pagination)
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err)
    }
  }

  // Aplicar filtros
  const applyFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Alternar seleção de relatório
  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    )
  }

  // Selecionar todos os relatórios
  const selectAllReports = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(reports.map(report => report.id))
    }
  }

  // Atualizar status do relatório
  const handleUpdateReportStatus = async (reportId: string, status: 'approved' | 'rejected' | 'discarded', notes?: string) => {
    try {
      await updateReportStatus(groupId, reportId, { status, notes })
      
      toast({
        title: 'Relatório atualizado!',
        description: `Status alterado para ${status === 'approved' ? 'aprovado' : status === 'rejected' ? 'rejeitado' : 'descartado'}`,
      })
      
      await loadReports()
    } catch (err) {
      console.error('Erro ao atualizar relatório:', err)
    }
  }

  // Ação em lote
  const handleBulkAction = async (action: 'approve' | 'reject' | 'discard') => {
    if (selectedReports.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um relatório',
        variant: 'destructive',
      })
      return
    }

    try {
      for (const reportId of selectedReports) {
        await updateReportStatus(groupId, reportId, { status: action })
      }
      
      toast({
        title: 'Ação em lote concluída!',
        description: `${selectedReports.length} relatório(s) ${action === 'approve' ? 'aprovado(s)' : action === 'reject' ? 'rejeitado(s)' : 'descartado(s)'}`,
      })
      
      setSelectedReports([])
      await loadReports()
    } catch (err) {
      console.error('Erro na ação em lote:', err)
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Formatar data relativa
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.ceil(diffTime / (1000 * 60))
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) return `${diffMinutes} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays} dias atrás`
    return date.toLocaleDateString('pt-BR')
  }

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'discarded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />
      case 'approved': return <CheckCircle className="h-3 w-3" />
      case 'rejected': return <XCircle className="h-3 w-3" />
      case 'discarded': return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'approved': return 'Aprovado'
      case 'rejected': return 'Rejeitado'
      case 'discarded': return 'Descartado'
      default: return 'Desconhecido'
    }
  }

  if (!isAdmin) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Apenas administradores podem acessar o painel de moderação
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Painel de Moderação
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gerencie denúncias e modere o conteúdo do grupo
        </p>
      </CardHeader>

      <CardContent>
        {/* Erro */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error}
              <Button variant="link" onClick={clearError} className="ml-2 p-0 h-auto">
                Limpar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">Denúncias</TabsTrigger>
            <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Filtros e busca */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar denúncias..."
                    value={filters.search}
                    onChange={(e) => applyFilters({ search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => applyFilters({ status: e.target.value as any })}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendentes</option>
                  <option value="approved">Aprovados</option>
                  <option value="rejected">Rejeitados</option>
                  <option value="discarded">Descartados</option>
                </select>
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => applyFilters({ sortBy: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="created_at">Data de Criação</option>
                  <option value="status">Status</option>
                  <option value="reason">Motivo</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>

            {/* Ações em lote */}
            {selectedReports.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedReports.length} relatório(s) selecionado(s)
                </span>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('reject')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('discard')}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Descartar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de relatórios */}
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma denúncia</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.status !== 'all'
                    ? 'Nenhuma denúncia encontrada com os filtros aplicados.'
                    : 'Não há denúncias pendentes no momento.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cabeçalho da lista */}
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === reports.length && reports.length > 0}
                    onChange={selectAllReports}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Selecionar Todos</span>
                </div>

                {/* Relatórios */}
                {reports.map((report) => (
                  <Card key={report.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report.id)}
                          onChange={() => toggleReportSelection(report.id)}
                          className="mt-1 rounded"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(report.status)}>
                              {getStatusIcon(report.status)}
                              <span className="ml-1">{getStatusText(report.status)}</span>
                            </Badge>
                            
                            <span className="text-sm text-muted-foreground">
                              {formatRelativeDate(report.created_at)}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Motivo:</span>
                              <p className="text-sm text-muted-foreground">{report.reason}</p>
                            </div>
                            
                            {report.description && (
                              <div>
                                <span className="text-sm font-medium">Descrição:</span>
                                <p className="text-sm text-muted-foreground">{report.description}</p>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Denunciado por: {report.reporter_name}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>Mensagem: {report.message_id}</span>
                              </div>
                            </div>
                            
                            {report.moderator_notes && (
                              <div>
                                <span className="text-sm font-medium">Notas do Moderador:</span>
                                <p className="text-sm text-muted-foreground">{report.moderator_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Ações do relatório */}
                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateReportStatus(report.id, 'approved')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateReportStatus(report.id, 'rejected')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateReportStatus(report.id, 'discarded')}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Descartar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Paginação */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1 || isLoading}
                >
                  Anterior
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.total_pages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.total_pages || isLoading}
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {reports.filter(r => r.status === 'pending').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Pendentes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {reports.filter(r => r.status === 'approved').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Aprovados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {reports.filter(r => r.status === 'rejected').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Rejeitados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold">{reports.length}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}