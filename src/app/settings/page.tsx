import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Shield, Bell, Palette } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const settingsOptions = [
    {
      title: 'Perfil',
      description: 'Gerencie suas informações pessoais e como outros usuários te veem',
      icon: User,
      href: '/settings/profile',
      available: true
    },
    {
      title: 'Conta e Segurança',
      description: 'Altere sua senha, configure autenticação de dois fatores',
      icon: Shield,
      href: '/settings/security',
      available: false
    },
    {
      title: 'Notificações',
      description: 'Configure como e quando você quer receber notificações',
      icon: Bell,
      href: '/settings/notifications',
      available: false
    },
    {
      title: 'Aparência',
      description: 'Personalize a aparência da interface',
      icon: Palette,
      href: '/settings/appearance',
      available: false
    }
  ]

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas preferências e configurações da conta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsOptions.map((option) => {
          const Icon = option.icon
          
          return (
            <Card key={option.href} className={!option.available ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {option.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {option.available ? (
                  <Button asChild className="w-full">
                    <Link href={option.href}>
                      Configurar
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Em breve
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Configurações - Vademy',
  description: 'Gerencie suas preferências e configurações da conta'
}
