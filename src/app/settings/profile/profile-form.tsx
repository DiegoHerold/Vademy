'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { updateProfileAction } from './actions'

type ActionErrors = {
  name?: string[]
  username?: string[]
  image?: string[]
  _form?: string[]
}

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    username: string
    email: string
    image: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<ActionErrors>({})

  const getInitials = (name: string | null, username: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return username.slice(0, 2).toUpperCase()
  }

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      setErrors({})
      
      const result = await updateProfileAction(formData)
      
      if (result.success) {
        toast.success(result.message)
        router.refresh()
        // Opcional: redirecionar para o perfil público
        // router.push(`/u/${formData.get('username')}`)
      } else {
        const errors = result.errors || {}
        setErrors(errors)
        if ('_form' in errors && errors._form) {
          toast.error(errors._form[0])
        }
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>
          Atualize suas informações de perfil. Seu username será usado na URL do seu perfil público.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {/* Preview do Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || undefined} alt={user.name || user.username} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name, user.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Foto do Perfil</p>
              <p className="text-xs text-muted-foreground">
                Use uma URL de imagem para definir sua foto de perfil
              </p>
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name || ''}
              placeholder="Seu nome completo"
              className={errors.name ? 'border-destructive focus:ring-destructive' : ''}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name[0]}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              defaultValue={user.username}
              placeholder="seu-username"
              className={errors.username ? 'border-destructive focus:ring-destructive' : ''}
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            {errors.username && (
              <p id="username-error" className="text-sm text-destructive">
                {errors.username[0]}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Seu perfil público estará disponível em: /u/{user.username}
            </p>
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado por aqui
            </p>
          </div>

          {/* URL da Imagem */}
          <div className="space-y-2">
            <Label htmlFor="image">URL da Imagem</Label>
            <Input
              id="image"
              name="image"
              type="url"
              defaultValue={user.image || ''}
              placeholder="https://exemplo.com/sua-foto.jpg"
              className={errors.image ? 'border-destructive focus:ring-destructive' : ''}
              aria-describedby={errors.image ? 'image-error' : undefined}
            />
            {errors.image && (
              <p id="image-error" className="text-sm text-destructive">
                {errors.image[0]}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar as iniciais do seu nome
            </p>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isPending}
              className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
