import { Suspense } from 'react'
import { TeamOverview } from '@/components/teams/team-overview'
import { TeamSettings } from '@/components/teams/team-settings'
import { TeamMembers } from '@/components/teams/team-members'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

export default function TeamsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Equipes</h1>
        <p className="text-muted-foreground">
          Gerencie sua equipe e colaboradores
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-muted-foreground">Carregando...</div>
            </CardContent>
          </Card>
        }
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <TeamOverview />
          </TabsContent>

          <TabsContent value="members">
            <TeamMembers />
          </TabsContent>

          <TabsContent value="settings">
            <TeamSettings />
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  )
}
