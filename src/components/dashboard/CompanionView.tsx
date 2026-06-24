'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Sparkles, Plus, Clock, MessageSquare, 
  BookOpen, FileText, ChevronRight, HelpCircle, ArrowRight
} from 'lucide-react'
import KinsageLogo from '@/components/KinsageLogo'
import { createClient } from '@/lib/supabase/client'

interface Conversation {
  id: string
  created_at: string
}

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  citations?: any[]
}

const SUGGESTIONS = [
  "What advice did Grandpa Arthur share about business?",
  "What traditions or holiday recipes have been passed down?",
  "Tell me our family's migration story."
]

export default function CompanionView({ 
  initialConversations 
}: { 
  initialConversations: Conversation[] 
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch past messages when conversation selection changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: pastMessages, error } = await supabase
          .from('messages')
          .select('id, role, content, created_at')
          .eq('conversation_id', activeConvId)
          .order('created_at', { ascending: true })

        if (!error && pastMessages) {
          setMessages(pastMessages.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content
          })))
        }
      } catch (err) {
        console.error('Failed to load past messages:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [activeConvId])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    const userMessage: Message = { role: 'user', content: textToSend }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          conversationId: activeConvId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Server failed to respond')
      }

      // If a new conversation was created on the server
      if (!activeConvId && data.conversationId) {
        setActiveConvId(data.conversationId)
        // Add to list
        setConversations(prev => [
          { id: data.conversationId, created_at: new Date().toISOString() },
          ...prev
        ])
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        citations: data.citations || []
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while retrieving your family vault memories. Please check your OpenAI API configurations.' 
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const startNewChat = () => {
    setActiveConvId(null)
    setMessages([])
  }

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      
      {/* Conversations Sidebar (Left side) */}
      <div className="hidden lg:flex flex-col w-64 border-r border-[#1c2541] bg-[#0b132b]/20 flex-shrink-0">
        
        {/* New Chat Button */}
        <div className="p-4 flex-shrink-0">
          <button
            onClick={startNewChat}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-primary/10 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-3 block mb-2">History</span>
          
          {conversations.length === 0 ? (
            <span className="text-xs text-muted-foreground px-3 block italic">No history yet</span>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors border ${
                  activeConvId === conv.id 
                    ? 'bg-[#1c2541]/40 border-primary/20 text-primary font-semibold' 
                    : 'border-transparent hover:bg-[#1c2541]/20 text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs truncate flex-1">
                  {new Date(conv.created_at).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))
          )}
        </div>

      </div>

      {/* Chat Canvas (Right side) */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-background relative">
        
        {/* Chat Title bar */}
        <div className="border-b border-[#1c2541] px-6 py-4 flex items-center justify-between flex-shrink-0 bg-background/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">AI Family Companion</h2>
              <span className="text-[10px] text-muted-foreground leading-none">RAG Retrieval Augmented Intelligence</span>
            </div>
          </div>

          <button 
            onClick={startNewChat}
            className="lg:hidden bg-secondary border border-[#1c2541] hover:bg-secondary/80 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Message Panel Scroll area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {messages.length === 0 && !loading ? (
            /* Empty state chat guides */
            <div className="max-w-xl mx-auto py-12 md:py-20 text-center space-y-8">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-primary/10 border border-primary/25 rounded-full flex items-center justify-center text-primary">
                  <KinsageLogo className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display">Ask the Family Archive</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter questions to search and explore family stories, recipes, business details, or historical letters semantically.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid gap-3 text-left">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block text-center mb-1">
                  Suggested Prompts
                </span>
                {SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sug)}
                    className="w-full bg-[#0b132b]/40 border border-[#1c2541]/80 hover:border-primary/25 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold transition-all hover:-translate-y-0.5"
                  >
                    <span>{sug}</span>
                    <ArrowRight className="w-4 h-4 text-primary ml-4 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Dialogue logs */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-4 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-[#0b132b] border border-primary/25 flex items-center justify-center flex-shrink-0">
                      <KinsageLogo className="w-4 h-4" />
                    </div>
                  )}

                  <div 
                    className={`p-5 rounded-2xl max-w-[85%] space-y-4 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' 
                        : 'bg-[#0b132b]/50 border border-[#1c2541]/80 rounded-tl-none leading-relaxed text-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 text-[10px] text-primary uppercase font-bold tracking-widest">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Kinsage Companion</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Citations block */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="pt-3 border-t border-[#1c2541]/50 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Retrieved Reference Sources:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((cit, cIdx) => (
                            <div 
                              key={cIdx} 
                              className="inline-flex items-center gap-1.5 bg-[#1c2541]/60 border border-[#1c2541] px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{cit.title}</span>
                              {cit.memory_date && (
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  ({new Date(cit.memory_date).getFullYear()})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 uppercase select-none">
                      me
                    </div>
                  )}

                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-4 items-start justify-start">
                  <div className="w-8 h-8 rounded-lg bg-[#0b132b] border border-primary/25 flex items-center justify-center flex-shrink-0">
                    <KinsageLogo className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-[#0b132b]/50 border border-[#1c2541]/80 p-5 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* Input Text Form footer */}
        <div className="p-4 border-t border-[#1c2541] bg-background/30 flex-shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="max-w-3xl mx-auto flex gap-3 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask a question about family immigration, recipes, or business advice..."
              className="w-full bg-background border border-[#1c2541] hover:border-primary/20 focus:border-primary rounded-xl py-3 px-4 text-sm outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 transition-all disabled:opacity-40 active:scale-[0.98] flex-shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  )
}
