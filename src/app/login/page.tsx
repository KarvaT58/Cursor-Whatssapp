import { MessageCircle } from 'lucide-react'

import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <MessageCircle className="size-4" />
            </div>
            WhatsApp Professional
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <MessageCircle className="size-24 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">
              Gerencie seu WhatsApp Profissional
            </h2>
            <p className="text-green-100">
              Chat em tempo real, campanhas em massa, gerenciamento de equipes e
              muito mais.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
