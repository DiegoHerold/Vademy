'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, FileText, Sparkles, Plus, X, Check, Layers } from 'lucide-react';
import { docTemplates, type DocTemplate } from '@/data/doc-templates';
import { firstParagraph } from '@/lib/markdown-utils';

interface NewPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoId: string;
  owner: string;
  repoName: string;
}

interface PageToCreate {
  id: string;
  title: string;
  path: string;
  order: number;
  template: DocTemplate;
}

export function NewPageDialog({
  open,
  onOpenChange,
  repoId,
  owner,
  repoName
}: NewPageDialogProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('single');
  
  // Single page creation
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [order, setOrder] = useState('1');
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null);
  
  // Multiple pages creation
  const [pagesToCreate, setPagesToCreate] = useState<PageToCreate[]>([]);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageTemplate, setNewPageTemplate] = useState<DocTemplate | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Filtrar templates baseado na busca
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return docTemplates;
    
    const query = searchQuery.toLowerCase();
    return docTemplates.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Gerar path sugerido baseado no título
  const generatePath = (title: string) => {
    if (!title) return '';
    
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return `${slug}.md`;
  };

  // Atualizar path quando título muda
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    
    // Se path ainda não foi editado manualmente, atualizar automaticamente
    if (!path || path === generatePath(title)) {
      setPath(generatePath(newTitle));
    }
  };

  // Selecionar template para página única
  const handleTemplateSelect = (template: DocTemplate) => {
    setSelectedTemplate(template);
    
    // Se título vazio, usar nome do template
    if (!title) {
      const templateTitle = template.name;
      setTitle(templateTitle);
      setPath(template.suggestedPath);
    }
  };

  // Adicionar página à lista de múltiplas páginas
  const addPageToList = () => {
    if (!newPageTitle.trim() || !newPageTemplate) {
      toast.error('Preencha o título e selecione um template');
      return;
    }

    const newPage: PageToCreate = {
      id: Date.now().toString(),
      title: newPageTitle.trim(),
      path: generatePath(newPageTitle.trim()),
      order: pagesToCreate.length + 1,
      template: newPageTemplate
    };

    setPagesToCreate([...pagesToCreate, newPage]);
    setNewPageTitle('');
    setNewPageTemplate(null);
  };

  // Remover página da lista
  const removePageFromList = (id: string) => {
    setPagesToCreate(pagesToCreate.filter(page => page.id !== id));
  };

  // Selecionar template para nova página múltipla
  const handleMultipleTemplateSelect = (template: DocTemplate) => {
    setNewPageTemplate(template);
    
    if (!newPageTitle) {
      setNewPageTitle(template.name);
    }
  };

  // Validar formulário
  const isFormValid = () => {
    if (activeTab === 'single') {
      return title.trim().length > 0 && 
             path.trim().length > 0 && 
             selectedTemplate !== null &&
             !isCreating;
    } else {
      return pagesToCreate.length > 0 && !isCreating;
    }
  };

  // Criar página única
  const createSinglePage = async () => {
    const response = await fetch('/api/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repoId,
        title: title.trim(),
        path: path.trim(),
        contentMd: selectedTemplate!.content,
        order: parseInt(order) || 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar página');
    }

    return await response.json();
  };

  // Criar múltiplas páginas
  const createMultiplePages = async () => {
    const createdPages = [];
    
    for (const page of pagesToCreate) {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoId,
          title: page.title,
          path: page.path,
          contentMd: page.template.content,
          order: page.order,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao criar página "${page.title}": ${errorData.message}`);
      }

      const createdPage = await response.json();
      createdPages.push(createdPage);
    }

    return createdPages;
  };

  // Criar página(s)
  const handleCreate = async () => {
    if (activeTab === 'single') {
      // Validações para página única
      if (!title.trim()) {
        toast.error('Por favor, insira um título para a página');
        return;
      }

      if (title.trim().length < 2) {
        toast.error('O título deve ter pelo menos 2 caracteres');
        return;
      }

      if (!path.trim()) {
        toast.error('Por favor, insira um caminho para o arquivo');
        return;
      }

      if (!path.trim().endsWith('.md')) {
        toast.error('O caminho deve terminar com .md');
        return;
      }

      if (!selectedTemplate) {
        toast.error('Por favor, selecione um template');
        return;
      }
    } else {
      // Validações para múltiplas páginas
      if (pagesToCreate.length === 0) {
        toast.error('Adicione pelo menos uma página à lista');
        return;
      }
    }

    setIsCreating(true);

    try {
      if (activeTab === 'single') {
        const page = await createSinglePage();
        toast.success('Página criada com sucesso!');
        
        // Reset form
        resetForm();
        
        // Fechar dialog
        onOpenChange(false);
        
        // Redirect para a nova página
        window.location.href = `/${owner}/${repoName}?path=${encodeURIComponent(page.path)}`;
      } else {
        const pages = await createMultiplePages();
        toast.success(`${pages.length} páginas criadas com sucesso!`);
        
        // Reset form
        resetForm();
        
        // Fechar dialog
        onOpenChange(false);
        
        // Refresh da página
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Erro ao criar página(s):', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar página(s)');
    } finally {
      setIsCreating(false);
    }
  };

  // Reset do formulário
  const resetForm = () => {
    setTitle('');
    setPath('');
    setOrder('1');
    setSelectedTemplate(null);
    setPagesToCreate([]);
    setNewPageTitle('');
    setNewPageTemplate(null);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col overflow-hidden p-0">
        {/* Header compacto */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Criar Páginas</h2>
                  <p className="text-xs text-muted-foreground">
                    Crie páginas com templates
                  </p>
                </div>
              </div>
              {isCreating && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  Criando...
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 p-4 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="single" className="flex items-center gap-1 text-sm">
                <FileText className="h-3 w-3" />
                Uma Página
              </TabsTrigger>
              <TabsTrigger value="multiple" className="flex items-center gap-1 text-sm">
                <Layers className="h-3 w-3" />
                Múltiplas
                {pagesToCreate.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {pagesToCreate.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0">
              <TabsContent value="single" className="h-full mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                  {/* Formulário da página única */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Detalhes da Página</CardTitle>
                      <CardDescription className="text-sm">
                        Preencha as informações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                          Título da Página *
                        </Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="Ex: Getting Started"
                          className={`${
                            title.trim().length > 0 && title.trim().length < 2 
                              ? 'border-red-500 focus:border-red-500' 
                              : ''
                          }`}
                          disabled={isCreating}
                        />
                        {title.trim().length > 0 && title.trim().length < 2 && (
                          <p className="text-xs text-red-500">Título deve ter pelo menos 2 caracteres</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="path" className="text-sm font-medium">
                          Caminho do Arquivo *
                        </Label>
                        <Input
                          id="path"
                          value={path}
                          onChange={(e) => setPath(e.target.value)}
                          placeholder="Ex: docs/getting-started.md"
                          className={`${
                            path.trim().length > 0 && !path.trim().endsWith('.md')
                              ? 'border-red-500 focus:border-red-500' 
                              : ''
                          }`}
                          disabled={isCreating}
                        />
                        {path.trim().length > 0 && !path.trim().endsWith('.md') && (
                          <p className="text-xs text-red-500">Caminho deve terminar com .md</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="order" className="text-sm font-medium">
                          Ordem na Navegação
                        </Label>
                        <Input
                          id="order"
                          type="number"
                          value={order}
                          onChange={(e) => setOrder(e.target.value)}
                          placeholder="1"
                          min="1"
                          disabled={isCreating}
                          className="w-24"
                        />
                      </div>

                      {/* Preview compacto do template selecionado */}
                      {selectedTemplate && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Template</Label>
                          <div className="border rounded p-2 bg-primary/5">
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3 text-primary" />
                              <span className="font-medium text-xs">{selectedTemplate.name}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Seleção de templates */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Templates</CardTitle>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input
                          placeholder="Buscar..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 h-8 text-sm"
                          disabled={isCreating}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
                      <ScrollArea className="flex-1 max-h-64">
                        <div className="space-y-1">
                          {filteredTemplates.map((template) => (
                            <div
                              key={template.id}
                              className={`p-2 border rounded cursor-pointer transition-all hover:shadow-sm ${
                                selectedTemplate?.id === template.id
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                  : 'border-border hover:border-primary/30 hover:bg-muted/30'
                              } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => !isCreating && handleTemplateSelect(template)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-medium text-xs mb-1 ${
                                    selectedTemplate?.id === template.id ? 'text-primary' : ''
                                  }`}>
                                    {template.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                                    {template.description}
                                  </p>
                                  <Badge 
                                    variant={selectedTemplate?.id === template.id ? "default" : "outline"} 
                                    className="text-xs"
                                  >
                                    {template.suggestedPath}
                                  </Badge>
                                </div>
                                {selectedTemplate?.id === template.id && (
                                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <Check className="h-2 w-2 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="multiple" className="h-full mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                  {/* Adicionar nova página */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Adicionar Página</CardTitle>
                      <CardDescription className="text-sm">
                        Adicione à lista para criar todas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="newPageTitle" className="text-sm font-medium">
                          Título da Página *
                        </Label>
                        <Input
                          id="newPageTitle"
                          value={newPageTitle}
                          onChange={(e) => setNewPageTitle(e.target.value)}
                          placeholder="Ex: API Reference"
                          disabled={isCreating}
                        />
                      </div>

                      {/* Template selecionado para nova página */}
                      {newPageTemplate && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Template</Label>
                          <div className="border rounded p-2 bg-primary/5">
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3 text-primary" />
                              <span className="font-medium text-xs">{newPageTemplate.name}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={addPageToList}
                        disabled={!newPageTitle.trim() || !newPageTemplate || isCreating}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar à Lista
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Lista de páginas e templates */}
                  <div className="space-y-4">
                    {/* Lista de páginas adicionadas */}
                    {pagesToCreate.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            Lista
                            <Badge variant="secondary" className="text-xs">{pagesToCreate.length}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ScrollArea className="max-h-32">
                            <div className="space-y-1">
                              {pagesToCreate.map((page) => (
                                <div key={page.id} className="flex items-center justify-between p-2 border rounded bg-muted/30">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs truncate">{page.title}</p>
                                    <p className="text-xs text-muted-foreground">{page.template.name}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePageFromList(page.id)}
                                    disabled={isCreating}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}

                    {/* Seleção de templates para múltiplas páginas */}
                    <Card className="flex-1">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Templates</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ScrollArea className="h-48">
                          <div className="space-y-1">
                            {filteredTemplates.map((template) => (
                              <div
                                key={template.id}
                                className={`p-2 border rounded cursor-pointer transition-all hover:shadow-sm ${
                                  newPageTemplate?.id === template.id
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                    : 'border-border hover:border-primary/30 hover:bg-muted/30'
                                } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !isCreating && handleMultipleTemplateSelect(template)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium text-xs mb-1 ${
                                      newPageTemplate?.id === template.id ? 'text-primary' : ''
                                    }`}>
                                      {template.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {template.description}
                                    </p>
                                  </div>
                                  {newPageTemplate?.id === template.id && (
                                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                      <Check className="h-2 w-2 text-white" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer compacto com botões */}
        <div className="border-t bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {activeTab === 'single' ? (
                selectedTemplate ? 'Template selecionado' : 'Selecione um template'
              ) : (
                `${pagesToCreate.length} página${pagesToCreate.length !== 1 ? 's' : ''}`
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
                size="sm"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={!isFormValid()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                size="sm"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-2" />
                    {activeTab === 'single' ? 'Criar' : `Criar ${pagesToCreate.length}`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
