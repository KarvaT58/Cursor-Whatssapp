'use client'

import { useState } from 'react'
import { useRealtimeGroups } from '@/hooks/use-realtime-groups'
import { GroupsList } from './groups-list'
import { GroupForm } from './group-form'
import { GroupsHeader } from './groups-header'

export function GroupsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { groups, loading, error } = useRealtimeGroups()

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description &&
        group.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      group.whatsapp_id.includes(searchTerm)
  )

  const handleEditGroup = (groupId: string) => {
    setEditingGroup(groupId)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingGroup(null)
  }

  const handleAddGroup = () => {
    setEditingGroup(null)
    setShowForm(true)
  }

  return (
    <div className="flex h-full flex-col">
      <GroupsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddGroup={handleAddGroup}
        totalGroups={groups.length}
        filteredCount={filteredGroups.length}
      />

      <div className="flex-1 overflow-hidden">
        {showForm ? (
          <GroupForm
            groupId={editingGroup}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        ) : (
          <GroupsList
            groups={filteredGroups}
            loading={loading}
            error={error}
            onEditGroup={handleEditGroup}
          />
        )}
      </div>
    </div>
  )
}
