'use client'

import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao WhatsApp Professional, {user.email}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Contatos</h3>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Total de contatos</p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Mensagens</h3>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Enviadas hoje</p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Grupos</h3>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Grupos ativos</p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Campanhas</h3>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Campanhas ativas</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Funcionalidades em Desenvolvimento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold">Chat WhatsApp</h3>
              <p className="text-sm text-muted-foreground">Em breve</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold">Sistema de Campanhas</h3>
              <p className="text-sm text-muted-foreground">Em breve</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold">Gerenciamento de Equipes</h3>
              <p className="text-sm text-muted-foreground">Em breve</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold">Configurações Z-API</h3>
              <p className="text-sm text-muted-foreground">Em breve</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
