import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canViewRepo } from '@/lib/permissions'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, GitFork, Eye, Calendar, Code, FileText, Users, Settings, Lock, Globe, Sparkles } from 'lucide-react'
import StarButton from '@/components/star-button'
import Link from 'next/link'
import { RepoPageClient } from '@/components/repo/repo-page-client'
import { ReadmeViewer } from '@/components/repo/readme-viewer'
import { PageViewer } from '@/components/repo/page-viewer'
import { PagesManager } from '@/components/repo/pages-manager'
import { PageBreadcrumb } from '@/components/navigation/page-breadcrumb'
import { RepositoryPageClient } from '@/components/repo/repository-page-client'

interface RepositoryPageProps {
  params: {
    owner: string
    repo: string
  }
  searchParams: {
    path?: string
  }
}

type PageType = {
  id: string
  title: string
  path: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export default async function RepositoryPage({ params, searchParams }: RepositoryPageProps) {
  const { owner, repo } = params
  const { path: pagePath } = searchParams
  const session = await getServerSession(authOptions)

  // Buscar o repositório
  const repository = await prisma.manualRepo.findFirst({
    where: {
      slug: decodeURIComponent(repo),
      owner: {
        username: decodeURIComponent(owner)
      }
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          name: true
        }
      },
      pages: {
        orderBy: {
          order: 'asc'
        }
      },
      _count: {
        select: {
          stars: true,
          pages: true
        }
      }
    }
  })

  if (!repository) {
    notFound()
  }

  // Verificar se o usuário pode ver o repositório
  if (!canViewRepo(repository, session)) {
    notFound()
  }

  // Verificar se o usuário já deu star
  let isStarred = false
  if (session?.user?.id) {
    const star = await prisma.star.findUnique({
      where: {
        userId_repoId: {
          userId: session.user.id,
          repoId: repository.id
        }
      }
    })
    isStarred = !!star
  }

  const isOwner = session?.user?.id === repository.ownerId

  // Se um path específico foi solicitado, buscar a página
  let currentPage = null
  if (pagePath) {
    currentPage = await prisma.page.findUnique({
      where: {
        repoId_path: {
          repoId: repository.id,
          path: pagePath
        }
      }
    })
  }

  // Buscar README.md do repositório
  const readmePage = await prisma.page.findUnique({
    where: {
      repoId_path: {
        repoId: repository.id,
        path: 'README.md'
      }
    }
  })

  // Criar breadcrumb baseado no contexto
  const breadcrumbItems = currentPage 
    ? [
        {
          type: 'home' as const,
          label: 'Início',
          href: '/',
        },
        {
          type: 'user' as const,
          label: repository.owner.username,
          href: `/profile/${repository.owner.username}`,
        },
        {
          type: 'repo' as const,
          label: repository.slug,
          href: `/${repository.owner.username}/${repository.slug}`,
          badge: repository.description ? 'Público' : undefined,
        },
        {
          type: 'page' as const,
          label: currentPage.title,
          href: `/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(currentPage.path)}`,
          badge: currentPage.path === 'README.md' ? 'README' : undefined,
        },
      ]
    : [
        {
          type: 'home' as const,
          label: 'Início',
          href: '/',
        },
        {
          type: 'user' as const,
          label: repository.owner.username,
          href: `/profile/${repository.owner.username}`,
        },
        {
          type: 'repo' as const,
          label: repository.slug,
          href: `/${repository.owner.username}/${repository.slug}`,
          badge: repository.description ? 'Público' : undefined,
        },
      ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <PageBreadcrumb 
            items={breadcrumbItems}
            actions={
              <div className="flex items-center gap-2">
                <StarButton 
                  repoId={repository.id}
                  initialStarred={isStarred}
                  initialCount={repository.starsCount}
                />
                {isOwner && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${repository.owner.username}/${repository.slug}/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </Link>
                  </Button>
                )}
              </div>
            }
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <RepositoryPageClient
          repository={repository}
          currentPagePath={currentPage?.path}
          isOwner={isOwner}
        >

        {/* Se uma página específica foi solicitada, mostrar ela */}
        {currentPage ? (
          <PageViewer 
            page={currentPage}
            repository={repository}
            isOwner={isOwner}
            allPages={repository.pages as PageType[]}
          />
        ) : (
          /* Conteúdo padrão do repositório */
          <div className="space-y-8">
            {/* README Section */}
            <ReadmeViewer 
              repository={repository}
              readmePage={readmePage}
              isOwner={isOwner}
            />

            {/* Repository Content */}
            <Tabs defaultValue="pages" className="space-y-6">
              <TabsList>
                <TabsTrigger value="pages" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Páginas
                </TabsTrigger>
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Sobre
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pages">
                <PagesManager
                  repository={repository}
                  pages={repository.pages as PageType[]}
                  isOwner={isOwner}
                />
              </TabsContent>

              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre o Repositório</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <h2>{repository.name}</h2>
                      {repository.description && (
                        <p>{repository.description}</p>
                      )}
                      
                      <h3>Informações</h3>
                      <ul>
                        <li><strong>Criado por:</strong> {repository.owner.name || repository.owner.username}</li>
                        <li><strong>Visibilidade:</strong> {repository.visibility === 'PUBLIC' ? 'Público' : 'Privado'}</li>
                        <li><strong>Páginas:</strong> {repository._count.pages}</li>
                        <li><strong>Stars:</strong> {repository.starsCount}</li>
                        <li><strong>Última atualização:</strong> {new Date(repository.updatedAt).toLocaleDateString('pt-BR')}</li>
                      </ul>
                      
                      {repository.pages.length > 0 && (
                        <>
                          <h3>Páginas disponíveis</h3>
                          <ul>
                            {(repository.pages as PageType[]).map((page) => (
                              <li key={page.id}>
                                <Link 
                                  href={`/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(page.path)}`}
                                  className="text-primary hover:underline"
                                >
                                  {page.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
        </RepositoryPageClient>
      </div>
    </div>
  );
}