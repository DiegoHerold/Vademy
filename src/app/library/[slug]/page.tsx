import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Star, Users, Plus } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface LibraryPageProps {
  params: {
    slug: string
  }
}

export default async function LibraryPage({ params }: LibraryPageProps) {
  const { slug } = params
  const session = await getServerSession(authOptions)

  // Buscar a biblioteca
  const library = await prisma.library.findFirst({
    where: {
      slug: decodeURIComponent(slug),
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
      repositories: {
        where: {
          visibility: 'PUBLIC'
        },
        include: {
          owner: {
            select: {
              username: true,
              name: true
            }
          },
          _count: {
            select: {
              guides: true,
              stars: true
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  })

  if (!library) {
    notFound()
  }

  const isOwner = session?.user?.id === library.ownerId

  return (
    <div className="min-h-screen bg-background">
      {/* Header da Biblioteca */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ backgroundColor: library.color || '#3B82F6' }}
            >
              {library.icon || '📚'}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{library.name}</h1>
              {library.description && (
                <p className="text-xl text-muted-foreground mb-4">
                  {library.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{library.repositories.length} repositórios</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>por {library.owner.name || library.owner.username}</span>
                </div>
              </div>
            </div>
            {isOwner && (
              <Button asChild>
                <Link href={`/library/${library.slug}/new-repository`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Repositório
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {library.repositories.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {library.repositories.map((repo) => (
              <Card key={repo.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href={`/${repo.owner.username}/${repo.slug}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {repo.name}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {repo._count.guides}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {repo._count.stars}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">
                      {repo.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>por {repo.owner.name || repo.owner.username}</span>
                      <Badge variant="secondary" className="text-xs">
                        {repo._count.guides} guias
                      </Badge>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center text-4xl">
              📁
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum repositório ainda</h3>
            <p className="text-muted-foreground mb-6">
              Esta biblioteca ainda não possui repositórios.
            </p>
            {isOwner && (
              <Button asChild>
                <Link href={`/library/${library.slug}/new-repository`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Repositório
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: LibraryPageProps) {
  const library = await prisma.library.findFirst({
    where: {
      slug: decodeURIComponent(params.slug),
      visibility: 'PUBLIC'
    }
  })

  if (!library) {
    return {
      title: 'Biblioteca não encontrada - Vademy'
    }
  }

  return {
    title: `${library.name} - Vademy`,
    description: library.description || `Explore repositórios da biblioteca ${library.name}`
  }
}