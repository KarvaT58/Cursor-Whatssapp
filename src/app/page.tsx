'use client'

import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
              <MessageCircle className="size-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            WhatsApp Professional
          </h1>
          <p className="text-muted-foreground">
            Gerencie seu WhatsApp de forma profissional
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-lg">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Bem-vindo!</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Faça login para acessar todas as funcionalidades
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="/login"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center"
              >
                Fazer Login
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Chat em tempo real • Campanhas em massa • Gerenciamento de equipes
          </p>
        </div>
      </div>
    </div>
  )
}
