import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { tasks, completions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentPeriodKey } from '@/lib/date-utils'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: taskId } = await params

    // Verificar que la tarea pertenece al usuario
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))

    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    // Obtener la clave del período actual según la frecuencia de la tarea
    const currentPeriodKey = getCurrentPeriodKey(task.frequency as any)

    // Verificar si ya está completada en este período
    const [existingCompletion] = await db
      .select()
      .from(completions)
      .where(and(
        eq(completions.taskId, taskId),
        eq(completions.period, currentPeriodKey)
      ))

    if (existingCompletion) {
      const periodNames = {
        WEEKLY: 'esta semana',
        MONTHLY: 'este mes',
        QUARTERLY: 'este trimestre',
        BIANNUAL: 'este semestre',
        ANNUAL: 'este año'
      }
      
      return NextResponse.json(
        { error: `Tarea ya completada ${periodNames[task.frequency as keyof typeof periodNames]}` },
        { status: 409 }
      )
    }

    // Crear nueva completion
    const completionId = uuidv4()
    await db.insert(completions).values({
      id: completionId,
      taskId,
      completedAt: new Date(),
      period: currentPeriodKey,
    })

    return NextResponse.json(
      { message: 'Tarea marcada como completada', period: currentPeriodKey },
      { status: 201 }
    )
  } catch (error) {
    console.error('Complete task error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: taskId } = await params

    // Verificar que la tarea pertenece al usuario
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))

    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    // Obtener la clave del período actual según la frecuencia de la tarea
    const currentPeriodKey = getCurrentPeriodKey(task.frequency as any)

    // Eliminar completion del período actual
    await db
      .delete(completions)
      .where(and(
        eq(completions.taskId, taskId),
        eq(completions.period, currentPeriodKey)
      ))

    return NextResponse.json(
      { message: 'Tarea marcada como no completada' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Uncomplete task error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
