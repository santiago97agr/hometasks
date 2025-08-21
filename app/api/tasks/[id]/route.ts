import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { tasks, areas } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { createTaskSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: taskId } = await params

    const [task] = await db
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
        area: {
          id: areas.id,
          name: areas.name,
          color: areas.color,
        }
      })
      .from(tasks)
      .leftJoin(areas, eq(tasks.areaId, areas.id))
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))

    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: taskId } = await params
    const body = await request.json()
    
    const validation = createTaskSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, description, frequency, areaId, startDate } = validation.data

    // Verificar que la tarea pertenece al usuario
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar la tarea
    await db
      .update(tasks)
      .set({
        name,
        description,
        frequency,
        areaId: areaId || null,
        startDate,
        weekOfMonth: null, // Campo simplificado, no se usa
        monthsArray: null, // Campo simplificado, no se usa
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))

    return NextResponse.json(
      { message: 'Tarea actualizada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update task error:', error)
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
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la tarea (hard delete)
    await db
      .delete(tasks)
      .where(eq(tasks.id, taskId))

    return NextResponse.json(
      { message: 'Tarea eliminada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
