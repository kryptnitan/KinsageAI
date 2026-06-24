import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/openai'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

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

    // 3. Generate query embedding
    const embedding = await generateEmbedding(query)

    // 4. Query pgvector matching RPC function
    const { data: memories, error } = await supabase.rpc('match_memories', {
      query_embedding: embedding,
      match_threshold: 0.2, // Cosine similarity threshold
      match_count: 8,       // Limit returns
      p_family_id: familyId
    })

    if (error) {
      console.error('match_memories rpc error:', error)
      throw error
    }

    return NextResponse.json({ memories })
  } catch (error: any) {
    console.error('Vector search API error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
