import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate data with Zod
    const validatedData = registerSchema.parse(body)
    
    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }
    
    // Check if username already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: validatedData.username }
    })
    
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username já está em uso' },
        { status: 400 }
      )
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        username: validatedData.username,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user 
      },
      { status: 201 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
