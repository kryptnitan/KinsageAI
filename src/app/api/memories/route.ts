import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
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

    // Fetch memories with associated family member names
    const { data: memories, error } = await supabase
      .from('memories')
      .select('*, family_members(full_name, relationship)')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ memories })
  } catch (error: any) {
    console.error('Fetch memories error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
