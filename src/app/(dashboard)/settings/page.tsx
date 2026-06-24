import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsView from '@/components/dashboard/SettingsView'

export const revalidate = 0

export default async function SettingsPage() {
  const supabase = await createClient()

  // 1. Hardcoded Demo User for free access
  const user = { id: '00000000-0000-0000-0000-000000000000', email: 'demo@kinsage.ai' }

  // 2. Fetch active family (auto-created if missing)
  let { data: family, error } = await supabase
    .from('families')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (error || !family) {
    const { data: newFamily } = await supabase
      .from('families')
      .insert({
        id: '11111111-1111-1111-1111-111111111111',
        owner_id: user.id,
        family_name: 'The Sterling Family Archive',
        description: 'Preserving the legacy, wisdom, and memories of the Sterling family across three generations.'
      })
      .select('*')
      .single()

    if (newFamily) {
      family = newFamily
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Vault Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Customize your Family Archive settings, credentials, and manage testing data configurations.
        </p>
      </div>

      <SettingsView family={family} userEmail={user.email || ''} />
    </div>
  )
}
