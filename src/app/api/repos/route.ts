import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const createRepoSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createRepoSchema.parse(body)
    
    const slug = slugify(validatedData.name)
    
    // Verificar se já existe um repo com o mesmo slug para este usuário
    const existingRepo = await prisma.manualRepo.findUnique({
      where: {
        ownerId_slug: {
          ownerId: session.user.id,
          slug: slug
        }
      }
    })
    
    if (existingRepo) {
      return NextResponse.json(
        { error: 'Repository with this name already exists' },
        { status: 409 }
      )
    }

    const repo = await prisma.manualRepo.create({
      data: {
        name: validatedData.name,
        slug: slug,
        description: validatedData.description,
        visibility: validatedData.visibility,
        ownerId: session.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(repo, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating repository:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
