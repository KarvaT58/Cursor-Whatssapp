import { fromZonedTime, toZonedTime, format } from 'date-fns-tz';
import { parseISO } from 'date-fns';

// Timezone do Brasil
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Converte um horário do Brasil para UTC
 * @param brazilTime - Horário no formato HH:MM (ex: "14:30")
 * @param date - Data base (opcional, usa hoje se não informado)
 * @returns Date em UTC
 */
export function brazilTimeToUTC(brazilTime: string, date?: Date): Date {
  const baseDate = date || new Date();
  const [hours, minutes] = brazilTime.split(':').map(Number);
  
  // Criar data com horário do Brasil
  const brazilDate = new Date(baseDate);
  brazilDate.setHours(hours, minutes, 0, 0);
  
  // Converter para UTC
  return fromZonedTime(brazilDate, BRAZIL_TIMEZONE);
}

/**
 * Converte UTC para horário do Brasil
 * @param utcDate - Data em UTC
 * @returns Date no timezone do Brasil
 */
export function utcToBrazilTime(utcDate: Date): Date {
  return toZonedTime(utcDate, BRAZIL_TIMEZONE);
}

/**
 * Obtém o horário atual do Brasil
 * @returns Date com horário atual do Brasil
 */
export function getCurrentBrazilTime(): Date {
  return toZonedTime(new Date(), BRAZIL_TIMEZONE);
}

/**
 * Formata uma data para o timezone do Brasil
 * @param date - Data para formatar
 * @param formatString - String de formato (padrão: 'dd/MM/yyyy HH:mm:ss')
 * @returns String formatada
 */
export function formatBrazilTime(date: Date, formatString: string = 'dd/MM/yyyy HH:mm:ss'): string {
  return format(toZonedTime(date, BRAZIL_TIMEZONE), formatString, { timeZone: BRAZIL_TIMEZONE });
}

/**
 * Obtém apenas o horário atual do Brasil (HH:MM)
 * @returns String no formato HH:MM
 */
export function getCurrentBrazilTimeString(): string {
  const brazilTime = getCurrentBrazilTime();
  return format(brazilTime, 'HH:mm', { timeZone: BRAZIL_TIMEZONE });
}

/**
 * Obtém apenas a data atual do Brasil (YYYY-MM-DD)
 * @returns String no formato YYYY-MM-DD
 */
export function getCurrentBrazilDateString(): string {
  const brazilTime = getCurrentBrazilTime();
  return format(brazilTime, 'yyyy-MM-dd', { timeZone: BRAZIL_TIMEZONE });
}

/**
 * Verifica se é horário de executar campanha
 * @param scheduledTime - Horário agendado (HH:MM)
 * @param toleranceMinutes - Tolerância em minutos (padrão: 1)
 * @returns boolean
 */
export function isTimeToExecute(scheduledTime: string, toleranceMinutes: number = 1): boolean {
  const currentTime = getCurrentBrazilTime();
  const [scheduledHours, scheduledMinutes] = scheduledTime.split(':').map(Number);
  
  const scheduledDate = new Date(currentTime);
  scheduledDate.setHours(scheduledHours, scheduledMinutes, 0, 0);
  
  const diffMinutes = Math.abs(currentTime.getTime() - scheduledDate.getTime()) / (1000 * 60);
  
  return diffMinutes <= toleranceMinutes;
}

/**
 * Log com timestamp do Brasil
 * @param message - Mensagem para log
 * @param data - Dados adicionais (opcional)
 */
export function logBrazilTime(message: string, data?: any): void {
  const timestamp = formatBrazilTime(new Date(), 'dd/MM/yyyy HH:mm:ss');
  console.log(`[${timestamp} BR] ${message}`, data || '');
}
