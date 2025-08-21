import { Frequency, Task } from '@/types';
import { getWeek, startOfQuarter, startOfYear, startOfWeek, endOfWeek, format, startOfMonth, endOfMonth, endOfQuarter, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

// Funciones para manejo de períodos actuales
export function getCurrentWeek(): { start: Date; end: Date; weekNumber: number; year: number } {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Lunes como primer día
  const end = endOfWeek(now, { weekStartsOn: 1 }); // Domingo como último día
  const weekNumber = getWeek(now, { weekStartsOn: 1 });
  const year = now.getFullYear();
  
  return { start, end, weekNumber, year };
}

export function getCurrentMonth(): { start: Date; end: Date; monthNumber: number; year: number } {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const monthNumber = now.getMonth() + 1;
  const year = now.getFullYear();
  
  return { start, end, monthNumber, year };
}

export function getCurrentQuarter(): { start: Date; end: Date; quarterNumber: number; year: number } {
  const now = new Date();
  const start = startOfQuarter(now);
  const end = endOfQuarter(now);
  const quarterNumber = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();
  
  return { start, end, quarterNumber, year };
}

export function getCurrentBiannual(): { start: Date; end: Date; halfNumber: number; year: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const halfNumber = month < 6 ? 1 : 2;
  
  const start = new Date(year, halfNumber === 1 ? 0 : 6, 1);
  const end = new Date(year, halfNumber === 1 ? 5 : 11, halfNumber === 1 ? 30 : 31);
  
  return { start, end, halfNumber, year };
}

export function getCurrentYear(): { start: Date; end: Date; year: number } {
  const now = new Date();
  const year = now.getFullYear();
  const start = startOfYear(now);
  const end = endOfYear(now);
  
  return { start, end, year };
}

// Funciones para generar claves de período
export function getCurrentWeekKey(): string {
  const { year, weekNumber } = getCurrentWeek();
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

export function getCurrentMonthKey(): string {
  const { year, monthNumber } = getCurrentMonth();
  return `${year}-${monthNumber.toString().padStart(2, '0')}`;
}

export function getCurrentQuarterKey(): string {
  const { year, quarterNumber } = getCurrentQuarter();
  return `${year}-Q${quarterNumber}`;
}

export function getCurrentBiannualKey(): string {
  const { year, halfNumber } = getCurrentBiannual();
  return `${year}-H${halfNumber}`;
}

export function getCurrentYearKey(): string {
  const { year } = getCurrentYear();
  return `${year}`;
}

// Función universal para obtener clave de período según frecuencia
export function getCurrentPeriodKey(frequency: Frequency): string {
  switch (frequency) {
    case 'WEEKLY': return getCurrentWeekKey();
    case 'MONTHLY': return getCurrentMonthKey();
    case 'QUARTERLY': return getCurrentQuarterKey();
    case 'BIANNUAL': return getCurrentBiannualKey();
    case 'ANNUAL': return getCurrentYearKey();
    default: return getCurrentWeekKey();
  }
}

// Funciones para formatear períodos
export function formatWeekRange(start: Date, end: Date): string {
  return `${format(start, 'dd MMM', { locale: es })} - ${format(end, 'dd MMM yyyy', { locale: es })}`;
}

export function formatMonthRange(start: Date, end: Date): string {
  return format(start, 'MMMM yyyy', { locale: es });
}

export function formatQuarterRange(start: Date, end: Date, quarter: number): string {
  return `${quarter}° Trimestre ${format(start, 'yyyy', { locale: es })}`;
}

export function formatBiannualRange(start: Date, end: Date, half: number): string {
  return `${half}° Semestre ${format(start, 'yyyy', { locale: es })}`;
}

export function formatYearRange(start: Date, end: Date): string {
  return format(start, 'yyyy', { locale: es });
}

export function isCurrentWeek(date: Date): boolean {
  const { start, end } = getCurrentWeek();
  return date >= start && date <= end;
}

export function calculateNextDueDate(task: Task, currentDate: Date = new Date()): Date {
  const { frequency, startDate, weekOfMonth, monthsArray } = task;
  
  switch (frequency) {
    case 'WEEKLY':
      // Cada 7 días desde startDate
      const weeksDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return new Date(startDate.getTime() + ((weeksDiff + 1) * 7 * 24 * 60 * 60 * 1000));
    
    case 'MONTHLY':
      // Semana específica del mes
      return calculateMonthlyDate(currentDate, weekOfMonth || 1);
    
    case 'QUARTERLY':
    case 'BIANNUAL':
    case 'ANNUAL':
      // Usar monthsArray para determinar meses específicos
      const months = JSON.parse(monthsArray || '[]');
      return calculatePeriodicDate(currentDate, months, frequency);
    
    default:
      return new Date();
  }
}

export function generatePeriodKey(date: Date, frequency: Frequency): string {
  const year = date.getFullYear();
  
  switch (frequency) {
    case 'WEEKLY':
      const week = getWeek(date);
      return `${year}-W${week.toString().padStart(2, '0')}`;
    case 'MONTHLY':
      const month = date.getMonth() + 1;
      return `${year}-${month.toString().padStart(2, '0')}`;
    case 'QUARTERLY':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    case 'BIANNUAL':
      const half = date.getMonth() < 6 ? 1 : 2;
      return `${year}-H${half}`;
    case 'ANNUAL':
      return `${year}`;
    default:
      return `${year}`;
  }
}

function calculateMonthlyDate(currentDate: Date, weekOfMonth: number): Date {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  
  // Encontrar el primer lunes del mes
  const firstMonday = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  firstMonday.setDate(firstDay.getDate() + daysToAdd);
  
  // Agregar semanas según weekOfMonth
  const targetDate = new Date(firstMonday);
  targetDate.setDate(firstMonday.getDate() + (weekOfMonth - 1) * 7);
  
  return targetDate;
}

function calculatePeriodicDate(currentDate: Date, months: number[], frequency: Frequency): Date {
  const year = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Encontrar el próximo mes válido
  let nextMonth = months.find(m => m > currentMonth);
  let nextYear = year;
  
  if (!nextMonth) {
    nextMonth = months[0];
    nextYear = year + 1;
  }
  
  return new Date(nextYear, nextMonth - 1, 1);
}

export function getCurrentPeriod(frequency: Frequency, date: Date = new Date()): string {
  return generatePeriodKey(date, frequency);
}

export function formatFrequency(frequency: Frequency): string {
  const map = {
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
    QUARTERLY: 'Trimestral',
    BIANNUAL: 'Semestral',
    ANNUAL: 'Anual'
  };
  return map[frequency];
}
