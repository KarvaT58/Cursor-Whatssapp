import { TeamsPageContent } from '@/components/teams/teams-page-content'

export default function TeamsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Equipes</h1>
        <p className="text-muted-foreground">
          Gerencie sua equipe e colaboradores
        </p>
      </div>

      <TeamsPageContent />
    </div>
  )
}
