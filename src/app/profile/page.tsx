import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function MyProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.username) {
    redirect('/auth/signin')
  }

  // Redireciona para o perfil público do usuário logado
  redirect(`/profile/${session.user.username}`)
}
