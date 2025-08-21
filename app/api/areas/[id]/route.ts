import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { areas, tasks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { createAreaSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: areaId } = await params

    const [area] = await db
      .select()
      .from(areas)
      .where(and(eq(areas.id, areaId), eq(areas.userId, session.user.id)))

    if (!area) {
      return NextResponse.json(
        { error: 'Área no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(area)
  } catch (error) {
    console.error('Get area error:', error)
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

    const { id: areaId } = await params
    const body = await request.json()
    
    const validation = createAreaSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, color } = validation.data

    // Verificar que el área pertenece al usuario
    const [existingArea] = await db
      .select()
      .from(areas)
      .where(and(eq(areas.id, areaId), eq(areas.userId, session.user.id)))

    if (!existingArea) {
      return NextResponse.json(
        { error: 'Área no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar el área
    await db
      .update(areas)
      .set({
        name,
        color,
      })
      .where(eq(areas.id, areaId))

    return NextResponse.json(
      { message: 'Área actualizada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update area error:', error)
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

    const { id: areaId } = await params

    // Verificar que el área pertenece al usuario
    const [existingArea] = await db
      .select()
      .from(areas)
      .where(and(eq(areas.id, areaId), eq(areas.userId, session.user.id)))

    if (!existingArea) {
      return NextResponse.json(
        { error: 'Área no encontrada' },
        { status: 404 }
      )
    }

    // Primero, actualizar todas las tareas que usan esta área para quitar la referencia
    await db
      .update(tasks)
      .set({ areaId: null })
      .where(eq(tasks.areaId, areaId))

    // Ahora eliminar el área
    await db
      .delete(areas)
      .where(eq(areas.id, areaId))

    return NextResponse.json(
      { message: 'Área eliminada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete area error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
