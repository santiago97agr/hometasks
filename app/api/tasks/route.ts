import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { tasks, areas } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { createTaskSchema } from '@/lib/validations'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

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
        area: {
          id: areas.id,
          name: areas.name,
          color: areas.color,
        }
      })
      .from(tasks)
      .leftJoin(areas, eq(tasks.areaId, areas.id))
      .where(eq(tasks.userId, session.user.id))

    return NextResponse.json(userTasks)
  } catch (error) {
    console.error('Tasks error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    const validation = createTaskSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, description, frequency, areaId, startDate } = validation.data

    const taskId = uuidv4()
    await db.insert(tasks).values({
      id: taskId,
      name,
      description,
      frequency,
      areaId: areaId || null,
      userId: session.user.id,
      startDate,
      weekOfMonth: null, // Campo simplificado, no se usa
      monthsArray: null, // Campo simplificado, no se usa
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      { message: 'Tarea creada exitosamente', id: taskId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
