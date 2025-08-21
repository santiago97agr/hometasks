import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { tasks, completions, areas } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { 
  getCurrentWeek, getCurrentMonth, getCurrentQuarter, getCurrentBiannual, getCurrentYear,
  getCurrentWeekKey, getCurrentMonthKey, getCurrentQuarterKey, getCurrentBiannualKey, getCurrentYearKey,
  formatWeekRange, formatMonthRange, formatQuarterRange, formatBiannualRange, formatYearRange,
  getCurrentPeriodKey
} from '@/lib/date-utils'

interface TaskData {
  id: string
  name: string
  description: string
  isCompleted: boolean
  completedAt: Date | null
  currentPeriod: string
  area: {
    name: string
    color: string | null
  } | null
}

interface PeriodSummary {
  total: number
  completed: number
  pending: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener información de todos los períodos actuales
    const currentWeek = getCurrentWeek()
    const currentMonth = getCurrentMonth()
    const currentQuarter = getCurrentQuarter()
    const currentBiannual = getCurrentBiannual()
    const currentYear = getCurrentYear()

    // Obtener todas las tareas del usuario
    const userTasks = await db
      .select({
        id: tasks.id,
        name: tasks.name,
        description: tasks.description,
        frequency: tasks.frequency,
        areaId: tasks.areaId,
        startDate: tasks.startDate,
        weekOfMonth: tasks.weekOfMonth,
        monthsArray: tasks.monthsArray,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        areaName: areas.name,
        areaColor: areas.color,
      })
      .from(tasks)
      .leftJoin(areas, eq(tasks.areaId, areas.id))
      .where(eq(tasks.userId, session.user.id))

    // Inicializar estructuras de datos
    const tasksByFrequency: {
      weekly: TaskData[]
      monthly: TaskData[]
      quarterly: TaskData[]
      biannual: TaskData[]
      annual: TaskData[]
    } = {
      weekly: [],
      monthly: [],
      quarterly: [],
      biannual: [],
      annual: []
    }

    // Procesar cada tarea
    for (const task of userTasks) {
      const periodKey = getCurrentPeriodKey(task.frequency as any)
      
      // Verificar si está completada en el período actual
      const [completion] = await db
        .select()
        .from(completions)
        .where(and(
          eq(completions.taskId, task.id),
          eq(completions.period, periodKey)
        ))

      const taskWithCompletion: TaskData = {
        id: task.id,
        name: task.name,
        description: task.description || '',
        isCompleted: !!completion,
        completedAt: completion?.completedAt || null,
        currentPeriod: periodKey,
        area: task.areaName ? {
          name: task.areaName,
          color: task.areaColor,
        } : null,
      }

      // Agregar a la frecuencia correspondiente
      switch (task.frequency) {
        case 'WEEKLY':
          tasksByFrequency.weekly.push(taskWithCompletion)
          break
        case 'MONTHLY':
          tasksByFrequency.monthly.push(taskWithCompletion)
          break
        case 'QUARTERLY':
          tasksByFrequency.quarterly.push(taskWithCompletion)
          break
        case 'BIANNUAL':
          tasksByFrequency.biannual.push(taskWithCompletion)
          break
        case 'ANNUAL':
          tasksByFrequency.annual.push(taskWithCompletion)
          break
      }
    }

    return NextResponse.json({
      periods: {
        week: {
          ...currentWeek,
          weekKey: getCurrentWeekKey(),
          formatted: formatWeekRange(currentWeek.start, currentWeek.end),
        },
        month: {
          ...currentMonth,
          monthKey: getCurrentMonthKey(),
          formatted: formatMonthRange(currentMonth.start, currentMonth.end),
        },
        quarter: {
          ...currentQuarter,
          quarterKey: getCurrentQuarterKey(),
          formatted: formatQuarterRange(currentQuarter.start, currentQuarter.end, currentQuarter.quarterNumber),
        },
        biannual: {
          ...currentBiannual,
          biannualKey: getCurrentBiannualKey(),
          formatted: formatBiannualRange(currentBiannual.start, currentBiannual.end, currentBiannual.halfNumber),
        },
        year: {
          ...currentYear,
          yearKey: getCurrentYearKey(),
          formatted: formatYearRange(currentYear.start, currentYear.end),
        },
      },
      tasks: tasksByFrequency,
      summary: {
        weekly: {
          total: tasksByFrequency.weekly.length,
          completed: tasksByFrequency.weekly.filter(t => t.isCompleted).length,
          pending: tasksByFrequency.weekly.filter(t => !t.isCompleted).length,
        },
        monthly: {
          total: tasksByFrequency.monthly.length,
          completed: tasksByFrequency.monthly.filter(t => t.isCompleted).length,
          pending: tasksByFrequency.monthly.filter(t => !t.isCompleted).length,
        },
        quarterly: {
          total: tasksByFrequency.quarterly.length,
          completed: tasksByFrequency.quarterly.filter(t => t.isCompleted).length,
          pending: tasksByFrequency.quarterly.filter(t => !t.isCompleted).length,
        },
        biannual: {
          total: tasksByFrequency.biannual.length,
          completed: tasksByFrequency.biannual.filter(t => t.isCompleted).length,
          pending: tasksByFrequency.biannual.filter(t => !t.isCompleted).length,
        },
        annual: {
          total: tasksByFrequency.annual.length,
          completed: tasksByFrequency.annual.filter(t => t.isCompleted).length,
          pending: tasksByFrequency.annual.filter(t => !t.isCompleted).length,
        },
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}