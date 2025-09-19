import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canViewRepo } from '@/lib/permissions'

export async function POST(
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

    const repoId = params.id
    
    // Verificar se o repo existe e se o usuário pode vê-lo
    const repo = await prisma.repository.findUnique({
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

    // Verificar se já existe star
    const existingStar = await prisma.star.findUnique({
      where: {
        userId_repositoryId: {
          userId: session.user.id,
          repositoryId: repoId
        }
      }
    })

    let isStarred: boolean
    let starsCount: number

    if (existingStar) {
      // Remove star
      await prisma.$transaction([
        prisma.star.delete({
          where: {
            userId_repositoryId: {
              userId: session.user.id,
              repositoryId: repoId
            }
          }
        }),
        prisma.repository.update({
          where: { id: repoId },
          data: {
            starsCount: {
              decrement: 1
            }
          }
        })
      ])
      isStarred = false
      starsCount = repo.starsCount - 1
    } else {
      // Adiciona star
      await prisma.$transaction([
        prisma.star.create({
          data: {
            userId: session.user.id,
            repositoryId: repoId
          }
        }),
        prisma.repository.update({
          where: { id: repoId },
          data: {
            starsCount: {
              increment: 1
            }
          }
        })
      ])
      isStarred = true
      starsCount = repo.starsCount + 1
    }

    return NextResponse.json({
      isStarred,
      starsCount
    })
  } catch (error) {
    console.error('Error toggling star:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}