'use client'

import { useState } from 'react'
import { useRealtimeCampaigns } from '@/hooks/use-realtime-campaigns'
import { Campaign } from '@/types/campaigns'
import { CampaignsList } from './campaigns-list'
import { CampaignForm } from './campaign-form'
import { CampaignsHeader } from './campaigns-header'

export function CampaignsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  // Note: campaigns data would need to be fetched separately
  const campaigns: Campaign[] = []
  const loading = false
  const error = null

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || campaign.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleEditCampaign = (campaignId: string) => {
    setEditingCampaign(campaignId)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCampaign(null)
  }

  const handleAddCampaign = () => {
    setEditingCampaign(null)
    setShowForm(true)
  }

  return (
    <div className="flex h-full flex-col">
      <CampaignsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onAddCampaign={handleAddCampaign}
        totalCampaigns={campaigns.length}
        filteredCount={filteredCampaigns.length}
      />

      <div className="flex-1 overflow-hidden">
        {showForm ? (
          <CampaignForm
            campaignId={editingCampaign}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        ) : (
          <CampaignsList
            campaigns={filteredCampaigns}
            loading={loading}
            error={error}
            onEditCampaign={handleEditCampaign}
          />
        )}
      </div>
    </div>
  )
}
