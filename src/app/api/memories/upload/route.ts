import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { analyzeMemoryContent, generateEmbedding, transcribeAudio } from '@/lib/openai'

export async function POST(request: Request) {
  try {
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

    // 3. Read form data
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const memberId = formData.get('memberId') as string || null
    const memoryDate = formData.get('memoryDate') as string || null
    const file = formData.get('file') as File | null

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and Category are required' }, { status: 400 })
    }

    let mediaUrl = null
    let content = description || ''

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Determine bucket based on file type
      let bucket = 'documents'
      if (file.type.startsWith('image/')) {
        bucket = 'photos'
      } else if (file.type.startsWith('audio/')) {
        bucket = 'audio'
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`

      // Upload file to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true
        })

      if (storageError) {
        throw new Error(`Failed to upload file to storage: ${storageError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      mediaUrl = publicUrl

      // If audio file, run Whisper transcription
      if (bucket === 'audio') {
        try {
          const transcriptionText = await transcribeAudio(buffer, file.name)
          if (transcriptionText) {
            content = transcriptionText
          }
        } catch (whisperError) {
          console.error('Whisper processing failed, saving fallback:', whisperError)
          content = `[Audio Recording uploaded: ${file.name} - Transcription unavailable]`
        }
      }
    }

    // Override content if textual text is supplied explicitly
    const textContent = formData.get('content') as string
    if (textContent) {
      content = textContent
    }

    // 4. Run AI analysis
    const analysis = await analyzeMemoryContent(content, category)

    // 5. Generate Vector Embedding
    const textToEmbed = `${title} ${description} ${content} ${analysis.summary}`
    const embedding = await generateEmbedding(textToEmbed)

    // 6. Save memory
    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .insert({
        family_id: familyId,
        member_id: !memberId || memberId === 'none' ? null : memberId,
        title,
        description: description || null,
        content: content || null,
        category,
        memory_date: memoryDate || null,
        media_url: mediaUrl,
        summary: analysis.summary || null,
        embedding
      })
      .select()
      .single()

    if (memoryError) {
      throw new Error(`Failed to save memory: ${memoryError.message}`)
    }

    // 7. Insert extracted timeline milestones
    if (analysis.milestones && analysis.milestones.length > 0) {
      const timelineEvents = analysis.milestones.map((milestone) => ({
        family_id: familyId,
        title: milestone.title,
        description: milestone.description,
        event_date: milestone.date || memoryDate || new Date().toISOString().split('T')[0],
        event_type: milestone.type || 'Milestone'
      }))

      await supabase.from('timeline_events').insert(timelineEvents)
    }

    return NextResponse.json({ success: true, memory })
  } catch (error: any) {
    console.error('Upload processing route error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
