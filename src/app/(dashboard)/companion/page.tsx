import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompanionView from '@/components/dashboard/CompanionView'

export const revalidate = 0

export default async function CompanionPage() {
  const supabase = await createClient()

  // 1. Hardcoded Demo User for free access
  const user = { id: '00000000-0000-0000-0000-000000000000' }

  // 2. Fetch conversations list for sidebar history
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="h-full flex flex-col min-w-0">
      <CompanionView initialConversations={conversations || []} />
    </div>
  )
}
