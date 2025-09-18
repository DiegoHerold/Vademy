import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canEditRepo } from '@/lib/permissions'
import { z } from 'zod'

const updatePageSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  contentMd: z.string().optional()
}).refine(data => data.title !== undefined || data.contentMd !== undefined, {
  message: "At least one field (title or contentMd) must be provided"
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const pageId = params.id
    const body = await request.json()
    const validatedData = updatePageSchema.parse(body)
    
    // Verificar se a página existe e obter o repo
    const page = await prisma.page.findUnique({
      where: { id: pageId },
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
        { error: 'Forbidden - Only repository owner can edit pages' },
        { status: 403 }
      )
    }

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.contentMd && { contentMd: validatedData.contentMd })
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

    return NextResponse.json(updatedPage)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating page:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const pageId = params.id
    
    // Verificar se a página existe e obter o repo
    const page = await prisma.page.findUnique({
      where: { id: pageId },
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
        { error: 'Forbidden - Only repository owner can delete pages' },
        { status: 403 }
      )
    }

    // Não permitir deletar README.md
    if (page.path === 'README.md') {
      return NextResponse.json(
        { error: 'Cannot delete README.md' },
        { status: 400 }
      )
    }

    await prisma.page.delete({
      where: { id: pageId }
    })

    return NextResponse.json({ message: 'Page deleted successfully' })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}