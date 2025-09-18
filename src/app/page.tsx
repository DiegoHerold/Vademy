import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, GitBranch, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import RepoCard from '@/components/repo-card';

type PopularRepo = {
  id: string
  name: string
  slug: string
  description: string | null
  visibility: 'PUBLIC' | 'PRIVATE'
  starsCount: number
  createdAt: Date
  updatedAt: Date
  owner: {
    username: string
    name: string | null
  }
  _count: {
    pages: number
    stars: number
  }
}

export default async function HomePage() {
  // Buscar repositórios públicos populares
  const popularRepos = await prisma.manualRepo.findMany({
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
          pages: true,
          stars: true
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

      {popularRepos.length > 0 && (
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Repositórios Populares</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore os repositórios mais populares da comunidade
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(popularRepos as PopularRepo[]).map((repo) => (
              <RepoCard
                key={repo.id}
                repo={{
                  ...repo,
                  pagesCount: repo._count.pages,
                  starsCount: repo._count.stars
                }}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/explore">Ver Todos os Repositórios</Link>
            </Button>
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
