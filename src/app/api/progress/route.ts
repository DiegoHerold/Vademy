import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canViewRepo } from '@/lib/permissions'
import { z } from 'zod'

const saveProgressSchema = z.object({
  pageId: z.string().min(1),
  completedSteps: z.number().min(0),
  totalSteps: z.number().min(1)
}).refine(data => data.completedSteps <= data.totalSteps, {
  message: "Completed steps cannot be greater than total steps"
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
    const validatedData = saveProgressSchema.parse(body)
    
    // Verificar se a página existe e obter o repo
    const page = await prisma.page.findUnique({
      where: { id: validatedData.pageId },
      include: {
        repo: true
      }
    })
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode ver o repo
    if (!canViewRepo(page.repo, session)) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot access this repository' },
        { status: 403 }
      )
    }

    // Criar ou atualizar o progresso
    const progress = await prisma.progress.upsert({
      where: {
        userId_repoId_pageId: {
          userId: session.user.id,
          repoId: page.repoId,
          pageId: validatedData.pageId
        }
      },
      update: {
        completedSteps: validatedData.completedSteps,
        totalSteps: validatedData.totalSteps
      },
      create: {
        userId: session.user.id,
        repoId: page.repoId,
        pageId: validatedData.pageId,
        completedSteps: validatedData.completedSteps,
        totalSteps: validatedData.totalSteps
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            path: true
          }
        },
        repo: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      id: progress.id,
      completedSteps: progress.completedSteps,
      totalSteps: progress.totalSteps,
      percentage: Math.round((progress.completedSteps / progress.totalSteps) * 100),
      page: progress.page,
      repo: progress.repo,
      updatedAt: progress.updatedAt
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error saving progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
