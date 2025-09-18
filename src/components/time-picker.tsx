'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({ value, onChange, placeholder = "Selecione o horário", className }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parsear o valor atual (formato HH:MM)
  const [hours, minutes] = value ? value.split(':').map(Number) : [8, 0];
  
  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const timeString = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    onChange(timeString);
  };

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border-gray-300 hover:border-black focus:border-black",
            !value && "text-gray-500",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTime(hours, minutes) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Coluna de Horas */}
          <div className="flex flex-col max-h-[200px] overflow-y-auto border-r">
            {Array.from({ length: 24 }, (_, i) => (
              <Button
                key={i}
                variant={hours === i ? "default" : "ghost"}
                className={cn(
                  "w-12 h-8 p-0 text-sm font-normal rounded-none border-0",
                  hours === i 
                    ? "bg-black text-white hover:bg-gray-800" 
                    : "hover:bg-gray-100"
                )}
                onClick={() => handleTimeChange(i, minutes)}
              >
                {i.toString().padStart(2, '0')}
              </Button>
            ))}
          </div>
          
          {/* Coluna de Minutos */}
          <div className="flex flex-col max-h-[200px] overflow-y-auto">
            {Array.from({ length: 60 }, (_, i) => (
              <Button
                key={i}
                variant={minutes === i ? "default" : "ghost"}
                className={cn(
                  "w-12 h-8 p-0 text-sm font-normal rounded-none border-0",
                  minutes === i 
                    ? "bg-black text-white hover:bg-gray-800" 
                    : "hover:bg-gray-100"
                )}
                onClick={() => handleTimeChange(hours, i)}
              >
                {i.toString().padStart(2, '0')}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
