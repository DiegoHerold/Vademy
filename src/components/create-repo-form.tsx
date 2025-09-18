'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GitBranch, Lock, Globe } from 'lucide-react'

const createRepoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC')
})

type CreateRepoForm = z.infer<typeof createRepoSchema>

export default function CreateRepoForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const form = useForm<CreateRepoForm>({
    resolver: zodResolver(createRepoSchema),
    defaultValues: {
      name: '',
      description: '',
      visibility: 'PUBLIC',
    },
  })

  const onSubmit = async (data: CreateRepoForm) => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch('/api/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Erro ao criar repositório')
        return
      }

      // Redirecionar para o repositório criado
      router.push(`/${result.owner.username}/${result.slug}`)
    } catch (error) {
      setError('Erro ao criar repositório')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          <CardTitle>Novo Repositório</CardTitle>
        </div>
        <CardDescription>
          Preencha as informações do seu repositório
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Repositório</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="meu-projeto-incrivel"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Uma breve descrição do seu projeto..."
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibilidade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={isLoading}>
                        <SelectValue placeholder="Selecione a visibilidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PUBLIC">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Público</div>
                            <div className="text-sm text-muted-foreground">
                              Qualquer pessoa pode ver este repositório
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="PRIVATE">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Privado</div>
                            <div className="text-sm text-muted-foreground">
                              Apenas você pode ver este repositório
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Criando...' : 'Criar Repositório'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
