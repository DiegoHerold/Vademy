import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canEditRepo } from '@/lib/permissions'
import { z } from 'zod'

type PageWithOrder = {
  id: string
  order: number
}

const reorderPageSchema = z.object({
  pageId: z.string().min(1),
  direction: z.enum(['up', 'down'])
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
    const validatedData = reorderPageSchema.parse(body)
    
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
    
    // Verificar se o usuário pode editar o repo
    if (!canEditRepo(page.repo, session)) {
      return NextResponse.json(
        { error: 'Forbidden - Only repository owner can reorder pages' },
        { status: 403 }
      )
    }

    // Obter todas as páginas do repo ordenadas
    const allPages = await prisma.page.findMany({
      where: { repoId: page.repoId },
      orderBy: { order: 'asc' }
    })

    const currentIndex = (allPages as PageWithOrder[]).findIndex(p => p.id === validatedData.pageId)
    
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: 'Page not found in repository' },
        { status: 404 }
      )
    }

    let targetIndex: number
    
    if (validatedData.direction === 'up') {
      if (currentIndex === 0) {
        return NextResponse.json(
          { error: 'Page is already at the top' },
          { status: 400 }
        )
      }
      targetIndex = currentIndex - 1
    } else {
      if (currentIndex === allPages.length - 1) {
        return NextResponse.json(
          { error: 'Page is already at the bottom' },
          { status: 400 }
        )
      }
      targetIndex = currentIndex + 1
    }

    // Trocar as posições
    const currentPage = allPages[currentIndex]
    const targetPage = allPages[targetIndex]

    await prisma.$transaction([
      prisma.page.update({
        where: { id: currentPage.id },
        data: { order: targetPage.order }
      }),
      prisma.page.update({
        where: { id: targetPage.id },
        data: { order: currentPage.order }
      })
    ])

    // Retornar as páginas atualizadas
    const updatedPages = await prisma.page.findMany({
      where: { repoId: page.repoId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        path: true,
        order: true
      }
    })

    return NextResponse.json({ pages: updatedPages })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error reordering page:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
