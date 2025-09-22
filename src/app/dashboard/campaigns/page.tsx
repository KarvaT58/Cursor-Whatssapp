'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Pause, Edit, Trash2, Clock, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  send_order: 'text_first' | 'media_first' | 'together';
  instance_id: string;
  created_at: string;
  updated_at: string;
  stats?: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    total: number;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      console.log('🔍 [FRONTEND-CAMPAIGNS] Iniciando busca de campanhas...');
      const response = await fetch('/api/campaigns');
      
      console.log('🔍 [FRONTEND-CAMPAIGNS] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [FRONTEND-CAMPAIGNS] Dados recebidos:', data);
        setCampaigns(Array.isArray(data) ? data : []);
      } else {
        console.error('🔍 [FRONTEND-CAMPAIGNS] Erro na resposta da API de campanhas:', response.status);
        
        // Se for 401, redirecionar para login
        if (response.status === 401) {
          console.log('🔍 [FRONTEND-CAMPAIGNS] Usuário não autenticado, redirecionando para login...');
          router.push('/login');
          return;
        }
        
        setCampaigns([]);
      }
    } catch (error) {
      console.error('🔍 [FRONTEND-CAMPAIGNS] Erro ao buscar campanhas:', error);
      setCampaigns([]);
    } finally {
      console.log('🔍 [FRONTEND-CAMPAIGNS] Finalizando carregamento...');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-black text-white';
      case 'paused': return 'bg-gray-100 text-gray-900 border border-gray-300';
      case 'completed': return 'bg-gray-200 text-gray-900';
      case 'cancelled': return 'bg-gray-100 text-gray-600 border border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return 'Rascunho';
    }
  };

  const getSendOrderText = (order: string) => {
    switch (order) {
      case 'text_first': return 'Texto primeiro';
      case 'media_first': return 'Mídia primeiro';
      case 'together': return 'Juntos';
      default: return 'Texto primeiro';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campanhas WhatsApp</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas campanhas de marketing e comunicação
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/campaigns/new')}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-black rounded-lg">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Pause className="h-6 w-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pausadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'paused').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="h-6 w-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">{campaign.name}</CardTitle>
                  {campaign.description && (
                    <CardDescription className="mt-1 text-gray-600">
                      {campaign.description}
                    </CardDescription>
                  )}
                </div>
                <Badge className={`${getStatusColor(campaign.status)} text-xs font-medium px-2 py-1`}>
                  {getStatusText(campaign.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Send Order */}
                <div className="flex items-center text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                  {getSendOrderText(campaign.send_order)}
                </div>
                
                {/* Stats */}
                {campaign.stats && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-gray-700 font-medium">
                        {campaign.stats.sent || 0} enviadas
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-gray-700 font-medium">
                        {campaign.stats.delivered || 0} entregues
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => router.push(`/dashboard/campaigns/${campaign.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => router.push(`/dashboard/campaigns/${campaign.id}/reports`)}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Relatórios
                  </Button>
                  
                  {campaign.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-400 text-gray-700 hover:bg-gray-100"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/campaigns/${campaign.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'paused' })
                          });
                          if (response.ok) {
                            fetchCampaigns(); // Recarregar lista
                          }
                        } catch (error) {
                          console.error('Erro ao pausar campanha:', error);
                        }
                      }}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pausar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-black text-black hover:bg-gray-100"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/campaigns/${campaign.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'active' })
                          });
                          if (response.ok) {
                            fetchCampaigns(); // Recarregar lista
                          }
                        } catch (error) {
                          console.error('Erro ao ativar campanha:', error);
                        }
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Ativar
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    onClick={async () => {
                      if (confirm('Tem certeza que deseja excluir esta campanha?')) {
                        try {
                          const response = await fetch(`/api/campaigns/${campaign.id}`, {
                            method: 'DELETE'
                          });
                          if (response.ok) {
                            fetchCampaigns(); // Recarregar lista
                          }
                        } catch (error) {
                          console.error('Erro ao excluir campanha:', error);
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {campaigns.length === 0 && (
        <Card className="text-center py-16 border border-gray-200">
          <CardContent>
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Nenhuma campanha encontrada
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Crie sua primeira campanha para começar a enviar mensagens em massa para seus grupos
            </p>
            <Button 
              onClick={() => router.push('/dashboard/campaigns/new')}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}