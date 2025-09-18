import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

type StarredRepo = {
  repo: {
    id: string
    name: string
    slug: string
    description: string | null
    visibility: string
    starsCount: number
    updatedAt: Date
    owner: {
      username: string
      name: string | null
    }
    _count: {
      pages: number
    }
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const starredRepos = await prisma.star.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        repo: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            visibility: true,
            starsCount: true,
            updatedAt: true,
            owner: {
              select: {
                username: true,
                name: true
              }
            },
            _count: {
              select: {
                pages: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filtrar apenas repositórios visíveis ao usuário
    const visibleRepos = (starredRepos as StarredRepo[])
      .map(star => star.repo)
      .filter(repo => {
        // Se é público, sempre visível
        if (repo.visibility === 'PUBLIC') return true
        
        // Se é privado, só visível se o usuário é o dono
        return repo.owner.username === session.user.username
      })

    return NextResponse.json(visibleRepos)
  } catch (error) {
    console.error('Erro ao buscar repositórios favoritados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
