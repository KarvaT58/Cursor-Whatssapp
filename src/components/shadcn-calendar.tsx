'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BlockedDate {
  date: string;
  type: 'specific' | 'day_of_week';
  value?: number; // dia da semana (0-6)
  reason?: string;
}

interface ShadcnCalendarProps {
  campaignId?: string;
  campaignName?: string;
  blockedDates?: BlockedDate[];
  onBlockDates?: (blockedDates: BlockedDate[], reason?: string) => void;
  onUnblockDate?: (blockedDate: BlockedDate) => void;
  isTemp?: boolean;
  tempBlockedDates?: BlockedDate[];
  onTempBlockDates?: (blockedDates: BlockedDate[]) => void;
}

export function ShadcnCalendar({
  campaignName,
  blockedDates = [],
  onBlockDates,
  onUnblockDate,
  isTemp = false,
  tempBlockedDates = [],
  onTempBlockDates
}: ShadcnCalendarProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [blockReason, setBlockReason] = useState('');
  const [blockingType, setBlockingType] = useState<'specific' | 'day_of_week'>('specific');

  // Converter BlockedDate objects para Date objects para o calendário
  // Adicionar timezone para evitar problemas de conversão
  const blockedDatesAsDates = blockedDates.map(blockedDate => {
    const date = new Date(blockedDate.date + 'T00:00:00');
    return date;
  });
  const tempBlockedDatesAsDates = tempBlockedDates.map(blockedDate => {
    const date = new Date(blockedDate.date + 'T00:00:00');
    return date;
  });

  const handleDateSelect = (dates: Date | Date[] | undefined) => {
    if (dates) {
      const dateArray = Array.isArray(dates) ? dates : [dates];
      console.log('📅 Datas selecionadas:', dateArray.map(d => format(d, 'dd/MM/yyyy')));
      setSelectedDates(dateArray);
    }
  };

  const handleBlockDates = () => {
    if (selectedDates.length === 0) return;

    console.log('🔒 Iniciando bloqueio de datas...');
    console.log('📅 Datas selecionadas:', selectedDates.map(d => format(d, 'dd/MM/yyyy')));
    console.log('🎯 Tipo de bloqueio:', blockingType);

    const allBlockedDates: BlockedDate[] = [];
    
    selectedDates.forEach(selectedDate => {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      console.log('📝 Processando data:', dateString, 'Tipo:', blockingType);
      
      if (blockingType === 'specific') {
        // Bloquear apenas a data específica
        const blockedDate = {
          date: dateString,
          type: 'specific' as const,
          reason: blockReason
        };
        console.log('✅ Bloqueando data específica:', blockedDate);
        allBlockedDates.push(blockedDate);
      } else if (blockingType === 'day_of_week') {
        // Bloquear TODAS as ocorrências desse dia da semana (próximos 5 anos)
        const dayOfWeek = selectedDate.getDay();
        const currentYear = selectedDate.getFullYear();
        
        for (let year = currentYear; year < currentYear + 5; year++) {
          for (let month = 0; month < 12; month++) {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day);
              if (date.getDay() === dayOfWeek) {
                allBlockedDates.push({
                  date: format(date, 'yyyy-MM-dd'),
                  type: 'day_of_week',
                  value: dayOfWeek,
                  reason: blockReason
                });
              }
            }
          }
        }
      }
    });

    console.log('📋 Total de datas a serem bloqueadas:', allBlockedDates.length);
    console.log('📋 Datas finais:', allBlockedDates.map(d => d.date));

    if (isTemp && onTempBlockDates) {
      onTempBlockDates(allBlockedDates);
    } else if (onBlockDates) {
      onBlockDates(allBlockedDates, blockReason || undefined);
    }

    setSelectedDates([]);
    setBlockReason('');
    setBlockingType('specific');
  };

  const handleUnblockDate = (blockedDate: BlockedDate) => {
    if (onUnblockDate) {
      onUnblockDate(blockedDate);
    }
  };


  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendário de Bloqueios
        </CardTitle>
        <CardDescription className="text-gray-600">
          {isTemp 
            ? 'Selecione as datas que não devem executar a campanha (será bloqueado em todos os meses)'
            : `Bloqueie datas para a campanha "${campaignName || 'Campanha'}" (será bloqueado em todos os meses)`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendário */}
        <div className="flex justify-center">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // Desabilitar datas passadas
              return date < new Date(new Date().setHours(0, 0, 0, 0));
            }}
            modifiers={{
              blocked: blockedDatesAsDates,
              tempBlocked: tempBlockedDatesAsDates,
            }}
            modifiersStyles={{
              blocked: {
                backgroundColor: '#000000',
                color: 'white',
                fontWeight: 'bold',
              },
              tempBlocked: {
                backgroundColor: '#000000',
                color: 'white',
                fontWeight: 'bold',
              },
            }}
            className="rounded-md border border-gray-200"
            locale={ptBR}
          />
        </div>

        {/* Controles */}
        <div className="space-y-3">
          {/* Seleção do tipo de bloqueio */}
          <div>
            <Label className="text-gray-700">Tipo de Bloqueio:</Label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="specific"
                  checked={blockingType === 'specific'}
                  onChange={(e) => setBlockingType(e.target.value as 'specific' | 'day_of_week')}
                  className="text-black focus:ring-black"
                />
                <span className="text-sm text-gray-700">Apenas esta data</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="day_of_week"
                  checked={blockingType === 'day_of_week'}
                  onChange={(e) => setBlockingType(e.target.value as 'specific' | 'day_of_week')}
                  className="text-black focus:ring-black"
                />
                <span className="text-sm text-gray-700">Todas as {blockingType === 'day_of_week' && selectedDates.length > 0 ? 
                  ['domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados'][selectedDates[0].getDay()] : 
                  'ocorrências deste dia da semana'
                } (todos os anos)</span>
              </label>
            </div>
          </div>

          {!isTemp && (
            <div>
              <Label htmlFor="block-reason" className="text-gray-700">
                Motivo (opcional)
              </Label>
              <Input
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: Feriado, final de semana..."
                className="mt-1"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleBlockDates}
              disabled={selectedDates.length === 0}
              className="bg-black hover:bg-gray-800 text-white flex-1"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {isTemp ? 'Bloquear Datas' : `Bloquear ${selectedDates.length} Data(s)`}
            </Button>
          </div>

          {/* Lista de datas bloqueadas */}
          {(blockedDates.length > 0 || tempBlockedDates.length > 0) && (
            <div className="mt-4">
              <Label className="text-gray-700 text-sm font-medium">
                Bloqueios Configurados:
              </Label>
              <div className="mt-2 space-y-1">
                {/* Agrupar por tipo de bloqueio */}
                {(() => {
                  const allBlockedDates = [...blockedDates, ...tempBlockedDates];
                  const grouped = allBlockedDates.reduce((acc, blockedDate) => {
                    if (!acc[blockedDate.type]) acc[blockedDate.type] = [];
                    if (blockedDate.type === 'specific') {
                      if (!acc[blockedDate.type].includes(blockedDate.date)) {
                        acc[blockedDate.type].push(blockedDate.date);
                      }
                    } else if (blockedDate.type === 'day_of_week' && blockedDate.value !== undefined) {
                      if (!acc[blockedDate.type].includes(blockedDate.value)) {
                        acc[blockedDate.type].push(blockedDate.value);
                      }
                    }
                    return acc;
                  }, {} as Record<string, (string | number)[]>);

                  return Object.entries(grouped).map(([type, values]) => (
                    <div key={type} className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {type === 'specific' && 'Datas Específicas'}
                        {type === 'day_of_week' && 'Dias da Semana (todas as ocorrências)'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {values.map((value) => (
                          <span
                            key={value}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-white border border-gray-300 text-gray-700"
                          >
                            {type === 'specific' && format(new Date(value as string), 'dd/MM/yyyy')}
                            {type === 'day_of_week' && {
                              0: 'Domingos', 1: 'Segundas', 2: 'Terças', 3: 'Quartas', 
                              4: 'Quintas', 5: 'Sextas', 6: 'Sábados'
                            }[value as number]}
                            {!isTemp && (
                              <button
                                onClick={() => handleUnblockDate({
                                  date: type === 'specific' ? value as string : '',
                                  type: type as 'specific' | 'day_of_week',
                                  value: type === 'day_of_week' ? value as number : undefined
                                })}
                                className="ml-1 text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para seleção de horário
interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label = "Horário" }: TimePickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="time-picker" className="text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          id="time-picker"
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 border-gray-300 focus:border-black focus:ring-black"
        />
      </div>
    </div>
  );
}
