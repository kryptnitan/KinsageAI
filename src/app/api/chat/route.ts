import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/openai'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Hardcoded Demo User for free access
    const user = { id: '00000000-0000-0000-0000-000000000000' }

    // 2. Get active family (auto-created if missing)
    let { data: families } = await supabase
      .from('families')
      .select('id, family_name')
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
        .select('id, family_name')
        .single()

      if (newFamily) {
        families = [newFamily]
      }
    }

    const family = (families && families[0]) || {
      id: '11111111-1111-1111-1111-111111111111',
      family_name: 'The Sterling Family Archive'
    }
    const familyId = family.id

    // 3. Read request messages
    const { messages, conversationId } = await request.json()
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const userQuery = lastMessage.content

    // 4. Generate user query embedding
    const queryEmbedding = await generateEmbedding(userQuery)

    // 5. Query matching memories via pgvector RPC
    const { data: matchedMemories, error: rpcError } = await supabase.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_threshold: 0.15, // Retrieve anything matching 15%+
      match_count: 5,        // Top 5 memories
      p_family_id: familyId
    })

    if (rpcError) {
      console.error('RPC match_memories error:', rpcError)
      throw rpcError
    }

    // 6. Formulate system prompt with retrieved context
    let contextText = ''
    if (matchedMemories && matchedMemories.length > 0) {
      contextText = matchedMemories.map((m: any) => 
        `Source Memory: "${m.title}"\nCategory: ${m.category}\nDate: ${m.memory_date || 'Unknown'}\nSummary: ${m.summary || ''}\nStory Text: ${m.content || m.description || ''}\n`
      ).join('\n---\n')
    } else {
      contextText = 'No matching memories found in the private family vault.'
    }

    const systemPrompt = `
You are the Kinsage AI Family Companion, a private, warm, and highly detail-oriented intelligence assistant for the "${family.family_name}" vault.
Your goal is to help family members learn, search, and remember their ancestral stories, oral histories, business wisdom, traditions, and life lessons.

Use the following retrieved context memories from the private family vault to answer the user's questions:
"""
${contextText}
"""

Guidelines:
1. Base your answer strictly on the provided context. If the context does not contain the information requested, explain warmly that the vault does not have records of this yet, and suggest they upload a new story or audio recording about it.
2. Maintain a warm, respectful, and family-archivist tone.
3. Reference the titles of source memories as citations when you make claims (e.g. "...as Eleanor detailed in 'Grandma Eleanor's Famous Apple Pie Recipe'").
4. Refer to family members by their names and relationships.
`

    // 7. Call OpenAI chat completions
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages as any,
      temperature: 0.4
    })

    const assistantResponse = completion.choices[0].message.content || 'I could not synthesize a response.'

    // 8. Save messages to Database
    // Note: If conversationId is passed, save them. If not, create a new conversation
    let activeConversationId = conversationId
    if (!activeConversationId) {
      const { data: newConv, error: convError } = await supabase.from('conversations')
        .insert({
          family_id: familyId,
          user_id: user.id
        })
        .select()
        .single()
      
      if (!convError && newConv) {
        activeConversationId = newConv.id
      }
    }

    if (activeConversationId) {
      // Save user message
      await supabase.from('messages').insert({
        conversation_id: activeConversationId,
        role: 'user',
        content: userQuery
      })
      // Save assistant message
      await supabase.from('messages').insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: assistantResponse
      })
    }

    return NextResponse.json({
      content: assistantResponse,
      citations: matchedMemories || [],
      conversationId: activeConversationId
    })

  } catch (error: any) {
    console.error('AI Companion Chat API error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
