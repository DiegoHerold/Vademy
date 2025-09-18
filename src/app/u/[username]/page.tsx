import { redirect } from 'next/navigation'

interface OldProfilePageProps {
  params: {
    username: string
  }
}

export default async function OldProfileRedirect({ params }: OldProfilePageProps) {
  // Redireciona para o novo caminho
  redirect(`/profile/${params.username}`)
}