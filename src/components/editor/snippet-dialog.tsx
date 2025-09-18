'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Code, List, AlertTriangle, Table, Info, Zap } from 'lucide-react';
import { snippets, snippetCategories, type Snippet } from '@/data/snippets';

interface SnippetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (content: string) => void;
}

const categoryIcons = {
  'Listas': List,
  'Código': Code,
  'Avisos': AlertTriangle,
  'Tabelas': Table,
  'Callouts': Info,
  'API': Zap,
  'Interface': Info,
} as const;

export function SnippetDialog({ open, onOpenChange, onInsert }: SnippetDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [languageInput, setLanguageInput] = useState('');
  const [showLanguagePrompt, setShowLanguagePrompt] = useState(false);
  const [pendingSnippet, setPendingSnippet] = useState<Snippet | null>(null);

  // Filtrar snippets baseado na busca e categoria
  const filteredSnippets = useMemo(() => {
    let filtered = snippets;

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(snippet => snippet.category === selectedCategory);
    }

    // Filtrar por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(snippet => 
        snippet.name.toLowerCase().includes(query) ||
        snippet.description.toLowerCase().includes(query) ||
        snippet.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Agrupar snippets por categoria
  const groupedSnippets = useMemo(() => {
    const groups: Record<string, Snippet[]> = {};
    
    filteredSnippets.forEach(snippet => {
      if (!groups[snippet.category]) {
        groups[snippet.category] = [];
      }
      groups[snippet.category].push(snippet);
    });

    return groups;
  }, [filteredSnippets]);

  // Inserir snippet
  const handleInsertSnippet = (snippet: Snippet) => {
    // Se o snippet tem variáveis (como ${LANG}), mostrar prompt
    if (snippet.variables?.includes('LANG')) {
      setPendingSnippet(snippet);
      setShowLanguagePrompt(true);
      setLanguageInput('typescript'); // default
      return;
    }

    // Inserir diretamente
    onInsert(snippet.content);
    onOpenChange(false);
  };

  // Confirmar inserção com linguagem
  const handleConfirmLanguage = () => {
    if (!pendingSnippet) return;

    const language = languageInput.trim() || 'text';
    const content = pendingSnippet.content.replace('${LANG}', language);
    
    onInsert(content);
    onOpenChange(false);
    
    // Reset
    setShowLanguagePrompt(false);
    setPendingSnippet(null);
    setLanguageInput('');
  };

  // Cancelar prompt de linguagem
  const handleCancelLanguage = () => {
    setShowLanguagePrompt(false);
    setPendingSnippet(null);
    setLanguageInput('');
  };

  // Reset ao fechar
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery('');
      setSelectedCategory('all');
      handleCancelLanguage();
    }
    onOpenChange(open);
  };

  if (showLanguagePrompt && pendingSnippet) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Especificar Linguagem</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Qual linguagem você quer usar no bloco de código?
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="language">Linguagem</Label>
              <Input
                id="language"
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                placeholder="Ex: typescript, javascript, python, bash..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmLanguage();
                  }
                }}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancelLanguage}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmLanguage}>
                Inserir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Inserir Snippet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs por categoria */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="all" className="text-xs">
                Todos
              </TabsTrigger>
              {snippetCategories.map((category) => {
                const Icon = categoryIcons[category] || Info;
                return (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    <Icon className="h-3 w-3 mr-1" />
                    {category}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <ScrollArea className="h-[400px]">
                {selectedCategory === 'all' ? (
                  // Mostrar todos agrupados por categoria
                  <div className="space-y-6">
                    {Object.entries(groupedSnippets).map(([category, categorySnippets]) => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons] || Info;
                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="h-4 w-4" />
                            <h3 className="font-medium text-sm">{category}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {categorySnippets.length}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {categorySnippets.map((snippet) => (
                              <SnippetCard
                                key={snippet.id}
                                snippet={snippet}
                                onSelect={handleInsertSnippet}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Mostrar apenas da categoria selecionada
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredSnippets.map((snippet) => (
                      <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        onSelect={handleInsertSnippet}
                      />
                    ))}
                  </div>
                )}

                {filteredSnippets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum snippet encontrado</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SnippetCardProps {
  snippet: Snippet;
  onSelect: (snippet: Snippet) => void;
}

function SnippetCard({ snippet, onSelect }: SnippetCardProps) {
  const Icon = categoryIcons[snippet.category as keyof typeof categoryIcons] || Info;

  return (
    <div
      className="p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/50"
      onClick={() => onSelect(snippet)}
    >
      <div className="flex items-start gap-2 mb-2">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1">{snippet.name}</h4>
          <p className="text-xs text-muted-foreground">{snippet.description}</p>
        </div>
      </div>
      
      {/* Preview do conteúdo */}
      <div className="mt-2 p-2 bg-muted/30 rounded text-xs font-mono text-muted-foreground border">
        <div className="line-clamp-3">
          {snippet.content.split('\n')[0]}
          {snippet.content.split('\n').length > 1 && '...'}
        </div>
      </div>

      {/* Variáveis se houver */}
      {snippet.variables && snippet.variables.length > 0 && (
        <div className="mt-2 flex gap-1">
          {snippet.variables.map((variable) => (
            <Badge key={variable} variant="outline" className="text-xs">
              ${variable}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
