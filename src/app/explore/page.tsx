'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Star, TrendingUp, Clock, Loader2, Users, BookOpen } from 'lucide-react'
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

interface PublicReposResult {
  repositories: Repository[]
  totalCount: number
  hasMore: boolean
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [publicRepos, setPublicRepos] = useState<PublicReposResult | null>(null)
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('popular')

  const loadPublicRepos = async (sort = 'popular') => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/repos/public?sortBy=${sort}&limit=24`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao carregar repositórios')
        return
      }

      setPublicRepos(data)
      setFilteredRepos(data.repositories)
    } catch (error) {
      setError('Erro ao carregar repositórios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPublicRepos(sortBy)
  }, [sortBy])

  useEffect(() => {
    if (!publicRepos) return

    if (!searchQuery.trim()) {
      setFilteredRepos(publicRepos.repositories)
      return
    }

    const filtered = publicRepos.repositories.filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredRepos(filtered)
  }, [searchQuery, publicRepos])

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

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'popular':
        return 'Mais Populares'
      case 'recent':
        return 'Mais Recentes'
      case 'updated':
        return 'Atualizados Recentemente'
      default:
        return 'Mais Populares'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <BookOpen className="mr-3 h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Explorar Repositórios</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-6">
          Descubra guias, tutoriais e documentações criados pela comunidade
        </p>

        {/* Filtros e busca */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por nome, descrição ou autor..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
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
        </div>
      </div>

      {/* Estatísticas */}
      {publicRepos && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold flex items-center">
              {getSortIcon(sortBy)}
              {getSortLabel(sortBy)}
            </h2>
            {searchQuery && (
              <Badge variant="outline">
                {filteredRepos.length} de {publicRepos.repositories.length} repositórios
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="flex items-center">
            <Users className="mr-1 h-3 w-3" />
            {publicRepos.totalCount} repositórios públicos
          </Badge>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="mb-6 p-4 text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Carregando repositórios...</p>
        </div>
      )}

      {/* Repositórios */}
      {!isLoading && filteredRepos.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={{
                ...repo,
                updatedAt: new Date(repo.updatedAt)
              }}
            />
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {!isLoading && filteredRepos.length === 0 && publicRepos && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? 'Nenhum repositório encontrado' : 'Nenhum repositório disponível'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'Tente usar termos diferentes ou mais gerais'
              : 'Seja o primeiro a criar um repositório público!'
            }
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Limpar filtro
            </Button>
          )}
        </div>
      )}

      {/* Call to action */}
      {!isLoading && publicRepos && publicRepos.repositories.length > 0 && (
        <div className="text-center mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-2">Não encontrou o que procurava?</h3>
          <p className="text-muted-foreground mb-4">
            Crie seu próprio repositório e compartilhe conhecimento com a comunidade
          </p>
          <Button asChild>
            <Link href="/new">Criar Repositório</Link>
          </Button>
        </div>
      )}
    </div>
  )
}