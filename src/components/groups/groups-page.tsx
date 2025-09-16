'use client'

import { useState } from 'react'
import { useRealtimeGroups } from '@/hooks/use-realtime-groups'
import { Group } from '@/types/groups'
import { GroupsList } from './groups-list'
import { GroupForm } from './group-form'
import { GroupsHeader } from './groups-header'

export function GroupsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  // Note: groups data would need to be fetched separately
  const groups: Group[] = []
  const loading = false
  const error = null

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
            open={showForm}
            onOpenChange={setShowForm}
            group={
              editingGroup ? groups.find((g) => g.id === editingGroup) : null
            }
            onSubmit={async () => {
              handleCloseForm()
            }}
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
