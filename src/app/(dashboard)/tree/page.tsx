import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FamilyTree from '@/components/tree/FamilyTree'

export const revalidate = 0

export default async function TreePage() {
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

  // 3. Fetch all members and relationships in parallel
  const [membersRes, relationshipsRes] = await Promise.all([
    supabase.from('family_members').select('*').eq('family_id', familyId),
    supabase.from('relationships').select('*').eq('family_id', familyId)
  ])

  return (
    <div className="h-full flex flex-col min-w-0">
      <FamilyTree 
        initialMembers={membersRes.data || []} 
        initialRelationships={relationshipsRes.data || []}
        familyId={familyId}
      />
    </div>
  )
}
