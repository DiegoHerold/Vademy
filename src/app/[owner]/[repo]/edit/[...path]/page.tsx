import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canEditRepo } from '@/lib/permissions'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge';
import { Code } from 'lucide-react';
import { EditPageClient } from '@/components/editor/edit-page-client';
import { PageBreadcrumb } from '@/components/navigation/page-breadcrumb';

interface EditPageProps {
  params: {
    owner: string;
    repo: string;
    path: string[];
  };
}

export default async function EditPage({ params }: EditPageProps) {
  const { owner, repo, path } = params;
  const filePath = path.join('/');
  const fileName = path[path.length - 1] || 'README.md';

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
      }
    }
  })

  if (!repository) {
    notFound()
  }

  // Verificar se o usuário pode editar o repositório
  if (!canEditRepo(repository, session)) {
    notFound()
  }

  // Criar breadcrumb para edição
  const breadcrumbItems = [
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
    },
    {
      type: 'page' as const,
      label: fileName,
      href: `/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(filePath)}`,
      badge: filePath === 'README.md' ? 'README' : undefined,
    },
    {
      type: 'edit' as const,
      label: 'Editando',
      isActive: true,
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
                <Badge variant="outline">
                  <Code className="mr-1 h-3 w-3" />
                  {fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() : 'TEXT'}
                </Badge>
              </div>
            }
          />
        </div>
      </div>

      {/* Editor Client Component */}
      <EditPageClient
        owner={repository.owner.username}
        repo={repository.slug}
        filePath={filePath}
        fileName={fileName}
        repoId={repository.id}
      />
    </div>
  );
}