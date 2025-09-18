import { ReactNode } from 'react';

/**
 * Destaca ocorrências de um termo de busca em um texto
 * @param text Texto onde buscar
 * @param query Termo a ser destacado
 * @returns ReactNode com as ocorrências destacadas em <mark>
 */
export function highlight(text: string, query: string): ReactNode {
  if (!query || !text) {
    return text;
  }

  // Escape caracteres especiais do regex
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Cria regex case-insensitive para busca global
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  // Divide o texto em partes, mantendo os matches
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    // Se a parte corresponde ao termo de busca (case-insensitive)
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark 
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

/**
 * Versão simplificada que retorna apenas o texto com marcações HTML
 * Útil para casos onde não é possível usar ReactNode
 */
export function highlightHtml(text: string, query: string): string {
  if (!query || !text) {
    return text;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>');
}

/**
 * Destaca múltiplos termos de busca
 */
export function highlightMultiple(text: string, queries: string[]): ReactNode {
  if (!queries.length || !text) {
    return text;
  }

  let result: ReactNode = text;
  
  queries.forEach((query, queryIndex) => {
    if (!query) return;
    
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    // Para cada query, aplicamos uma cor diferente
    const colors = [
      'bg-yellow-200 dark:bg-yellow-800',
      'bg-blue-200 dark:bg-blue-800', 
      'bg-green-200 dark:bg-green-800',
      'bg-purple-200 dark:bg-purple-800',
      'bg-pink-200 dark:bg-pink-800'
    ];
    
    const colorClass = colors[queryIndex % colors.length];
    
    if (typeof result === 'string') {
      const parts = result.split(regex);
      result = parts.map((part, index) => {
        if (part.toLowerCase() === query.toLowerCase()) {
          return (
            <mark 
              key={`${queryIndex}-${index}`}
              className={`${colorClass} px-0.5 rounded`}
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    }
  });
  
  return result;
}

/**
 * Trunca texto e destaca termo de busca
 */
export function highlightTruncated(
  text: string, 
  query: string, 
  maxLength: number = 150
): ReactNode {
  if (!text) return '';
  
  // Se não há query, apenas trunca
  if (!query) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const queryIndex = lowerText.indexOf(lowerQuery);
  
  let truncated = text;
  
  // Se encontrou o termo e o texto é longo
  if (queryIndex !== -1 && text.length > maxLength) {
    // Calcula posição ideal para mostrar o termo no centro
    const start = Math.max(0, queryIndex - Math.floor(maxLength / 2));
    const end = Math.min(text.length, start + maxLength);
    
    truncated = text.substring(start, end);
    
    // Adiciona reticências se necessário
    if (start > 0) truncated = '...' + truncated;
    if (end < text.length) truncated = truncated + '...';
  } else if (text.length > maxLength) {
    truncated = text.substring(0, maxLength) + '...';
  }
  
  return highlight(truncated, query);
}
