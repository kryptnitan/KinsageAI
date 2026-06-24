import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UploadForm from '@/components/dashboard/UploadForm'

export const revalidate = 0

export default async function UploadPage() {
  const supabase = await createClient()

  // 1. Hardcoded Demo User for free access
  const user = { id: '00000000-0000-0000-0000-000000000000' }

  // 2. Get active family
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

  // 3. Fetch Family Members for dropdown selection
  const { data: members } = await supabase
    .from('family_members')
    .select('id, full_name, relationship')
    .eq('family_id', familyId)
    .order('full_name')

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Upload Family Memory</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Capture and preserve oral histories, images, documents, or stories in your secure AI vault.
        </p>
      </div>

      <UploadForm members={members || []} />
    </div>
  )
}
