'use client'

import { useState } from 'react'

interface ImportResult {
  imported: number
  updated: number
  skipped: number
  errors: Array<{
    index: number
    error: string
    contact: Record<string, unknown>
  }>
}

interface ExportResult {
  contacts: Record<string, unknown>[]
  exportedAt: string
  total: number
}

export function useContactsImportExport() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importContacts = async (
    contacts: Record<string, unknown>[],
    overwrite: boolean = false
  ): Promise<ImportResult> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts,
          overwrite,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao importar contatos')
      }

      const { results } = await response.json()
      return results
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao importar contatos'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const exportContacts = async (
    format: 'json' | 'csv' = 'json',
    tags?: string[]
  ): Promise<ExportResult | Blob> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.append('format', format)
      if (tags && tags.length > 0) {
        params.append('tags', tags.join(','))
      }

      const response = await fetch(`/api/contacts/export?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao exportar contatos')
      }

      if (format === 'csv') {
        return response.blob()
      } else {
        const data = await response.json()
        return data
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao exportar contatos'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = async (tags?: string[]) => {
    try {
      const blob = (await exportContacts('csv', tags)) as Blob

      // Criar link de download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `contatos-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao baixar CSV:', err)
    }
  }

  const parseCSV = (csvText: string): Record<string, unknown>[] => {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))
    const contacts = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map((v) => v.trim().replace(/"/g, ''))
      const contact: Record<string, unknown> = {}

      headers.forEach((header, index) => {
        const value = values[index] || ''

        switch (header.toLowerCase()) {
          case 'nome':
            contact.name = value
            break
          case 'telefone':
            contact.phone = value
            break
          case 'email':
            contact.email = value
            break
          case 'notas':
            contact.notes = value
            break
          case 'tags':
            contact.tags = value ? value.split(';').map((t) => t.trim()) : []
            break
        }
      })

      // Validar contato básico
      if (contact.name && contact.phone) {
        contacts.push(contact)
      }
    }

    return contacts
  }

  const handleFileUpload = (file: File): Promise<Record<string, unknown>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string
          const contacts = parseCSV(csvText)
          resolve(contacts)
        } catch (err) {
          reject(new Error('Erro ao processar arquivo CSV'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'))
      }

      reader.readAsText(file)
    })
  }

  return {
    loading,
    error,
    importContacts,
    exportContacts,
    downloadCSV,
    parseCSV,
    handleFileUpload,
  }
}
