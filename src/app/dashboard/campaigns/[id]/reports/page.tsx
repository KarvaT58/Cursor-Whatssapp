'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
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

interface CampaignSend {
  id: string;
  group_id: string;
  message_id?: string;
  media_id?: string;
  send_status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  send_time: string;
  scheduled_time: string;
  error_message?: string;
  zapi_message_id?: string;
  whatsapp_groups?: {
    name: string;
    whatsapp_id: string;
  };
  campaign_messages?: {
    message_text: string;
    message_order: number;
  };
  campaign_media?: {
    media_name: string;
    media_type: string;
  };
}

export default function CampaignReportsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sends, setSends] = useState<CampaignSend[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'delivered' | 'read' | 'failed'>('all');

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
      fetchSends();
    }
  }, [campaignId]);

  const fetchCampaignData = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
      }
    } catch (error) {
      console.error('Erro ao buscar campanha:', error);
    }
  };

  const fetchSends = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/sends`);
      if (response.ok) {
        const data = await response.json();
        setSends(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro na resposta da API de envios:', response.status);
        setSends([]);
      }
    } catch (error) {
      console.error('Erro ao buscar envios:', error);
      setSends([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-gray-100 text-gray-700 border border-gray-300';
      case 'delivered': return 'bg-black text-white';
      case 'read': return 'bg-gray-200 text-gray-900';
      case 'failed': return 'bg-gray-100 text-gray-600 border border-gray-200';
      case 'pending': return 'bg-gray-50 text-gray-700 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'read': return 'Lido';
      case 'failed': return 'Falhou';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <MessageSquare className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'read': return <Eye className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredSends = sends.filter(send => {
    if (filter === 'all') return true;
    return send.send_status === filter;
  });

  const stats = {
    total: sends.length,
    sent: sends.filter(s => s.send_status === 'sent').length,
    delivered: sends.filter(s => s.send_status === 'delivered').length,
    read: sends.filter(s => s.send_status === 'read').length,
    failed: sends.filter(s => s.send_status === 'failed').length,
    pending: sends.filter(s => s.send_status === 'pending').length
  };

  const deliveryRate = stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : '0';
  const readRate = stats.total > 0 ? ((stats.read / stats.total) * 100).toFixed(1) : '0';
  const failureRate = stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Campanha não encontrada</h2>
        <Button 
          onClick={() => router.push('/dashboard/campaigns')}
          className="bg-black hover:bg-gray-800 text-white"
        >
          Voltar para Campanhas
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios da Campanha</h1>
            <p className="text-gray-600 mt-1">
              {campaign.name}
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => {
            // Implementar exportação de relatórios
            alert('Funcionalidade de exportação em desenvolvimento');
          }}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <Badge className={
          campaign.status === 'active' ? 'bg-black text-white' :
          campaign.status === 'paused' ? 'bg-gray-100 text-gray-900 border border-gray-300' :
          campaign.status === 'completed' ? 'bg-gray-200 text-gray-900' :
          campaign.status === 'cancelled' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
          'bg-gray-50 text-gray-700 border border-gray-200'
        }>
          {campaign.status === 'active' ? 'Ativa' :
           campaign.status === 'paused' ? 'Pausada' :
           campaign.status === 'completed' ? 'Concluída' :
           campaign.status === 'cancelled' ? 'Cancelada' :
           'Rascunho'}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enviados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-black rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                <p className="text-xs text-gray-500">{deliveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Eye className="h-6 w-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.read}</p>
                <p className="text-xs text-gray-500">{readRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Falharam</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                <p className="text-xs text-gray-500">{failureRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Taxa de Entrega</CardTitle>
            <CardDescription className="text-gray-600">
              Percentual de mensagens entregues com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{deliveryRate}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-black h-2 rounded-full" 
                style={{ width: `${deliveryRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Taxa de Leitura</CardTitle>
            <CardDescription className="text-gray-600">
              Percentual de mensagens lidas pelos destinatários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">{readRate}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gray-600 h-2 rounded-full" 
                style={{ width: `${readRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Taxa de Falha</CardTitle>
            <CardDescription className="text-gray-600">
              Percentual de mensagens que falharam no envio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{failureRate}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gray-400 h-2 rounded-full" 
                style={{ width: `${failureRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Filtros</CardTitle>
          <CardDescription className="text-gray-600">
            Filtre os envios por status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todos', count: stats.total },
              { key: 'sent', label: 'Enviados', count: stats.sent },
              { key: 'delivered', label: 'Entregues', count: stats.delivered },
              { key: 'read', label: 'Lidos', count: stats.read },
              { key: 'failed', label: 'Falharam', count: stats.failed }
            ].map((filterOption) => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterOption.key as any)}
                className={`flex items-center space-x-2 ${
                  filter === filterOption.key 
                    ? 'bg-black hover:bg-gray-800 text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{filterOption.label}</span>
                <Badge 
                  variant="secondary" 
                  className={`ml-1 ${
                    filter === filterOption.key 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {filterOption.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sends List */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Histórico de Envios</CardTitle>
          <CardDescription className="text-gray-600">
            Lista detalhada de todos os envios da campanha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSends.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum envio encontrado
              </h3>
              <p className="text-gray-600">
                Não há envios para o filtro selecionado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSends.map((send) => (
                <div key={send.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-600">{getStatusIcon(send.send_status)}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {send.whatsapp_groups?.name || 'Grupo Desconhecido'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {send.whatsapp_groups?.whatsapp_id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(send.send_status)}>
                        {getStatusText(send.send_status)}
                      </Badge>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(send.send_time).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(send.send_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {send.campaign_messages && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Mensagem:</strong> {send.campaign_messages.message_text.substring(0, 100)}
                        {send.campaign_messages.message_text.length > 100 && '...'}
                      </p>
                    </div>
                  )}
                  
                  {send.campaign_media && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Mídia:</strong> {send.campaign_media.media_name} ({send.campaign_media.media_type})
                      </p>
                    </div>
                  )}
                  
                  {send.error_message && (
                    <div className="mt-3 p-3 bg-gray-100 rounded border border-gray-300">
                      <p className="text-sm text-gray-700">
                        <strong>Erro:</strong> {send.error_message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
