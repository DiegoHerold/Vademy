'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, X } from 'lucide-react';
import { MarkdownEditor } from './markdown-editor';
import { DocQualityPanel } from '@/components/repo/doc-quality-panel';

interface EditPageClientProps {
  owner: string;
  repo: string;
  filePath: string;
  fileName: string;
  repoId?: string;
}

export function EditPageClient({ 
  owner, 
  repo, 
  filePath, 
  fileName,
  repoId 
}: EditPageClientProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState(fileName);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar conteúdo da página se existir
  useEffect(() => {
    const loadPage = async () => {
      if (!repoId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/pages?repoId=${repoId}&path=${encodeURIComponent(filePath)}`);
        
        if (response.ok) {
          const page = await response.json();
          setContent(page.contentMd || '');
          setTitle(page.title || fileName);
        } else {
          // Página não existe, usar template padrão
          setContent(`# ${fileName}

Conteúdo da página aqui...

## Seção 1

Adicione seu conteúdo aqui.

## Seção 2

Mais conteúdo...
`);
        }
      } catch (error) {
        console.error('Erro ao carregar página:', error);
        toast.error('Erro ao carregar página');
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [repoId, filePath, fileName]);

  // Salvar página
  const handleSave = async () => {
    if (!repoId) {
      toast.error('ID do repositório não encontrado');
      return;
    }

    setIsSaving(true);
    try {
      // Verificar se página já existe
      const checkResponse = await fetch(`/api/pages?repoId=${repoId}&path=${encodeURIComponent(filePath)}`);
      const pageExists = checkResponse.ok;

      let response;
      
      if (pageExists) {
        // Atualizar página existente
        const existingPage = await checkResponse.json();
        response = await fetch(`/api/pages/${existingPage.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            contentMd: content,
          }),
        });
      } else {
        // Criar nova página
        response = await fetch('/api/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repoId,
            title: title.trim(),
            path: filePath,
            contentMd: content,
            order: 1,
          }),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar página');
      }

      toast.success('Página salva com sucesso!');
      router.push(`/${owner}/${repo}?path=${encodeURIComponent(filePath)}`);
      
    } catch (error) {
      console.error('Erro ao salvar página:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar página');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    router.push(`/${owner}/${repo}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="space-y-2">
              <label htmlFor="page-title" className="text-sm font-medium">
                Título da Página
              </label>
              <Input
                id="page-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="max-w-md"
                placeholder="Título da página"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Editor e painel de qualidade */}
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  repoId={repoId}
                  owner={owner}
                  repoName={repo}
                  showTemplateButton={false}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <DocQualityPanel 
              contentMd={content}
              className="sticky top-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
