import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'popular' // popular, recent, stars

    let orderBy: any = { starsCount: 'desc' } // default: popular

    switch (sortBy) {
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      case 'updated':
        orderBy = { updatedAt: 'desc' }
        break
      case 'stars':
        orderBy = { starsCount: 'desc' }
        break
      default:
        orderBy = { starsCount: 'desc' }
    }

    const repos = await prisma.repository.findMany({
      where: {
        visibility: 'PUBLIC'
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        _count: {
          select: {
            guides: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.repository.count({
      where: {
        visibility: 'PUBLIC'
      }
    })

    const formattedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      slug: repo.slug,
      description: repo.description,
      visibility: repo.visibility,
      starsCount: repo.starsCount,
      pagesCount: repo._count.guides,
      owner: repo.owner,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt
    }))

    return NextResponse.json({
      repositories: formattedRepos,
      totalCount,
      hasMore: offset + limit < totalCount
    })
  } catch (error) {
    console.error('Error fetching public repositories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}