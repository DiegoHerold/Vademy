export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

export interface CheckboxStats {
  total: number;
  done: number;
}

/**
 * Extrai headings H2 e H3 do markdown e gera IDs únicos
 */
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);
    
    if (h2Match) {
      const text = h2Match[1].trim();
      headings.push({
        level: 2,
        text,
        id: slugify(text)
      });
    } else if (h3Match) {
      const text = h3Match[1].trim();
      headings.push({
        level: 3,
        text,
        id: slugify(text)
      });
    }
  }
  
  return headings;
}

/**
 * Conta checkboxes marcados e total no markdown
 */
export function countCheckboxes(markdown: string): CheckboxStats {
  const checkboxRegex = /- \[([ x])\]/gi;
  const matches = markdown.match(checkboxRegex) || [];
  
  const total = matches.length;
  const done = matches.filter(match => match.includes('[x]') || match.includes('[X]')).length;
  
  return { total, done };
}

/**
 * Extrai o primeiro parágrafo do markdown (ignora frontmatter e headings)
 */
export function firstParagraph(markdown: string): string {
  // Remove frontmatter se existir
  let content = markdown.replace(/^---[\s\S]*?---\n?/, '');
  
  // Divide em linhas
  const lines = content.split('\n');
  
  // Encontra a primeira linha que não é heading, lista ou vazia
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Pula linhas vazias, headings, listas, blockquotes, código
    if (!trimmed || 
        trimmed.startsWith('#') || 
        trimmed.startsWith('-') || 
        trimmed.startsWith('*') || 
        trimmed.startsWith('>') ||
        trimmed.startsWith('```') ||
        /^\d+\./.test(trimmed)) {
      continue;
    }
    
    // Retorna o primeiro parágrafo encontrado (limitado a 150 chars)
    return trimmed.length > 150 ? trimmed.substring(0, 150) + '...' : trimmed;
  }
  
  return '';
}

/**
 * Conta palavras no markdown (aproximado)
 */
export function countWords(markdown: string): number {
  // Remove frontmatter, código e markdown syntax básico
  const cleanText = markdown
    .replace(/^---[\s\S]*?---\n?/, '') // frontmatter
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]+`/g, '') // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[#*_~`]/g, '') // markdown syntax
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();
  
  if (!cleanText) return 0;
  
  return cleanText.split(/\s+/).length;
}

/**
 * Conta blocos de código no markdown
 */
export function countCodeBlocks(markdown: string): number {
  const codeBlockRegex = /```[\s\S]*?```/g;
  const matches = markdown.match(codeBlockRegex) || [];
  return matches.length;
}

/**
 * Verifica se há linhas muito longas (> 300 caracteres)
 */
export function hasLongLines(markdown: string): boolean {
  const lines = markdown.split('\n');
  return lines.some(line => line.length > 300);
}

/**
 * Gera slug a partir de texto (reutiliza função existente se disponível)
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove caracteres especiais
    .replace(/[\s_-]+/g, '-') // substitui espaços e underscores por hífens
    .replace(/^-+|-+$/g, ''); // remove hífens do início e fim
}

/**
 * Extrai metadados do frontmatter
 */
export function extractFrontmatter(markdown: string): { [key: string]: string } | null {
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) return null;
  
  const frontmatterContent = frontmatterMatch[1];
  const metadata: { [key: string]: string } = {};
  
  const lines = frontmatterContent.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      metadata[match[1]] = match[2].replace(/^["']|["']$/g, ''); // remove quotes
    }
  }
  
  return metadata;
}

/**
 * Remove frontmatter do markdown
 */
export function removeFrontmatter(markdown: string): string {
  return markdown.replace(/^---[\s\S]*?---\n?/, '');
}
