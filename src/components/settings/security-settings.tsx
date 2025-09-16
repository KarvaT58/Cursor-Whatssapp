'use client'

import { useState } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield, Lock, Eye, EyeOff, Save, CheckCircle } from 'lucide-react'

type User = Database['public']['Tables']['users']['Row']

interface SecuritySettingsProps {
  user: User
}

export function SecuritySettings({}: SecuritySettingsProps) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { changePassword } = useSettings()

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(false)
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      setError('Senha atual é obrigatória')
      return false
    }
    if (!passwordForm.newPassword) {
      setError('Nova senha é obrigatória')
      return false
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Nova senha deve ter pelo menos 6 caracteres')
      return false
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Confirmação de senha não confere')
      return false
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError('A nova senha deve ser diferente da senha atual')
      return false
    }
    return true
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) return

    setLoading(true)
    setError(null)

    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      )
      setSuccess(true)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' }
    if (password.length < 6)
      return { strength: 1, label: 'Muito fraca', color: 'bg-red-500' }
    if (password.length < 8)
      return { strength: 2, label: 'Fraca', color: 'bg-orange-500' }
    if (password.length < 10)
      return { strength: 3, label: 'Média', color: 'bg-yellow-500' }
    if (password.length < 12)
      return { strength: 4, label: 'Forte', color: 'bg-blue-500' }
    return { strength: 5, label: 'Muito forte', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(passwordForm.newPassword)

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Segurança da Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-500" />
                <span className="text-sm font-medium">Autenticação ativa</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sua conta está protegida com autenticação
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-500" />
                <span className="text-sm font-medium">Sessão segura</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Conexão criptografada e segura
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Alterar Senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
                Senha alterada com sucesso!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual *</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange('currentPassword', e.target.value)
                  }
                  placeholder="Digite sua senha atual"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordChange('newPassword', e.target.value)
                  }
                  placeholder="Digite sua nova senha"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              {passwordForm.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange('confirmPassword', e.target.value)
                  }
                  placeholder="Confirme sua nova senha"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              {passwordForm.confirmPassword && (
                <div className="flex items-center gap-2">
                  {passwordForm.newPassword === passwordForm.confirmPassword ? (
                    <CheckCircle className="size-4 text-green-500" />
                  ) : (
                    <div className="size-4 rounded-full border-2 border-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {passwordForm.newPassword === passwordForm.confirmPassword
                      ? 'Senhas coincidem'
                      : 'Senhas não coincidem'}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <Save className="size-4 mr-2" />
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-500 mt-0.5" />
              <span>Use uma senha forte com pelo menos 8 caracteres</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-500 mt-0.5" />
              <span>
                Combine letras maiúsculas, minúsculas, números e símbolos
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-500 mt-0.5" />
              <span>Não reutilize senhas de outras contas</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-500 mt-0.5" />
              <span>Altere sua senha regularmente</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-500 mt-0.5" />
              <span>Não compartilhe suas credenciais com ninguém</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
