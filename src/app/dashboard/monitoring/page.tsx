import { GroupMonitorControl } from '@/components/monitoring/group-monitor-control'

export default function MonitoringPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Monitor de Grupos</h1>
        <p className="text-gray-600 mt-2">
          Sistema de monitoramento e proteção de grupos WhatsApp
        </p>
      </div>

      <div className="space-y-6">
        <GroupMonitorControl />
      </div>
    </div>
  )
}
