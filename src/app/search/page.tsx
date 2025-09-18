'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Star, FileText, Calendar, Filter, Loader2, TrendingUp, Clock, Users } from 'lucide-react'
import RepoCard from '@/components/repo-card'
import Link from 'next/link'

interface Repository {
  id: string
  name: string
  slug: string
  description: string | null
  visibility: 'PUBLIC' | 'PRIVATE'
  starsCount: number
  pagesCount: number
  owner: {
    id: string
    username: string
    name: string | null
  }
  createdAt: string
  updatedAt: string
}

interface SearchResult {
  repositories: Repository[]
  pages: Array<{
    id: string
    title: string
    path: string
    repo: {
      id: string
      name: string
      slug: string
      owner: {
        username: string
        name: string | null
      }
    }
    createdAt: string
    updatedAt: string
  }>
  query: string
  totalResults: number
}

interface PublicReposResult {
  repositories: Repository[]
  totalCount: number
  hasMore: boolean
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [publicRepos, setPublicRepos] = useState<PublicReposResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('popular')

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro na busca')
        return
      }

      setResults(data)
    } catch (error) {
      setError('Erro ao realizar busca')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPublicRepos = async (sort = 'popular') => {
    setIsLoadingRepos(true)
    setError('')

    try {
      const response = await fetch(`/api/repos/public?sortBy=${sort}&limit=12`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao carregar repositórios')
        return
      }

      setPublicRepos(data)
    } catch (error) {
      setError('Erro ao carregar repositórios')
    } finally {
      setIsLoadingRepos(false)
    }
  }

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    } else {
      // Carregar repositórios públicos quando não há busca
      loadPublicRepos(sortBy)
    }
  }, [searchParams])

  useEffect(() => {
    if (!searchQuery.trim()) {
      loadPublicRepos(sortBy)
    }
  }, [sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    } else {
      setResults(null)
      loadPublicRepos(sortBy)
    }
  }

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case 'popular':
      case 'stars':
        return <Star className="mr-2 h-4 w-4" />
      case 'recent':
        return <TrendingUp className="mr-2 h-4 w-4" />
      case 'updated':
        return <Clock className="mr-2 h-4 w-4" />
      default:
        return <Star className="mr-2 h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explorar & Descobrir</h1>
        <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
          <form onSubmit={handleSearch} className="flex gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar repositórios, páginas ou tópicos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Buscar
            </Button>
          </form>
          
          {!searchQuery.trim() && (
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    Mais populares
                  </div>
                </SelectItem>
                <SelectItem value="recent">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Mais recentes
                  </div>
                </SelectItem>
                <SelectItem value="updated">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Atualizados
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {results && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            {results.totalResults} resultado(s) encontrado(s) para "{results.query}"
          </p>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="repositories">
            Repositórios {results && `(${results.repositories.length})`}
          </TabsTrigger>
          <TabsTrigger value="pages">
            Páginas {results && `(${results.pages.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {!results && !publicRepos && !isLoading && !isLoadingRepos && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Explore repositórios
              </h3>
              <p className="text-muted-foreground">
                Digite algo no campo de busca ou explore os repositórios populares abaixo
              </p>
            </div>
          )}

          {isLoadingRepos && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carregando repositórios...</p>
            </div>
          )}

          {!results && publicRepos && publicRepos.repositories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  {getSortIcon(sortBy)}
                  {sortBy === 'popular' && 'Repositórios Populares'}
                  {sortBy === 'recent' && 'Repositórios Recentes'}
                  {sortBy === 'updated' && 'Atualizados Recentemente'}
                </h2>
                <Badge variant="secondary">
                  {publicRepos.totalCount} repositórios públicos
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publicRepos.repositories.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={{
                      ...repo,
                      updatedAt: new Date(repo.updatedAt)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {results && results.totalResults === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente usar termos diferentes ou mais gerais
              </p>
            </div>
          )}

          {results && results.repositories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Repositórios</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {results.repositories.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={{
                      ...repo,
                      pagesCount: 0,
                      updatedAt: new Date(repo.updatedAt)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {results && results.pages.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Páginas</h2>
              <div className="space-y-4">
                {results.pages.map((page) => (
                  <Card key={page.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            <Link 
                              href={`/${page.repo.owner.username}/${page.repo.slug}/${page.path}`}
                              className="hover:text-primary transition-colors"
                            >
                              {page.title}
                            </Link>
                          </CardTitle>
                          <CardDescription>
                            Em{' '}
                            <Link 
                              href={`/${page.repo.owner.username}/${page.repo.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {page.repo.owner.username}/{page.repo.name}
                            </Link>
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          Página
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        Atualizado em {new Date(page.updatedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="repositories">
          {isLoadingRepos && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carregando repositórios...</p>
            </div>
          )}

          {results && results.repositories.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.repositories.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={{
                    ...repo,
                    pagesCount: 0,
                    updatedAt: new Date(repo.updatedAt)
                  }}
                />
              ))}
            </div>
          ) : !results && publicRepos && publicRepos.repositories.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  {getSortIcon(sortBy)}
                  {sortBy === 'popular' && 'Repositórios Populares'}
                  {sortBy === 'recent' && 'Repositórios Recentes'}
                  {sortBy === 'updated' && 'Atualizados Recentemente'}
                </h2>
                <Badge variant="secondary">
                  {publicRepos.totalCount} repositórios públicos
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publicRepos.repositories.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={{
                      ...repo,
                      updatedAt: new Date(repo.updatedAt)
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {results ? 'Nenhum repositório encontrado' : 'Nenhum repositório público disponível'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pages">
          {results && results.pages.length > 0 ? (
            <div className="space-y-4">
              {results.pages.map((page) => (
                <Card key={page.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          <Link 
                            href={`/${page.repo.owner.username}/${page.repo.slug}/${page.path}`}
                            className="hover:text-primary transition-colors"
                          >
                            {page.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          Em{' '}
                          <Link 
                            href={`/${page.repo.owner.username}/${page.repo.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {page.repo.owner.username}/{page.repo.name}
                          </Link>
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        <FileText className="mr-1 h-3 w-3" />
                        Página
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      Atualizado em {new Date(page.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma página encontrada
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
