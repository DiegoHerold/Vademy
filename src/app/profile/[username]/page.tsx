import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { UserHeader } from '@/components/user/user-header'
import RepoCard from '@/components/repo-card'
import { EmptyState } from '@/components/common/empty-state'
import { UserNav } from '@/components/navigation/user-nav'
import { BookOpen } from 'lucide-react'

type UserRepo = {
  id: string
  name: string
  slug: string
  description: string | null
  visibility: 'PUBLIC' | 'PRIVATE'
  starsCount: number
  updatedAt: Date
  owner: {
    username: string
    name: string | null
  }
  _count: {
    guides: number
  }
}

interface UserProfilePageProps {
  params: {
    username: string
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = params

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      createdAt: true
    }
  })

  if (!user) {
    notFound()
  }

  // Buscar repositórios públicos do usuário
  const repos = await prisma.repository.findMany({
    where: {
      ownerId: user.id,
      visibility: 'PUBLIC'
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
          guides: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  // Calcular estatísticas
  const stats = {
    publicReposCount: repos.length,
    totalStarsReceived: (repos as UserRepo[]).reduce((sum, repo) => sum + repo.starsCount, 0)
  }

  // Transformar dados para o componente RepoCard
  const reposWithPageCount = (repos as UserRepo[]).map(repo => ({
    ...repo,
    pagesCount: repo._count.guides
  }))

  // Buscar páginas populares dos repositórios públicos
  const popularGuides = await prisma.guide.findMany({
    where: {
      repository: {
        ownerId: user.id,
        visibility: 'PUBLIC'
      }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      updatedAt: true,
      repository: {
        select: {
          name: true,
          slug: true,
          owner: {
            select: {
              username: true
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 6
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl">
        <UserHeader 
          user={user} 
          stats={stats} 
          showShareButton={true}
        />
        
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Sidebar de navegação */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <UserNav
                  repositories={reposWithPageCount}
                  pages={popularGuides.filter(guide => guide.repository !== null) as any}
                  username={user.username}
                />
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="lg:col-span-3 space-y-8">
              {/* Seção de Guias Recentes */}
              {popularGuides.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">📚 Guias Recentes</h2>
                  <p className="text-muted-foreground">
                    Últimos guias e tutoriais publicados
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="group p-4 border rounded-lg hover:shadow-md transition-all hover:border-primary/50 bg-card"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          <a href={`/${guide.repository?.owner.username}/${guide.repository?.slug}?path=${encodeURIComponent(guide.slug)}`}>
                            {guide.title}
                          </a>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {guide.repository?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Atualizado {new Date(guide.updatedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Seção de Repositórios */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">🗂️ Repositórios Públicos</h2>
                <p className="text-muted-foreground">
                  {repos.length} repositório{repos.length !== 1 ? 's' : ''} público{repos.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {repos.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum repositório público
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {user.name || user.username} ainda não possui repositórios públicos para compartilhar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reposWithPageCount.map((repo) => (
                  <div key={repo.id} className="group">
                    <RepoCard
                      repo={repo}
                      showOwner={false}
                      showActions={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Estatísticas do Perfil */}
          <section className="bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{repos.length}</div>
                <div className="text-sm text-muted-foreground">Repositórios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalStarsReceived}</div>
                <div className="text-sm text-muted-foreground">Stars Recebidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {reposWithPageCount.reduce((sum, repo) => sum + repo.pagesCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Páginas Criadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {new Date(user.createdAt).getFullYear()}
                </div>
                <div className="text-sm text-muted-foreground">Membro desde</div>
              </div>
            </div>
          </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: UserProfilePageProps) {
  const { username } = params
  
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true
    }
  })

  if (!user) {
    return {
      title: 'Usuário não encontrado'
    }
  }

  return {
    title: `${user.name || user.username} (@${user.username}) - Vademy`,
    description: `Perfil de ${user.name || user.username} no Vademy. Veja os repositórios públicos e projetos.`
  }
}