import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { areas } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createAreaSchema } from '@/lib/validations'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userAreas = await db
      .select()
      .from(areas)
      .where(eq(areas.userId, session.user.id))

    return NextResponse.json(userAreas)
  } catch (error) {
    console.error('Areas error:', error)
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
    
    const validation = createAreaSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, color } = validation.data

    const areaId = uuidv4()
    await db.insert(areas).values({
      id: areaId,
      name,
      color,
      userId: session.user.id,
      createdAt: new Date(),
    })

    return NextResponse.json(
      { message: 'Área creada exitosamente', id: areaId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create area error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
