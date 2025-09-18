import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canEditRepo, canViewRepo } from '@/lib/permissions'
import { z } from 'zod'

const createPageSchema = z.object({
  repoId: z.string().min(1),
  path: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  contentMd: z.string(),
  order: z.number().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const repoId = searchParams.get('repoId')
    const path = searchParams.get('path')

    if (!repoId || !path) {
      return NextResponse.json(
        { error: 'repoId and path are required' },
        { status: 400 }
      )
    }

    // Verificar se o repo existe e se o usuário pode visualizá-lo
    const repo = await prisma.manualRepo.findUnique({
      where: { id: repoId }
    })
    
    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }
    
    if (!canViewRepo(repo, session)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Buscar a página
    const page = await prisma.page.findUnique({
      where: {
        repoId_path: {
          repoId,
          path
        }
      },
      include: {
        repo: {
          select: {
            id: true,
            name: true,
            slug: true,
            owner: {
              select: {
                username: true
              }
            }
          }
        }
      }
    })

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const validatedData = createPageSchema.parse(body)
    
    // Verificar se o repo existe e se o usuário é o dono
    const repo = await prisma.manualRepo.findUnique({
      where: { id: validatedData.repoId }
    })
    
    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }
    
    if (!canEditRepo(repo, session)) {
      return NextResponse.json(
        { error: 'Forbidden - Only repository owner can create pages' },
        { status: 403 }
      )
    }

    // Verificar se já existe uma página com o mesmo path neste repo
    const existingPage = await prisma.page.findUnique({
      where: {
        repoId_path: {
          repoId: validatedData.repoId,
          path: validatedData.path
        }
      }
    })
    
    if (existingPage) {
      return NextResponse.json(
        { error: 'Page with this path already exists in this repository' },
        { status: 409 }
      )
    }

    // Obter o próximo order
    const lastPage = await prisma.page.findFirst({
      where: { repoId: validatedData.repoId },
      orderBy: { order: 'desc' }
    })
    
    const nextOrder = validatedData.order ?? (lastPage?.order ?? 0) + 1

    const page = await prisma.page.create({
      data: {
        repoId: validatedData.repoId,
        path: validatedData.path,
        title: validatedData.title,
        contentMd: validatedData.contentMd,
        order: nextOrder
      },
      include: {
        repo: {
          select: {
            id: true,
            name: true,
            slug: true,
            owner: {
              select: {
                username: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating page:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
