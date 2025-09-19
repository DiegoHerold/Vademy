import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, GitBranch, Users, Library, FolderOpen } from 'lucide-react';
import { prisma } from '@/lib/prisma';

type LibraryWithStats = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  _count: {
    repositories: number
  }
}

type PopularRepository = {
  id: string
  name: string
  slug: string
  description: string | null
  starsCount: number
  owner: {
    username: string
    name: string | null
  }
  library: {
    name: string
    slug: string
    icon: string | null
    color: string | null
  } | null
  _count: {
    guides: number
  }
}

export default async function HomePage() {
  // Buscar bibliotecas públicas
  const libraries = await prisma.library.findMany({
    where: {
      visibility: 'PUBLIC'
    },
    include: {
      _count: {
        select: {
          repositories: true
        }
      }
    },
    orderBy: {
      order: 'asc'
    },
    take: 6
  });

  // Buscar repositórios populares
  const popularRepositories = await prisma.repository.findMany({
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
      library: {
        select: {
          name: true,
          slug: true,
          icon: true,
          color: true
        }
      },
      _count: {
        select: {
          guides: true
        }
      }
    },
    orderBy: {
      starsCount: 'desc'
    },
    take: 6
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Aprenda Programação com
          <span className="block text-primary">Vademy</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Tutoriais interativos, repositórios reais e experiências práticas de aprendizado.
          Domine programação através da prática, não apenas teoria.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Começar Agora</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/explore">Explorar Repositórios</Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          {
            icon: <BookOpen className="h-8 w-8" />,
            title: 'Aprendizado Interativo',
            description: 'Aprenda fazendo com exemplos de código reais e exercícios'
          },
          {
            icon: <Code className="h-8 w-8" />,
            title: 'Repositórios Reais',
            description: 'Trabalhe com bases de código reais e práticas da indústria'
          },
          {
            icon: <GitBranch className="h-8 w-8" />,
            title: 'Controle de Versão',
            description: 'Domine workflows Git e desenvolvimento colaborativo'
          },
          {
            icon: <Users className="h-8 w-8" />,
            title: 'Comunidade',
            description: 'Conecte-se com outros estudantes e desenvolvedores experientes'
          }
        ].map((feature, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                {feature.icon}
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Bibliotecas */}
      {libraries.length > 0 && (
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Explore por Categoria</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Navegue pelas bibliotecas organizadas por tema
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(libraries as LibraryWithStats[]).map((library) => (
              <Card key={library.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href={`/library/${library.slug}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: library.color || '#3B82F6' }}
                      >
                        {library.icon || '📚'}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {library.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {library._count.repositories} repositórios
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {library.description}
                    </CardDescription>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/explore">Ver Todas as Bibliotecas</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Repositórios Populares */}
      {popularRepositories.length > 0 && (
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Repositórios Populares</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Os repositórios mais curtidos da comunidade
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(popularRepositories as PopularRepository[]).map((repo) => (
              <Card key={repo.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href={`/${repo.owner.username}/${repo.slug}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {repo.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {repo._count.guides}
                      </div>
                    </div>
                    {repo.library && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{repo.library.icon || '📁'}</span>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: repo.library.color || '#3B82F6',
                            color: repo.library.color || '#3B82F6'
                          }}
                        >
                          {repo.library.name}
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">
                      {repo.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>por {repo.owner.name || repo.owner.username}</span>
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{repo.starsCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">Tecnologias Populares</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Inicie sua jornada de programação com nossas trilhas de aprendizado e projetos do mundo real
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['React', 'Node.js', 'Python', 'TypeScript', 'Next.js', 'Git', 'Docker', 'AWS'].map((tech) => (
            <Badge key={tech} variant="secondary" className="text-sm">
              {tech}
            </Badge>
          ))}
        </div>
        <Button asChild>
          <Link href="/dashboard">Explorar Todas as Trilhas</Link>
        </Button>
      </section>
    </div>
  );
}
