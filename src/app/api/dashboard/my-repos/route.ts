import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const repos = await prisma.manualRepo.findMany({
      where: {
        ownerId: session.user.id
      },
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(repos)
  } catch (error) {
    console.error('Erro ao buscar repositórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
