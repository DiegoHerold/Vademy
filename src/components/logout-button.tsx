'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function LogoutButton() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <Button 
      onClick={handleLogout}
      variant="outline"
      className="text-red-600 border-red-300 hover:bg-red-50"
    >
      Sair
    </Button>
  )
}
