'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  CalendarIcon,
  Clock,
  Users,
  MessageSquare,
  Send,
  Save,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useContacts } from '@/hooks/use-contacts'
import { Checkbox } from '@/components/ui/checkbox'

interface CampaignBuilderProps {
  onSave?: (campaign: CampaignData) => void
  onSend?: (campaign: CampaignData) => void
  initialData?: Partial<CampaignData>
}

interface CampaignData {
  name: string
  message: string
  recipients: string[]
  scheduledAt?: Date
  isScheduled: boolean
}

export function CampaignBuilder({
  onSave,
  onSend,
  initialData,
}: CampaignBuilderProps) {
  const { contacts } = useContacts()
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: initialData?.name || '',
    message: initialData?.message || '',
    recipients: initialData?.recipients || [],
    scheduledAt: initialData?.scheduledAt,
    isScheduled: initialData?.isScheduled || false,
  })

  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    initialData?.recipients || []
  )
  const [selectAll, setSelectAll] = useState(false)

  const handleContactToggle = (contactId: string) => {
    const newSelected = selectedContacts.includes(contactId)
      ? selectedContacts.filter((id) => id !== contactId)
      : [...selectedContacts, contactId]

    setSelectedContacts(newSelected)
    setCampaignData((prev) => ({ ...prev, recipients: newSelected }))
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts([])
      setCampaignData((prev) => ({ ...prev, recipients: [] }))
    } else {
      const allContactIds = contacts?.map((contact) => contact.id) || []
      setSelectedContacts(allContactIds)
      setCampaignData((prev) => ({ ...prev, recipients: allContactIds }))
    }
    setSelectAll(!selectAll)
  }

  const handleScheduleToggle = (checked: boolean) => {
    setCampaignData((prev) => ({
      ...prev,
      isScheduled: checked,
      scheduledAt: checked ? prev.scheduledAt || new Date() : undefined,
    }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setCampaignData((prev) => ({ ...prev, scheduledAt: date }))
  }

  const handleSave = () => {
    if (onSave) {
      onSave(campaignData)
    }
  }

  const handleSend = () => {
    if (onSend) {
      onSend(campaignData)
    }
  }

  const isValid =
    campaignData.name.trim() &&
    campaignData.message.trim() &&
    campaignData.recipients.length > 0 &&
    (!campaignData.isScheduled || campaignData.scheduledAt)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Detalhes da Campanha
              </CardTitle>
              <CardDescription>
                Configure o nome e a mensagem da sua campanha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Nome da Campanha</Label>
                <Input
                  id="campaign-name"
                  placeholder="Ex: Promoção Black Friday 2024"
                  value={campaignData.name}
                  onChange={(e) =>
                    setCampaignData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-message">Mensagem</Label>
                <Textarea
                  id="campaign-message"
                  placeholder="Digite sua mensagem aqui..."
                  className="min-h-32"
                  value={campaignData.message}
                  onChange={(e) =>
                    setCampaignData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                />
                <div className="text-sm text-muted-foreground">
                  {campaignData.message.length} caracteres
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Agendamento
              </CardTitle>
              <CardDescription>
                Defina quando a campanha deve ser enviada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="schedule-toggle"
                  checked={campaignData.isScheduled}
                  onCheckedChange={handleScheduleToggle}
                />
                <Label htmlFor="schedule-toggle">Agendar envio</Label>
              </div>

              {campaignData.isScheduled && (
                <div className="space-y-2">
                  <Label>Data e Hora do Envio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !campaignData.scheduledAt && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {campaignData.scheduledAt
                          ? format(campaignData.scheduledAt, 'PPp', {
                              locale: ptBR,
                            })
                          : 'Selecione a data e hora'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={campaignData.scheduledAt}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recipients */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Destinatários
                <span className="text-sm font-normal text-muted-foreground">
                  ({selectedContacts.length} selecionados)
                </span>
              </CardTitle>
              <CardDescription>
                Selecione os contatos que receberão a campanha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all">Selecionar todos</Label>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {contacts?.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={contact.id}
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleContactToggle(contact.id)}
                    />
                    <Label htmlFor={contact.id} className="flex-1 text-sm">
                      <div>{contact.name}</div>
                      <div className="text-muted-foreground">
                        {contact.phone}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>

              {(!contacts || contacts.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  Nenhum contato encontrado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Destinatários:</span>
                <span>{selectedContacts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tipo:</span>
                <span>
                  {campaignData.isScheduled ? 'Agendada' : 'Imediata'}
                </span>
              </div>
              {campaignData.isScheduled && campaignData.scheduledAt && (
                <div className="flex justify-between text-sm">
                  <span>Envio em:</span>
                  <span>
                    {format(campaignData.scheduledAt, 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={handleSave} disabled={!isValid}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Rascunho
        </Button>
        <Button onClick={handleSend} disabled={!isValid}>
          <Send className="w-4 h-4 mr-2" />
          {campaignData.isScheduled ? 'Agendar Campanha' : 'Enviar Agora'}
        </Button>
      </div>
    </div>
  )
}
