import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TimelineView from '@/components/timeline/TimelineView'

export const revalidate = 0

export default async function TimelinePage() {
  const supabase = await createClient()

  // 1. Hardcoded Demo User for free access
  const user = { id: '00000000-0000-0000-0000-000000000000' }

  // 2. Get active family (auto-created if missing)
  let { data: families } = await supabase
    .from('families')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)

  if (!families || families.length === 0) {
    const { data: newFamily } = await supabase
      .from('families')
      .insert({
        id: '11111111-1111-1111-1111-111111111111',
        owner_id: user.id,
        family_name: 'The Sterling Family Archive',
        description: 'Preserving the legacy, wisdom, and memories of the Sterling family across three generations.'
      })
      .select('id')
      .single()

    if (newFamily) {
      families = [newFamily]
    }
  }

  const familyId = (families && families[0]?.id) || '11111111-1111-1111-1111-111111111111'

  // 3. Fetch timeline events
  const { data: events, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('family_id', familyId)
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Failed to fetch timeline events:', error)
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Family Timeline</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Chronological milestone timeline dynamically compiled from your family stories and archives.
        </p>
      </div>

      <TimelineView initialEvents={events || []} />
    </div>
  )
}
