import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canViewRepo } from '@/lib/permissions'

type RepoWithOwner = {
  id: string
  name: string
  slug: string
  description: string | null
  visibility: string
  starsCount: number
  createdAt: Date
  updatedAt: Date
  ownerId: string
  owner: {
    id: string
    username: string
    name: string | null
  }
}

type PageWithRepo = {
  id: string
  title: string
  path: string
  createdAt: Date
  updatedAt: Date
  repo: {
    id: string
    name: string
    slug: string
    owner: {
      username: string
      name: string | null
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query')
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const searchTerm = `%${query.trim()}%`

    // Buscar repositórios
    const allRepos = await prisma.manualRepo.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query.trim()
            }
          },
          {
            description: {
              contains: query.trim()
            }
          }
        ]
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

    // Filtrar repos que o usuário pode ver
    const visibleRepos = (allRepos as RepoWithOwner[]).filter(repo => canViewRepo(repo, session))

    // Buscar páginas (apenas em repos que o usuário pode ver)
    const visibleRepoIds = visibleRepos.map(repo => repo.id)
    
    const pages = visibleRepoIds.length > 0 ? await prisma.page.findMany({
      where: {
        AND: [
          {
            repoId: {
              in: visibleRepoIds
            }
          },
          {
            title: {
              contains: query.trim()
            }
          }
        ]
      },
      include: {
        repo: {
          select: {
            id: true,
            name: true,
            slug: true,
            owner: {
              select: {
                username: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }) : []

    const results = {
      repositories: visibleRepos.map(repo => ({
        id: repo.id,
        name: repo.name,
        slug: repo.slug,
        description: repo.description,
        visibility: repo.visibility,
        starsCount: repo.starsCount,
        owner: repo.owner,
        createdAt: repo.createdAt,
        updatedAt: repo.updatedAt
      })),
      pages: (pages as PageWithRepo[]).map(page => ({
        id: page.id,
        title: page.title,
        path: page.path,
        repo: page.repo,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      })),
      query: query.trim(),
      totalResults: visibleRepos.length + pages.length
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
