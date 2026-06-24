import OpenAI, { toFile } from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// Generate text embedding (1536 dimensions)
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY is not defined. Falling back to random embedding.')
    return Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 0.1)
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' '),
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Failed to generate OpenAI embedding:', error)
    // Fallback vector so inserts don't fail
    return Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 0.1)
  }
}

// Transcribe audio using Whisper API
export async function transcribeAudio(fileBuffer: Buffer, fileName: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return 'Audio transcription requires an active OpenAI API Key.'
  }

  try {
    // Create a File object from the buffer for OpenAI SDK compatibility
    const file = await toFile(fileBuffer, fileName, { type: 'audio/mpeg' })
    
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    })
    
    return transcription.text
  } catch (error) {
    console.error('Whisper transcription failed:', error)
    throw new Error(`Whisper transcription failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

interface AnalysisResults {
  summary: string
  insights: string
  people: string[]
  locations: string[]
  dates: string[]
  lifeLessons: string[]
  milestones: Array<{
    title: string
    description: string
    date: string
    type: string
  }>
}

// Analyze memory content using GPT for structured extraction
export async function analyzeMemoryContent(content: string, category: string): Promise<AnalysisResults> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: 'API key missing. Preloaded standard summary.',
      insights: 'AI Insights are disabled without an OpenAI API Key.',
      people: [],
      locations: [],
      dates: [],
      lifeLessons: [],
      milestones: []
    }
  }

  try {
    const prompt = `
You are Kinsage AI, a private family intelligence system.
Analyze the following family memory. Extract structure, entities, milestones, and core life lessons.

Memory Category: ${category}
Memory Content:
"""
${content}
"""

You must respond with a raw JSON object containing the exact structure below. Do not wrap in markdown code blocks like \`\`\`json. Just return raw JSON.

{
  "summary": "A concise 1-2 sentence summary of the story/experience.",
  "insights": "A paragraph explaining the historical context, emotional tone, or values conveyed in this memory.",
  "people": ["List of full names of family members mentioned. Keep names consistent."],
  "locations": ["Locations mentioned e.g., 'Chicago', 'Lake Tahoe'."],
  "dates": ["Exact dates or years mentioned. Format as YYYY-MM-DD or YYYY if approximate."],
  "lifeLessons": ["Key advice, moral, or professional guidance shared in the text."],
  "milestones": [
    {
      "title": "Short title of the milestone event",
      "description": "Description of the milestone",
      "date": "Date of event in YYYY-MM-DD format",
      "type": "Category of event (e.g., Birth, Wedding, Milestone, Business, Relocation)"
    }
  ]
}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You extract family history and details into JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })

    const text = response.choices[0].message.content || '{}'
    return JSON.parse(text) as AnalysisResults
  } catch (error) {
    console.error('GPT analysis failed:', error)
    return {
      summary: content.slice(0, 100) + '...',
      insights: 'Failed to generate insights automatically.',
      people: [],
      locations: [],
      dates: [],
      lifeLessons: [],
      milestones: []
    }
  }
}
