import { HealthDashboard } from '@/components/monitoring/health-dashboard'
import { MetricsDashboard } from '@/components/monitoring/metrics-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MonitoringPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <p className="text-gray-600 mt-2">
          Monitor system health, performance metrics, and business analytics
        </p>
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList>
          <TabsTrigger value="health">Health Status</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <HealthDashboard />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <MetricsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
