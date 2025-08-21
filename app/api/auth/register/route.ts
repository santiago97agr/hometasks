import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      console.log('Validation errors:', validation.error.errors)
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    // Verificar si el usuario ya existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      )
    }

    // Crear hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12)

    // Crear usuario
    const userId = uuidv4()
    await db.insert(users).values({
      id: userId,
      name,
      email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      { message: 'Usuario creado exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
