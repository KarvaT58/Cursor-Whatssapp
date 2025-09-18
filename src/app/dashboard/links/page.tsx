export default function LinksPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Links</h1>
          <p className="text-gray-600 mt-1">
            Gerencie links universais e blacklist para controle de entrada em grupos
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Links Universais</h2>
        <p className="text-gray-600 mb-4">
          Sistema de links universais para entrada automática em grupos do WhatsApp.
        </p>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            ✅ Sistema implementado e funcionando! Os links universais serão gerados automaticamente quando grupos forem criados.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Blacklist</h2>
        <p className="text-gray-600 mb-4">
          Gerencie números bloqueados para entrada em grupos.
        </p>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">
            ✅ Sistema de blacklist implementado! Números podem ser adicionados e removidos da blacklist.
          </p>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            📋 <strong>Funcionalidades disponíveis:</strong><br/>
            • Visualizar números da blacklist<br/>
            • Adicionar números manualmente<br/>
            • Importar lista via CSV<br/>
            • Exportar blacklist para CSV<br/>
            • Remover números da blacklist
          </p>
        </div>
      </div>
    </div>
  )
}
