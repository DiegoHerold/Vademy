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
  slug: string
  path?: string // Para compatibilidade com componentes antigos
  contentMd: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export default async function RepositoryPage({ params, searchParams }: RepositoryPageProps) {
  const { owner, repo } = params
  const { path: pagePath } = searchParams
  const session = await getServerSession(authOptions)

  // Buscar o repositório
  const repository = await prisma.repository.findFirst({
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
      guides: {
        orderBy: {
          order: 'asc'
        }
      },
      _count: {
        select: {
          stars: true,
          guides: true
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
        userId_repositoryId: {
          userId: session.user.id,
          repositoryId: repository.id
        }
      }
    })
    isStarred = !!star
  }

  const isOwner = session?.user?.id === repository.ownerId

  // Se um path específico foi solicitado, buscar o guia
  let currentGuide = null
  if (pagePath) {
    currentGuide = await prisma.guide.findFirst({
      where: {
        repositoryId: repository.id,
        slug: pagePath.replace('.md', '').replace('/', '-')
      }
    })
  }

  // Buscar README.md do repositório (guia principal)
  const readmeGuide = await prisma.guide.findFirst({
    where: {
      repositoryId: repository.id,
      isReadme: true
    }
  })

  // Criar breadcrumb baseado no contexto
  const breadcrumbItems = currentGuide 
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
          label: currentGuide.title,
          href: `/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(currentGuide.slug)}`,
          badge: currentGuide.isReadme ? 'README' : undefined,
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
          currentPagePath={currentGuide?.slug}
          isOwner={isOwner}
        >

        {/* Se um guia específico foi solicitado, mostrar ele */}
        {currentGuide ? (
          <PageViewer 
            page={{
              id: currentGuide.id,
              title: currentGuide.title,
              path: currentGuide.slug + '.md',
              contentMd: currentGuide.contentMd,
              createdAt: currentGuide.createdAt,
              updatedAt: currentGuide.updatedAt
            }}
            repository={repository}
            isOwner={isOwner}
            allPages={repository.guides.map(guide => ({
              id: guide.id,
              title: guide.title,
              path: guide.slug + '.md',
              order: guide.order
            }))}
          />
        ) : (
          /* Conteúdo padrão do repositório */
          <div className="space-y-8">
            {/* README Section */}
            <ReadmeViewer 
              repository={repository}
              readmePage={readmeGuide ? {
                id: readmeGuide.id,
                title: readmeGuide.title,
                path: 'README.md',
                contentMd: readmeGuide.contentMd,
                updatedAt: readmeGuide.updatedAt
              } : null}
              isOwner={isOwner}
            />

            {/* Repository Content */}
            <Tabs defaultValue="guides" className="space-y-6">
              <TabsList>
                <TabsTrigger value="guides" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Guias
                </TabsTrigger>
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Sobre
                </TabsTrigger>
              </TabsList>

              <TabsContent value="guides">
                <PagesManager
                  repository={repository}
                  pages={repository.guides.map(guide => ({
                    id: guide.id,
                    title: guide.title,
                    path: guide.slug + '.md',
                    contentMd: guide.contentMd,
                    order: guide.order,
                    createdAt: guide.createdAt,
                    updatedAt: guide.updatedAt
                  }))}
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
                        <li><strong>Guias:</strong> {repository._count.guides}</li>
                        <li><strong>Stars:</strong> {repository.starsCount}</li>
                        <li><strong>Última atualização:</strong> {new Date(repository.updatedAt).toLocaleDateString('pt-BR')}</li>
                      </ul>
                      
                      {repository.guides.length > 0 && (
                        <>
                          <h3>Guias disponíveis</h3>
                          <ul>
                            {(repository.guides as PageType[]).map((guide) => (
                              <li key={guide.id}>
                                <Link 
                                  href={`/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(guide.slug)}`}
                                  className="text-primary hover:underline"
                                >
                                  {guide.title}
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