'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShadcnCalendar } from '@/components/shadcn-calendar';
import { TimePicker } from '@/components/time-picker';
import { MediaUpload } from '@/components/media-upload';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Save,
  ArrowLeft,
  Search
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface ZApiInstance {
  id: string;
  name: string;
  instance_id: string;
  is_active: boolean;
}

interface WhatsAppGroup {
  id: string;
  name: string;
  whatsapp_id: string;
  group_type: 'universal' | 'normal';
  universal_link?: string;
  group_family?: string;
  group_families?: {
    id: string;
    name: string;
    base_name: string;
  };
}

interface CampaignMessage {
  id: string;
  message_text: string;
  message_order: number;
  is_active: boolean;
}

interface CampaignMedia {
  id: string;
  media_type: 'image' | 'video' | 'audio' | 'document';
  media_url: string;
  media_name: string;
  media_size?: number;
  media_mime_type?: string;
  media_order: number;
  is_active: boolean;
}

interface CampaignSchedule {
  id: string;
  schedule_name: string;
  start_time: string;
  end_time: string;
  days_of_week: string;
  is_active: boolean;
}

interface CampaignVariant {
  id: string;
  variant_order: number;
  message: CampaignMessage;
  media: CampaignMedia[];
  is_active: boolean;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<ZApiInstance[]>([]);
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [globalInterval, setGlobalInterval] = useState<number>(0);
  const [tempBlockedDates, setTempBlockedDates] = useState<string[]>([]);
  const [groupFilter, setGroupFilter] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instance_id: '',
    send_order: 'text_first' as 'text_first' | 'media_first' | 'together',
    selected_groups: [] as string[],
    schedules: [] as CampaignSchedule[],
    variants: [] as CampaignVariant[]
  });

  useEffect(() => {
    fetchInstances();
    fetchGroups();
  }, []);

  const fetchInstances = async () => {
    try {
      const response = await fetch('/api/z-api-instances');
      if (response.ok) {
        const data = await response.json();
        setInstances(data.filter((instance: ZApiInstance) => instance.is_active));
      }
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        console.log('Grupos carregados:', data);
        console.log('Grupos universais:', data.filter((g: WhatsAppGroup) => g.group_type === 'universal'));
        console.log('Grupos normais:', data.filter((g: WhatsAppGroup) => g.group_type === 'normal'));
        setGroups(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro na resposta da API de grupos:', response.status);
        setGroups([]);
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      setGroups([]);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addVariant = () => {
    if (formData.variants.length >= 5) {
      alert('Máximo de 5 variantes permitidas');
      return;
    }
    
    const newVariant: CampaignVariant = {
      id: `variant_${Date.now()}`,
      variant_order: formData.variants.length + 1,
      message: {
      id: `msg_${Date.now()}`,
      message_text: '',
        message_order: formData.variants.length + 1,
        is_active: true
      },
      media: [],
      is_active: true
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const updateVariantMessage = (variantId: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, message: { ...variant.message, [field]: value } }
          : variant
      )
    }));
  };

  const updateVariantMedia = (variantId: string, mediaIndex: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { 
              ...variant, 
              media: variant.media.map((media, index) => 
                index === mediaIndex 
                  ? { ...media, [field]: value }
                  : media
              )
            }
          : variant
      )
    }));
  };

  const updateVariantMediaFile = (variantId: string, mediaIndex: number, url: string, fileName: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { 
              ...variant, 
              media: variant.media.map((media, index) => 
                index === mediaIndex 
                  ? { 
                      ...media, 
                      media_url: url, 
                      media_name: fileName,
                      media_order: variant.message.message_order // Garantir que media_order seja igual ao message_order
                    }
                  : media
              )
            }
          : variant
      )
    }));
  };

  const addMediaToVariant = (variantId: string) => {
    const variant = formData.variants.find(v => v.id === variantId);
    if (!variant) {
      console.error('Variante não encontrada:', variantId);
      return;
    }
    
    console.log('Adicionando mídia à variante:', variantId, 'Mídias atuais:', variant.media.length);
    
    const newMedia: CampaignMedia = {
      id: `media_${Date.now()}`,
      media_type: 'image',
      media_url: '',
      media_name: '',
      media_order: variant.message.message_order, // Usar o message_order da variante
      is_active: true
    };
    
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, media: [...variant.media, newMedia] }
          : variant
      )
    }));
  };

  const removeMediaFromVariant = (variantId: string, mediaIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, media: variant.media.filter((_, index) => index !== mediaIndex) }
          : variant
      )
    }));
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(variant => variant.id !== id)
    }));
  };

  const addSchedule = () => {
    const newSchedule: CampaignSchedule = {
      id: `schedule_${Date.now()}`,
      schedule_name: '',
      start_time: '08:00',
      end_time: '18:00',
      days_of_week: '1,2,3,4,5,6,7',
      is_active: true
    };
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, newSchedule]
    }));
  };

  const updateSchedule = (id: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map(schedule => 
        schedule.id === id ? { ...schedule, [field]: value } : schedule
      )
    }));
  };

  const removeSchedule = (id: string) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.filter(schedule => schedule.id !== id)
    }));
  };

  const toggleGroupSelection = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_groups: prev.selected_groups.includes(groupId)
        ? prev.selected_groups.filter(id => id !== groupId)
        : [...prev.selected_groups, groupId]
    }));
  };

  // Função para filtrar grupos
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(groupFilter.toLowerCase()) ||
    group.whatsapp_id.toLowerCase().includes(groupFilter.toLowerCase())
  );

  const filteredNormalGroups = filteredGroups.filter(group => group.group_type === 'normal');
  const filteredUniversalGroups = filteredGroups.filter(group => group.group_type === 'universal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Converter variantes em mensagens e mídias separadas para o backend
          messages: formData.variants.map(variant => variant.message),
          media: formData.variants.flatMap(variant => variant.media),
          global_interval: globalInterval
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const campaignId = result.campaign?.id;
        
        // Salvar datas bloqueadas se houver
        if (campaignId && tempBlockedDates.length > 0) {
          try {
            await fetch(`/api/campaigns/${campaignId}/blocked-dates`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                dates: tempBlockedDates
              }),
            });
            console.log('Datas bloqueadas salvas com sucesso!');
          } catch (error) {
            console.error('Erro ao salvar datas bloqueadas:', error);
          }
        }
        
        router.push('/dashboard/campaigns');
      } else {
        console.error('Erro ao criar campanha');
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Campanha</h1>
            <p className="text-gray-600 mt-1">
              Crie uma nova campanha de marketing para seus grupos WhatsApp
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Configure as informações principais da sua campanha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome da Campanha *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Promoção Black Friday"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="instance">Instância Z-API *</Label>
                <Select
                  value={formData.instance_id}
                  onValueChange={(value) => handleInputChange('instance_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma instância" />
                  </SelectTrigger>
                  <SelectContent>
                    {instances.map((instance) => (
                      <SelectItem key={instance.id} value={instance.id}>
                        {instance.name} ({instance.instance_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva o objetivo desta campanha..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="send_order">Ordem de Envio</Label>
              <Select
                value={formData.send_order}
                onValueChange={(value: 'text_first' | 'media_first' | 'together') => handleInputChange('send_order', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text_first">Texto primeiro, depois mídia</SelectItem>
                  <SelectItem value="media_first">Mídia primeiro, depois texto</SelectItem>
                  <SelectItem value="together">Texto e mídia juntos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>


        {/* Variantes de Campanha */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Variantes de Campanha</CardTitle>
                <CardDescription>
                  Crie diferentes versões da campanha com mensagem e mídia (máximo 5 variantes)
                </CardDescription>
              </div>
              <Button 
                type="button" 
                onClick={addVariant} 
                size="sm"
                disabled={formData.variants.length >= 5}
                title={formData.variants.length >= 5 ? 'Máximo de 5 variantes permitidas' : 'Adicionar nova variante'}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Variante ({formData.variants.length}/5)
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.variants.map((variant) => (
              <div key={variant.id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 text-lg">Variante {variant.variant_order}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeVariant(variant.id)}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Mensagem da Variante */}
                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Mensagem da Variante</Label>
                <Textarea
                    value={variant.message.message_text}
                    onChange={(e) => updateVariantMessage(variant.id, 'message_text', e.target.value)}
                    placeholder="Digite a mensagem desta variante..."
                  rows={3}
                    className="border-gray-300 focus:border-black focus:ring-black"
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={variant.message.is_active}
                      onCheckedChange={(checked) => updateVariantMessage(variant.id, 'is_active', checked)}
                    />
                    <Label className="text-gray-700">Mensagem Ativa</Label>
                  </div>
                </div>

                {/* Mídias da Variante */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-900 font-medium">
                      Mídias da Variante ({variant.media.length})
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addMediaToVariant(variant.id)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Mídia
                    </Button>
                  </div>

                  {variant.media.length > 0 && (
                    <div className="space-y-3">
                      {variant.media.map((media, mediaIndex) => (
                        <div key={media.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <Label className="text-gray-700 font-medium">
                              Mídia {mediaIndex + 1} - {media.media_type}
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeMediaFromVariant(variant.id, mediaIndex)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div>
                            <Label className="text-gray-700">Tipo de Mídia</Label>
                            <Select
                              value={media.media_type}
                              onValueChange={(value: 'image' | 'video' | 'audio' | 'document') => updateVariantMedia(variant.id, mediaIndex, 'media_type', value)}
                            >
                              <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="image">Imagem</SelectItem>
                                <SelectItem value="video">Vídeo</SelectItem>
                                <SelectItem value="audio">Áudio</SelectItem>
                                <SelectItem value="document">Documento</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <MediaUpload
                            value={media.media_url}
                            onChange={(url, fileName) => updateVariantMediaFile(variant.id, mediaIndex, url, fileName)}
                            mediaType={media.media_type}
                          />
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={media.is_active}
                              onCheckedChange={(checked) => updateVariantMedia(variant.id, mediaIndex, 'is_active', checked)}
                            />
                            <Label className="text-gray-700">Mídia Ativa</Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Geral da Variante */}
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                  <Switch
                    checked={variant.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      variants: prev.variants.map(v => 
                        v.id === variant.id ? { ...v, is_active: checked } : v
                      )
                    }))}
                  />
                  <Label className="text-gray-900 font-medium">Variante Ativa</Label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>


        {/* Agendamentos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Agendamentos</CardTitle>
                <CardDescription>
                  Configure o horário para execução automática diária da campanha
                </CardDescription>
              </div>
              <Button type="button" onClick={addSchedule} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Horário
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.schedules.map((schedule, index) => (
              <div key={schedule.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Agendamento {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSchedule(schedule.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendário à esquerda */}
                  <div className="space-y-3">
                    <Label className="text-gray-900 font-medium">Calendário de Bloqueios</Label>
                    <ShadcnCalendar 
                      isTemp={true}
                      tempBlockedDates={tempBlockedDates}
                      onTempBlockDates={setTempBlockedDates}
                    />
                  </div>
                  
                  {/* Relógio à direita */}
                  <div className="space-y-3">
                    <Label className="text-gray-900 font-medium">Horário de Execução</Label>
                    <TimePicker
                      value={schedule.start_time}
                      onChange={(time) => updateSchedule(schedule.id, 'start_time', time)}
                      placeholder="Selecione o horário"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={schedule.is_active}
                    onCheckedChange={(checked) => updateSchedule(schedule.id, 'is_active', checked)}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>


        {/* Seleção de Grupos */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos de Destino</CardTitle>
            <CardDescription>
              Selecione quais grupos receberão esta campanha
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Campo de Busca */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Buscar grupos por nome ou ID..."
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-black focus:ring-black"
                />
              </div>
              {groupFilter && (
                <p className="text-sm text-gray-600 mt-2">
                  {filteredGroups.length} grupo(s) encontrado(s) de {groups.length} total
                </p>
              )}
            </div>

            <ScrollArea className="h-[500px] w-full">
              <div className="space-y-6 pr-4">
              {/* Grupos Normais */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                    Grupos Normais ({filteredNormalGroups.length})
                </h3>
                  {filteredNormalGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredNormalGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        formData.selected_groups.includes(group.id)
                          ? 'border-black bg-gray-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleGroupSelection(group.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{group.name}</h4>
                          <p className="text-xs text-gray-600">{group.whatsapp_id}</p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                          Normal
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum grupo normal encontrado</p>
                    </div>
                  )}
              </div>

              {/* Grupos Universais */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                    Grupos Universais ({filteredUniversalGroups.length})
                </h3>
                  {filteredUniversalGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredUniversalGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        formData.selected_groups.includes(group.id)
                          ? 'border-black bg-gray-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleGroupSelection(group.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{group.name}</h4>
                          <p className="text-xs text-gray-600">{group.whatsapp_id}</p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                          Universal
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum grupo universal encontrado</p>
              </div>
                  )}
            </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Configuração de Intervalos por Grupo */}
        {formData.selected_groups.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Intervalos de Envio por Grupo</CardTitle>
              <CardDescription>
                Configure o intervalo de tempo entre o envio para cada grupo (em minutos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Contador de grupos selecionados */}
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-white">
                        {formData.selected_groups.length}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm text-gray-700">
                      {formData.selected_groups.length === 1 ? 'Grupo selecionado' : 'Grupos selecionados'}
                    </h4>
                  </div>
                </div>

                {/* Slider único para todos os grupos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Intervalo entre envios: {globalInterval === 0 ? '0 seg' : globalInterval < 60 ? `${globalInterval} seg` : `${Math.floor(globalInterval / 60)} min ${globalInterval % 60} seg`}
                    </Label>
                    <span className="text-xs text-gray-500">0 seg - 5 min</span>
                  </div>
                  <div className="px-2">
                    <Slider
                      value={[globalInterval]}
                      onValueChange={(value) => setGlobalInterval(value[0])}
                      max={300}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <strong>Como funciona:</strong> O primeiro grupo recebe a mensagem imediatamente. 
                  O segundo grupo recebe após o intervalo configurado, e assim por diante.
                  <br />
                  <strong>Exemplo:</strong> Se configurar 30 segundos, cada grupo receberá a mensagem 30 segundos após o anterior.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Intervalos de Envio por Grupo</CardTitle>
              <CardDescription>
                Selecione grupos acima para configurar os intervalos de envio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Selecione pelo menos um grupo para configurar os intervalos de envio</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Campanha'}
          </Button>
        </div>
      </form>
    </div>
  );
}
