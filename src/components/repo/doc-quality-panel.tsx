'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  FileText, 
  Hash, 
  CheckSquare, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  Code,
  List
} from 'lucide-react';
import { 
  extractHeadings, 
  countCheckboxes, 
  countWords, 
  countCodeBlocks, 
  hasLongLines,
  type Heading 
} from '@/lib/markdown-utils';

interface DocQualityPanelProps {
  contentMd: string;
  className?: string;
}

interface QualityMetric {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'default' | 'success' | 'warning' | 'error';
}

interface QualityWarning {
  type: 'error' | 'warning' | 'info';
  message: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DocQualityPanel({ contentMd, className }: DocQualityPanelProps) {
  // Calcular métricas
  const metrics = useMemo(() => {
    const headings = extractHeadings(contentMd);
    const checkboxes = countCheckboxes(contentMd);
    const wordCount = countWords(contentMd);
    const codeBlocks = countCodeBlocks(contentMd);

    const qualityMetrics: QualityMetric[] = [
      {
        label: 'Palavras',
        value: wordCount,
        icon: FileText,
        color: wordCount > 100 ? 'success' : wordCount > 50 ? 'warning' : 'error'
      },
      {
        label: 'Headings',
        value: `${headings.filter(h => h.level === 2).length}H2 + ${headings.filter(h => h.level === 3).length}H3`,
        icon: Hash,
        color: headings.length > 0 ? 'success' : 'error'
      },
      {
        label: 'Checklists',
        value: checkboxes.total > 0 ? `${checkboxes.done}/${checkboxes.total}` : '0',
        icon: CheckSquare,
        color: checkboxes.total > 0 ? 'success' : 'default'
      },
      {
        label: 'Código',
        value: `${codeBlocks} blocos`,
        icon: Code,
        color: codeBlocks > 0 ? 'success' : 'warning'
      }
    ];

    return { qualityMetrics, headings, checkboxes, wordCount, codeBlocks };
  }, [contentMd]);

  // Calcular avisos de qualidade
  const warnings = useMemo(() => {
    const warnings: QualityWarning[] = [];
    const { headings, codeBlocks } = metrics;

    // Sem headings H2
    if (headings.filter(h => h.level === 2).length === 0) {
      warnings.push({
        type: 'warning',
        message: 'Documento sem headings H2 para estruturação',
        icon: Hash
      });
    }

    // Linhas muito longas
    if (hasLongLines(contentMd)) {
      warnings.push({
        type: 'warning',
        message: 'Algumas linhas são muito longas (>300 caracteres)',
        icon: Eye
      });
    }

    // Poucos exemplos de código
    if (codeBlocks === 0) {
      warnings.push({
        type: 'info',
        message: 'Considere adicionar exemplos de código',
        icon: Code
      });
    }

    // Documento muito curto
    if (metrics.wordCount < 50) {
      warnings.push({
        type: 'warning',
        message: 'Documento muito curto, considere expandir o conteúdo',
        icon: FileText
      });
    }

    // Documento muito longo sem estrutura
    if (metrics.wordCount > 1000 && headings.length < 3) {
      warnings.push({
        type: 'warning',
        message: 'Documento longo precisa de mais estruturação com headings',
        icon: Hash
      });
    }

    return warnings;
  }, [contentMd, metrics]);

  // Calcular score de qualidade
  const qualityScore = useMemo(() => {
    let score = 0;
    const maxScore = 100;

    // Pontuação por palavras (0-25 pontos)
    if (metrics.wordCount > 200) score += 25;
    else if (metrics.wordCount > 100) score += 20;
    else if (metrics.wordCount > 50) score += 15;
    else if (metrics.wordCount > 20) score += 10;

    // Pontuação por estrutura (0-25 pontos)
    const h2Count = metrics.headings.filter(h => h.level === 2).length;
    const h3Count = metrics.headings.filter(h => h.level === 3).length;
    if (h2Count >= 3 && h3Count >= 2) score += 25;
    else if (h2Count >= 2) score += 20;
    else if (h2Count >= 1) score += 15;

    // Pontuação por exemplos de código (0-20 pontos)
    if (metrics.codeBlocks >= 3) score += 20;
    else if (metrics.codeBlocks >= 2) score += 15;
    else if (metrics.codeBlocks >= 1) score += 10;

    // Pontuação por checklists (0-15 pontos)
    if (metrics.checkboxes.total > 0) score += 15;

    // Penalização por avisos (0-15 pontos)
    const errorCount = warnings.filter(w => w.type === 'error').length;
    const warningCount = warnings.filter(w => w.type === 'warning').length;
    score += Math.max(0, 15 - (errorCount * 5) - (warningCount * 2));

    return Math.min(score, maxScore);
  }, [metrics, warnings]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className={className}>
      {/* Desktop: Cards separados */}
      <div className="hidden lg:block space-y-4">
        {/* Score de Qualidade */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Qualidade do Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className={`font-bold ${getScoreColor(qualityScore)}`}>
                  {qualityScore}/100
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${qualityScore}%` }}
                />
              </div>
              <div className={`text-xs p-2 rounded ${getScoreBgColor(qualityScore)}`}>
                {qualityScore >= 80 ? '✅ Excelente qualidade' :
                 qualityScore >= 60 ? '⚠️ Boa qualidade, pode melhorar' :
                 '❌ Precisa de melhorias'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Métricas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.qualityMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{metric.label}</span>
                    </div>
                    <Badge variant={metric.color === 'error' ? 'destructive' : 'secondary'}>
                      {metric.value}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* TOC */}
        {metrics.headings.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <List className="h-4 w-4" />
                Índice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {metrics.headings.map((heading, index) => (
                  <a
                    key={index}
                    href={`#${heading.id}`}
                    className={`block text-sm hover:text-primary transition-colors ${
                      heading.level === 2 ? 'font-medium' : 'text-muted-foreground ml-3'
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avisos */}
        {warnings.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Sugestões de Melhoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {warnings.map((warning, index) => {
                  const Icon = warning.icon;
                  return (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Icon className={`h-3 w-3 mt-0.5 ${
                        warning.type === 'error' ? 'text-red-500' :
                        warning.type === 'warning' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <span className="text-muted-foreground">{warning.message}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile: Accordion */}
      <div className="lg:hidden">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="quality">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Qualidade ({qualityScore}/100)
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Score */}
                <div className="space-y-2">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${qualityScore}%` }}
                    />
                  </div>
                  <div className={`text-xs p-2 rounded ${getScoreBgColor(qualityScore)}`}>
                    {qualityScore >= 80 ? '✅ Excelente qualidade' :
                     qualityScore >= 60 ? '⚠️ Boa qualidade, pode melhorar' :
                     '❌ Precisa de melhorias'}
                  </div>
                </div>

                {/* Métricas */}
                <div className="space-y-2">
                  {metrics.qualityMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{metric.label}</span>
                        </div>
                        <Badge variant={metric.color === 'error' ? 'destructive' : 'secondary'}>
                          {metric.value}
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                {/* TOC */}
                {metrics.headings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Índice</h4>
                    <div className="space-y-1">
                      {metrics.headings.map((heading, index) => (
                        <a
                          key={index}
                          href={`#${heading.id}`}
                          className={`block text-sm hover:text-primary transition-colors ${
                            heading.level === 2 ? 'font-medium' : 'text-muted-foreground ml-3'
                          }`}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Avisos */}
                {warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Sugestões</h4>
                    <div className="space-y-2">
                      {warnings.map((warning, index) => {
                        const Icon = warning.icon;
                        return (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Icon className={`h-3 w-3 mt-0.5 ${
                              warning.type === 'error' ? 'text-red-500' :
                              warning.type === 'warning' ? 'text-yellow-500' :
                              'text-blue-500'
                            }`} />
                            <span className="text-muted-foreground">{warning.message}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
